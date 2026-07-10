"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

import {
  hideCommentCount,
  hideScore,
  hideUsername,
  hideVote,
  hnItem2HnWebStory,
} from "@/lib/hn-item-utils"
import { HnItem } from "@/lib/hn-types"
import Story from "@/components/story"

type FeedCommandCenterProps = {
  stories: HnItem[]
  offset: number
  moreLink?: string
}

export default function FeedCommandCenter({
  stories,
  offset,
  moreLink,
}: FeedCommandCenterProps) {
  if (!stories.length) {
    return (
      <section className="glass-panel grid min-h-64 place-items-center px-5 py-14 text-center">
        <div className="space-y-3">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            Feed clear
          </p>
          <h1 className="gradient-heading text-2xl font-semibold tracking-tight">
            No stories found
          </h1>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Try another feed or a broader search phrase.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="reveal-up space-y-4">
      <div className="flex items-baseline justify-between border-b border-white/[0.06] pb-2">
        <h1 className="text-sm font-semibold tracking-tight text-foreground">
          Top stories
        </h1>
        <span className="font-mono text-[10px] text-muted-foreground/70">
          {stories.length} stories
        </span>
      </div>

      <div className="space-y-0.5">
        {stories.map((story, index) => (
          <Story
            key={story.id}
            rank={offset + index}
            data={hnItem2HnWebStory(story)}
            hideVote={hideVote(story.type)}
            hidePoints={hideScore(story.type)}
            hideCommentCount={hideCommentCount(story.type)}
            hideUsername={hideUsername(story.type)}
          />
        ))}
      </div>

      {moreLink && (
        <div className="pl-14 pt-1 sm:pl-[4.25rem]">
          <Link
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            href={moreLink}
            prefetch={false}
            scroll={true}
          >
            More stories
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  )
}
