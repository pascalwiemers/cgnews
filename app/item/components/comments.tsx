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
      <div className="panel border-dashed px-4 py-6 text-sm text-muted-foreground">
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
        "min-w-0 text-sm",
        depth > 0 && "border-l border-border/70 pl-3 md:pl-4"
      )}
    >
      <div
        className={cn(
          "relative min-w-0 rounded-sm border border-border/50 bg-card/35 px-3 py-2.5",
          depth > 0 && "border-l-0 bg-card/25"
        )}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-muted-foreground">
          <Link
            rel="noreferrer nofollow"
            className="max-w-full truncate text-muted-foreground hover:text-primary hover:no-underline"
            href={`/user?id=${comment.by}`}
          >
            {comment.by}
          </Link>
          <span aria-hidden="true">/</span>
          <span>{timeAgo(comment.time)} ago</span>
          <span aria-hidden="true">/</span>
          <ReplyDialog comment={comment} storyId={story.id} />
          {canDelete && (
            <>
              <span aria-hidden="true">/</span>
              <form action={deleteCommentFormAction} className="inline-flex">
                <input type="hidden" name="commentId" value={comment.id} />
                <input type="hidden" name="storyId" value={story.id} />
                <button
                  type="submit"
                  className="rounded-sm text-[11px] text-muted-foreground underline-offset-4 hover:text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`Delete comment by ${comment.by}`}
                >
                  delete
                </button>
              </form>
            </>
          )}
        </div>
        <div className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-foreground/90">
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
