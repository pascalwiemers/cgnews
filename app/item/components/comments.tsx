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
      <div className="rounded-xl border border-dashed border-border/70 bg-card/35 px-4 py-6 text-sm leading-6 text-muted-foreground sm:px-5">
        <div className="mb-1 font-medium text-foreground">No comments yet</div>
        Start the discussion here.
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
        depth > 0 && "ml-3 border-l border-border/70 pl-3 sm:ml-5 sm:pl-4"
      )}
    >
      <div
        className={cn(
          "min-w-0 rounded-lg border border-border/65 bg-card/45 p-3.5 sm:p-4",
          depth > 0 && "border-border/55 bg-background/25"
        )}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <Link
            rel="noreferrer nofollow"
            className="max-w-full truncate font-medium text-foreground/85 hover:text-primary hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55"
            href={`/user?id=${comment.by}`}
          >
            {comment.by}
          </Link>
          <span aria-hidden="true" className="text-muted-foreground/35">
            &middot;
          </span>
          <span>{timeAgo(comment.time)} ago</span>
          <span aria-hidden="true" className="text-muted-foreground/35">
            &middot;
          </span>
          <ReplyDialog comment={comment} storyId={story.id} />
          {canDelete && (
            <>
              <span aria-hidden="true" className="text-muted-foreground/35">
                &middot;
              </span>
              <form action={deleteCommentFormAction} className="inline-flex">
                <input type="hidden" name="commentId" value={comment.id} />
                <input type="hidden" name="storyId" value={story.id} />
                <button
                  type="submit"
                  className="rounded-sm text-xs text-muted-foreground underline-offset-4 hover:text-destructive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55"
                  aria-label={`Delete comment by ${comment.by}`}
                >
                  delete
                </button>
              </form>
            </>
          )}
        </div>
        <div className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-7 text-foreground/90">
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
