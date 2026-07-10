"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { getVoteState } from "@/lib/hn-item-utils"
import { HnWebStory } from "@/lib/hn-web-types"
import { cn } from "@/lib/utils"
import StoryBy from "@/components/story-by"
import StoryCommentCount from "@/components/story-comment-count"
import StoryDisclosureLabels from "@/components/story-disclosure-labels"
import StoryPoint from "@/components/story-point"
import StoryTime from "@/components/story-time"
import Vote from "@/components/vote"

import Fave from "./fave"

type Props = {
  data: HnWebStory
  hideVote: boolean
  rank?: number
  hidePoints?: boolean
  hideUsername?: boolean
  hideAge?: boolean
  hideCommentCount?: boolean
  hideFave?: boolean
}

export default function Story({
  data,
  hideVote = false,
  rank,
  hidePoints = false,
  hideUsername = false,
  hideAge = false,
  hideCommentCount = false,
  hideFave = true,
}: Props) {
  const pathname = usePathname()
  const voteState = getVoteState(pathname, hideVote)
  const displayRank = data.rank || (rank ? String(rank) : "")
  const exceptionalType =
    data.storyType && data.storyType !== "LINK" ? data.storyType : null

  return (
    <article className="group grid min-w-0 grid-cols-[2rem_1.5rem_minmax(0,1fr)] rounded-md py-1 transition-colors duration-200 hover:bg-white/[0.025] sm:grid-cols-[2.75rem_1.5rem_minmax(0,1fr)]">
      <div className="grid place-items-start justify-end pt-[0.72rem] font-mono text-[11px] tabular-nums text-muted-foreground/55">
        {displayRank ? displayRank.padStart(2, "0") : "—"}
      </div>
      <div className="flex items-start justify-center pt-[0.68rem]">
        {voteState === "visiable" && (
          <Vote storyId={data.id} upvoted={data.upvoted} state="visiable" />
        )}
        {voteState === "invisible" && <div className="invisible w-4" />}
      </div>
      <div className="flex min-w-0 items-start gap-2 py-2 pr-2 sm:pr-4">
        <div className="min-w-0 flex-1">
          <h2 className="m-0 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
            <Link
              className={cn(
                "hn-story-link min-w-0 break-words text-[15px] font-medium leading-[1.35] tracking-[-0.005em] transition-colors sm:text-[16px]",
                data.dead
                  ? "text-muted-foreground"
                  : "text-foreground/95 group-hover:text-white"
              )}
              href={data.dead ? "" : data.url || `item?id=${data.id}`}
              rel="noopener noreferrer nofollow"
              target={data.url ? "_blank" : "_self"}
            >
              {(data.dead ? "[dead] " : "") + data.title}
            </Link>
            {data.sitestr && (
              <Link
                className="hn-story-link max-w-full break-all text-[11.5px] font-normal text-muted-foreground/60 transition-colors hover:text-primary"
                href={`/search?query=${data.sitestr}&sort=byDate`}
                rel="noopener noreferrer nofollow"
              >
                {data.sitestr}
              </Link>
            )}
            {exceptionalType && (
              <span className="rounded bg-primary px-1.5 py-px font-mono text-[9px] font-semibold uppercase tracking-wide text-white">
                {exceptionalType}
              </span>
            )}
            <StoryDisclosureLabels
              className="align-middle"
              isSelfPromo={data.isSelfPromo}
              commercialDisclosure={data.commercialDisclosure}
              compact
            />
          </h2>
          <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] leading-4 text-muted-foreground/70">
            {!hidePoints && <StoryPoint score={data.score} />}
            {!hideUsername && <StoryBy by={data.by} />}
            {!hideAge && <StoryTime time={data.age} />}
            {!hideCommentCount && data.comments && (
              <StoryCommentCount storyId={data.id} count={data.comments} />
            )}
          </div>
        </div>
        {!hideFave && (
          <div className="shrink-0 pt-0.5">
            <Fave storyId={data.id} faved={true} />
          </div>
        )}
      </div>
    </article>
  )
}
