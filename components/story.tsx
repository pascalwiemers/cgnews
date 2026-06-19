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
    <div className="panel panel-hover mb-2 flex flex-row px-4 py-3.5">
      {voteState === "visiable" && (
        <Vote storyId={data.id} upvoted={data.upvoted} state="visiable" />
      )}
      {voteState === "invisible" && <div className="invisible w-4"></div>}
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="mt-0.5 grid size-[22px] shrink-0 place-items-center rounded-sm border border-border/50 bg-accent/30 text-[10px] font-bold text-accent-foreground">
          {badge}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1">
            <Link
              className={cn(
                "hn-story-link text-[1.05rem] font-semibold leading-tight tracking-[-0.005em]",
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
                className="hn-story-link ml-2 text-xs text-muted-foreground/80"
                href={`/search?query=${data.sitestr}&sort=byDate`}
                rel="noopener noreferrer nofollow"
              >
                ({data.sitestr})
              </Link>
            )}
            <StoryDisclosureLabels
              className="ml-2 align-middle"
              isSelfPromo={data.isSelfPromo}
              commercialDisclosure={data.commercialDisclosure}
            />
          </div>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground/80 sm:gap-6">
            {!hidePoints && <StoryPoint score={data.score} />}
            {!hideUsername && <StoryBy by={data.by} />}
            {!hideAge && <StoryTime time={data.age} />}
            {!hideCommentCount && data.comments && (
              <StoryCommentCount storyId={data.id} count={data.comments} />
            )}
            {!hideFave && <Fave storyId={data.id} faved={true} />}
          </div>
        </div>
        {/* sparkline removed */}
      </div>
    </div>
  )
}
