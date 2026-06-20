"use client"

import { useState } from "react"
import Link from "next/link"
import { MinusCircle, PlusCircle } from "lucide-react"

import { HnWebThread } from "@/lib/hn-web-types"
import { cn } from "@/lib/utils"
import HtmlText from "@/components/html-text"

export default function Thread({ comment }: { comment: HnWebThread }) {
  const [collapse, setCollapse] = useState(true)

  const replies = comment.kids
  return (
    <article className="group/thread flex min-w-0 gap-2">
      <button
        type="button"
        aria-expanded={collapse}
        className="command-focus mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border border-border/70 bg-secondary/40 text-muted-foreground transition-colors hover:border-primary/35 hover:bg-secondary/70 hover:text-foreground"
        onClick={() => setCollapse(!collapse)}
      >
        {collapse ? (
          <MinusCircle size={12} aria-hidden="true" />
        ) : (
          <PlusCircle size={12} aria-hidden="true" />
        )}
        <span className="sr-only">
          {collapse ? "Collapse comment" : "Expand comment"}
        </span>
      </button>

      <div className="min-w-0 flex-1 border-l border-border/60 pl-3 transition-colors group-hover/thread:border-primary/30">
        <div className="metadata-label flex flex-row flex-wrap items-center justify-start gap-x-1.5 gap-y-1">
          <Link
            rel="noreferrer nofollow"
            className="break-all text-foreground/90 transition-colors hover:text-primary hover:underline"
            href={`/user?id=${comment.userId}`}
          >
            {comment.userId}
          </Link>
          <span>•</span>
          <div>{comment.age}</div>
          {comment.onStory && (
            <>
              <span>•</span>
              <Link
                rel="noreferrer nofollow"
                href={comment.storyLink || ""}
                className="min-w-0 max-w-full break-words transition-colors hover:text-primary hover:underline"
              >
                on: {comment.onStory}
              </Link>
            </>
          )}
        </div>
        <div
          className={cn(
            `grid transition-all duration-300 ease-in-out`,
            `${collapse ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`
          )}
        >
          <div className="overflow-hidden">
            <div className="mb-2 text-sm leading-6 [overflow-wrap:anywhere]">
              <HtmlText innerHtml={comment.commentHtml} />
            </div>
            {replies && replies.length > 0 && (
              <div className="space-y-3 pt-1">
                {replies.map((comment) => {
                  return <Thread key={comment?.id} comment={comment} />
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
