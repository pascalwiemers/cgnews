import Link from "next/link"

import { deleteCommentAction } from "@/lib/actions"
import { getOptionalCurrentUser } from "@/lib/auth"
import { listStoryComments, StoryComment } from "@/lib/data"
import { HnItem } from "@/lib/hn-types"
import { timeAgo } from "@/lib/time-utils"
import { cn } from "@/lib/utils"

import ReplyDialog from "./reply-dialog"

type VoidFormAction = (formData: FormData) => Promise<void>

const deleteCommentFormAction = deleteCommentAction as unknown as VoidFormAction

export default async function Comments({
  story,
  ids,
}: {
  story: HnItem
  ids: number[]
}) {
  const comments = await listStoryComments(story.id)
  const cu = await getOptionalCurrentUser()
  const myId = cu?.username || cu?.id
  if (!comments.length) {
    return (
      <div className="signal-panel border-dashed px-4 py-6 text-sm leading-6 text-muted-foreground sm:px-5">
        <div className="metadata-label mb-2 text-primary">no telemetry</div>
        No comments yet. Start the production notes here.
      </div>
    )
  }
  return (
    <ol className="space-y-3">
      {comments.map((comment) => (
        <CommentThread
          key={comment.id}
          comment={comment}
          currentUserId={myId}
          depth={0}
          story={story}
        />
      ))}
    </ol>
  )
}

function CommentThread({
  comment,
  currentUserId,
  depth,
  story,
}: {
  comment: StoryComment
  currentUserId?: string | null
  depth: number
  story: HnItem
}) {
  const canDelete =
    currentUserId === comment.by &&
    Date.now() / 1000 - comment.time <= 2 * 60 * 60

  return (
    <li
      className={cn(
        "relative min-w-0 text-sm",
        depth > 0 && "ml-2 border-l border-primary/25 pl-3 sm:ml-3 sm:pl-4"
      )}
    >
      <div
        className={cn(
          "relative min-w-0 overflow-hidden rounded-md border border-border/70 bg-card/75 p-3 shadow-[inset_0_1px_0_hsl(var(--foreground)/0.04)] sm:px-4",
          depth > 0 && "border-l-primary/35 bg-card/55"
        )}
      >
        <div className="absolute inset-y-0 left-0 w-1 bg-primary/20" />
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 pl-1 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
          <Link
            rel="noreferrer nofollow"
            className="max-w-full truncate text-foreground/80 hover:text-primary hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55"
            href={`/user?id=${comment.by}`}
          >
            {comment.by}
          </Link>
          <span aria-hidden="true" className="text-border">
            /
          </span>
          <span>{timeAgo(comment.time)} ago</span>
          <span aria-hidden="true" className="text-border">
            /
          </span>
          <ReplyDialog comment={comment} storyId={story.id} />
          {canDelete && (
            <>
              <span aria-hidden="true" className="text-border">
                /
              </span>
              <form action={deleteCommentFormAction} className="inline-flex">
                <input type="hidden" name="commentId" value={comment.id} />
                <input type="hidden" name="storyId" value={story.id} />
                <button
                  type="submit"
                  className="rounded-sm text-[11px] text-muted-foreground underline-offset-4 hover:text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55"
                  aria-label={`Delete comment by ${comment.by}`}
                >
                  delete
                </button>
              </form>
            </>
          )}
        </div>
        <div className="mt-2 whitespace-pre-wrap break-words pl-1 text-[15px] leading-7 text-foreground/90">
          {comment.text}
        </div>
      </div>
      {comment.comments.length > 0 && (
        <ol className="mt-2 space-y-2">
          {comment.comments.map((child) => (
            <CommentThread
              key={child.id}
              comment={child}
              currentUserId={currentUserId}
              depth={depth + 1}
              story={story}
            />
          ))}
        </ol>
      )}
    </li>
  )
}
