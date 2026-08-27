"use client"

import Link from "next/link"
import { useCurrentUser } from "@/hooks"

import { HnComment } from "@/lib/hn-types"
import { inTwoWeeks } from "@/lib/time-utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import ReplyForm from "./reply-form"

type ReplyTarget = Pick<HnComment, "id" | "by" | "text" | "time">

export default function ReplyDialog({
  comment,
  storyId,
}: {
  comment: ReplyTarget
  storyId: number
}) {
  const currentUser = useCurrentUser()
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size={"sm"}
          className="h-auto rounded-sm p-0 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-primary focus-visible:ring-ring/55"
          variant={"link"}
          disabled={!inTwoWeeks(comment.time)}
          aria-label={`Reply to ${comment.by}`}
        >
          reply
        </Button>
      </DialogTrigger>
      <DialogContent
        className="border-border/80 bg-card text-card-foreground sm:rounded-xl"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-lg leading-tight">
            Reply to{" "}
            <Link
              rel="noreferrer nofollow"
              href={{
                pathname: "/user",
                query: { id: comment.by },
              }}
              className="break-words text-muted-foreground underline"
              target="_blank"
            >
              {comment.by}
            </Link>
          </DialogTitle>
          {comment.text && (
            <DialogDescription className="max-h-[260px] overflow-y-auto whitespace-pre-wrap break-words rounded-lg border border-border/70 bg-background/50 p-3 leading-6 text-muted-foreground">
              {comment.text}
            </DialogDescription>
          )}
        </DialogHeader>
        <ReplyForm
          storyId={storyId}
          parentId={comment.id}
          text="Reply"
          position="right"
          logined={currentUser != null}
        />
      </DialogContent>
    </Dialog>
  )
}
