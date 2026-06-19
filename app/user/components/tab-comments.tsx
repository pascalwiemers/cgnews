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
    <div>
      {comments.map((comment, i) => (
        <div key={comment.id} className="mb-1">
          <Thread key={comment.id} comment={comment} />
        </div>
      ))}
      <div className="py-3">
        {moreLink && (
          <Link
            rel="noreferrer nofollow"
            className="text-sm underline"
            href={`/user/comments?id=${userId}&${moreLink}`}
          >
            More
          </Link>
        )}
      </div>
    </div>
  )
}
