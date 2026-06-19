import Link from "next/link"
import { currentUser } from "@clerk/nextjs/server"

import { deleteCommentAction } from "@/lib/actions"
import { listStoryComments, StoryComment } from "@/lib/data"
import { HnItem } from "@/lib/hn-types"
import { timeAgo } from "@/lib/time-utils"
import { cn } from "@/lib/utils"

import ReplyDialog from "./reply-dialog"

export default async function Comments({
  story,
  ids,
}: {
  story: HnItem
  ids: number[]
}) {
  const comments = await listStoryComments(story.id)
  const cu = await currentUser()
  const myId = cu?.username || cu?.id
  if (!comments.length) {
    return <div className="text-sm text-muted-foreground">No comments yet.</div>
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
        "text-sm",
        depth > 0 && "border-l border-border pl-3 md:pl-4"
      )}
    >
      <div className="flex flex-wrap items-center gap-x-1 text-xs text-muted-foreground">
        <Link
          rel="noreferrer nofollow"
          className="hover:underline"
          href={`/user?id=${comment.by}`}
        >
          {comment.by}
        </Link>
        <span>•</span>
        <span>{timeAgo(comment.time)} ago</span>
        <span>•</span>
        <ReplyDialog comment={comment} storyId={story.id} />
        {canDelete && (
          <>
            <span>•</span>
            <form action={deleteCommentAction} className="inline-flex">
              <input type="hidden" name="commentId" value={comment.id} />
              <input type="hidden" name="storyId" value={story.id} />
              <button
                type="submit"
                className="text-xs text-muted-foreground hover:underline"
              >
                delete
              </button>
            </form>
          </>
        )}
      </div>
      <div className="mt-1 whitespace-pre-wrap break-words text-sm">
        {comment.text}
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
