"use client"

import { useState } from "react"
import Link from "next/link"
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react"

import { HnComment, HnItem } from "@/lib/hn-types"
import { timeAgo } from "@/lib/time-utils"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import HtmlText from "@/components/html-text"
import Vote from "@/components/vote"

import ReplyDialog from "./reply-dialog"

export default function Comment({
  comment,
  story,
}: {
  comment: HnComment
  story?: HnItem
}) {
  const isOp = story?.by === comment.by
  const [collapse, setCollapse] = useState(true)
  if (comment.deleted || comment.dead) {
    return <></>
  }

  const replies = comment.comments
  return (
    <div className="flex min-w-0 flex-col justify-start rounded-md border border-border/60 bg-card/55 p-3 shadow-[inset_0_1px_0_hsl(var(--foreground)/0.04)]">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
        <Vote storyId={comment.id} state={"visiable"} />{" "}
        <Link
          rel="nofollow noreferrer"
          className="max-w-full truncate text-foreground/80 hover:text-primary hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55"
          href={{
            pathname: "/user",
            query: { id: comment.by },
          }}
        >
          {comment.by}
        </Link>
        {isOp && (
          <Badge
            variant={"outline"}
            className="rounded-sm border-primary/30 bg-primary/10 px-1.5 py-0 font-mono text-[10px] text-primary"
          >
            OP
          </Badge>
        )}
        <span aria-hidden="true" className="text-border">
          /
        </span>
        <Link
          rel="nofollow noreferrer"
          className="text-muted-foreground hover:text-primary hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55"
          href={{ pathname: "/item", query: { id: comment.id } }}
        >
          {timeAgo(comment.time)} ago
        </Link>
      </div>
      {comment.text && (
        <div className="mt-2 min-w-0 pl-5">
          <HtmlText
            className="block break-words text-[15px] leading-7 text-foreground/90"
            innerHtml={comment.text}
          />
          <div className="mt-1 flex flex-row items-center space-x-2">
            {replies && replies.length > 0 && (
              <button
                type="button"
                className="grid size-7 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55"
                onClick={() => setCollapse(!collapse)}
                aria-expanded={collapse}
                aria-label={collapse ? "Collapse replies" : "Expand replies"}
              >
                {collapse ? (
                  <MinusCircleIcon size={14} />
                ) : (
                  <PlusCircleIcon size={14} />
                )}
              </button>
            )}
            {!story?.dead && story?.id && (
              <ReplyDialog comment={comment} storyId={story.id} />
            )}
          </div>
        </div>
      )}
      {replies && replies.length > 0 && (
        <div
          className={cn(
            `grid overflow-hidden transition-all duration-300 ease-in-out`,
            `${collapse ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`
          )}
        >
          <div className="mt-2 space-y-2 overflow-hidden border-l border-primary/25 pl-3 sm:pl-4 md:pl-6">
            {replies.map((comment) => {
              return (
                <Comment key={comment?.id} comment={comment} story={story} />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
