import { Suspense } from "react"
import Link from "next/link"

import { listUserCommentThreads } from "@/lib/data"
import Loading from "@/components/loading"

import Thread from "./thread"

export default function TabComments(searchParams: {
  userId: string
  next: number
}) {
  return (
    <Suspense
      key={searchParams.userId + "-" + searchParams.next}
      fallback={<Loading />}
    >
      <Threads userId={searchParams.userId} next={searchParams.next} />
    </Suspense>
  )
}

async function Threads({ userId, next }: { userId: string; next: number }) {
  const comments = await listUserCommentThreads(userId)
  const moreLink = ""
  return (
    <div className="space-y-3">
      {comments.length === 0 && (
        <div className="command-panel border-dashed p-4 text-sm text-muted-foreground">
          <div className="metadata-label mb-2">Comments</div>
          <p>No comments found.</p>
        </div>
      )}
      {comments.map((comment, i) => (
        <div key={comment.id} className="command-panel min-w-0 p-3">
          <Thread key={comment.id} comment={comment} />
        </div>
      ))}
      <div className="flex justify-center pt-2">
        {moreLink && (
          <Link
            rel="noreferrer nofollow"
            className="command-pill"
            href={`/user/comments?id=${userId}&${moreLink}`}
          >
            More
          </Link>
        )}
      </div>
    </div>
  )
}
