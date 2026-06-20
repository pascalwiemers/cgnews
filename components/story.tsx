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
  hidePoints?: boolean
  hideUsername?: boolean
  hideAge?: boolean
  hideCommentCount?: boolean
  hideFave?: boolean
}

function getTypeBadgeLetter(url?: string, sitestr?: string) {
  // Simple heuristic to derive badge: News (N) default, Ask (A), Show (S), Job (J)
  if (!url && !sitestr) return "N"
  const s = (url || sitestr || "").toLowerCase()
  if (s.includes("ask")) return "A"
  if (s.includes("show")) return "S"
  if (s.includes("jobs") || s.includes("job")) return "J"
  return "N"
}

function getStoryTypeBadgeLetter(storyType?: HnWebStory["storyType"]) {
  if (storyType === "ASK") return "A"
  if (storyType === "SHOW") return "S"
  if (storyType === "JOB") return "J"
  if (storyType === "LINK") return "L"
  return undefined
}

export default function Story({
  data,
  hideVote = false,
  hidePoints = false,
  hideUsername = false,
  hideAge = false,
  hideCommentCount = false,
  hideFave = true,
}: Props) {
  const pathname = usePathname()
  const voteState = getVoteState(pathname, hideVote)
  const badge =
    getStoryTypeBadgeLetter(data.storyType) ||
    getTypeBadgeLetter(data.url, data.sitestr)
  return (
    <article className="panel panel-hover mb-2 flex min-w-0 flex-row p-3 sm:px-4">
      <div className="flex w-7 shrink-0 justify-start pt-0.5">
        {voteState === "visiable" && (
          <Vote storyId={data.id} upvoted={data.upvoted} state="visiable" />
        )}
        {voteState === "invisible" && <div className="invisible w-4" />}
      </div>
      <div className="flex min-w-0 flex-1 items-start gap-2.5 sm:gap-3">
        <div
          className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-sm border border-primary/20 bg-primary/10 font-mono text-[10px] font-bold text-primary shadow-[inset_0_0_0_1px_hsl(var(--foreground)/0.02)]"
          aria-label={`Story type ${badge}`}
          title={`Story type ${badge}`}
        >
          {badge}
        </div>
        <div className="min-w-0 flex-1 pr-1">
          <h2 className="m-0 flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
            <Link
              className={cn(
                "hn-story-link min-w-0 break-words font-sans text-[1rem] font-semibold leading-snug text-foreground sm:text-[1.04rem]",
                data.dead
                  ? "text-muted-foreground"
                  : "text-foreground hover:text-primary"
              )}
              href={data.dead ? "" : data.url || `item?id=${data.id}`}
              rel="noopener noreferrer nofollow"
              target={data.url ? "_blank" : "_self"}
            >
              {(data.dead ? "[dead] " : "") + data.title}
            </Link>
            {data.sitestr && (
              <Link
                className="hn-story-link max-w-full break-all font-mono text-[11px] leading-tight text-muted-foreground/70 hover:text-muted-foreground"
                href={`/search?query=${data.sitestr}&sort=byDate`}
                rel="noopener noreferrer nofollow"
              >
                {data.sitestr}
              </Link>
            )}
            <StoryDisclosureLabels
              className="align-middle"
              isSelfPromo={data.isSelfPromo}
              commercialDisclosure={data.commercialDisclosure}
            />
          </h2>
          <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground/75 sm:gap-x-4">
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
