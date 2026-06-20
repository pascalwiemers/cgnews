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

export interface Props {
  stories: HnItem[]
  offset?: number
  moreLink?: string
}

export default function ItemList({ stories, offset = 1, moreLink }: Props) {
  return (
    <>
      <div className="space-y-1.5">
        {stories.map((story) => (
          <Story
            key={story.id}
            data={hnItem2HnWebStory(story)}
            hideVote={hideVote(story.type)}
            hidePoints={hideScore(story.type)}
            hideCommentCount={hideCommentCount(story.type)}
            hideUsername={hideUsername(story.type)}
          />
        ))}
      </div>
      <div className="flex justify-center pt-5">
        {moreLink && (
          <Link
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border/70 bg-secondary/40 px-4 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-foreground/80 transition-colors hover:border-primary/40 hover:bg-secondary/70 hover:text-primary hover:no-underline"
            href={moreLink}
            prefetch={false}
            scroll={true}
          >
            More
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        )}
      </div>
    </>
  )
}
