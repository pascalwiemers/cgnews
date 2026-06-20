import { Suspense } from "react"
import Link from "next/link"

import { getDb } from "@/lib/db"
import { ago, points, site } from "@/lib/hn-item-utils"
import { HnWebStory } from "@/lib/hn-web-types"
import { normalizeStoredStoryType } from "@/lib/submit-story"
import Loading from "@/components/loading"
import Story from "@/components/story"

import FavoritesTab from "./favorites-tab"
import Thread from "./thread"

export default function TabUpvoted({
  userId,
  type,
}: {
  userId: string
  type: string
}) {
  type = type || "submissions"
  return (
    <div className="space-y-2">
      <FavoritesTab userId={userId} />
      {type === "submissions" && (
        <Suspense key={userId + "-" + type} fallback={<Loading />}>
          <UpvotedSubmissions userId={userId} />
        </Suspense>
      )}
      {type === "comments" && (
        <Suspense key={userId + "-" + type} fallback={<Loading />}>
          <UpvotedComments userId={userId} />
        </Suspense>
      )}
    </div>
  )
}

async function UpvotedComments({ userId }: { userId: string }) {
  // Not implemented yet in Prisma backend
  const comments: any[] = []
  const moreLink = ""
  return (
    <div className="space-y-3">
      {comments.length === 0 && (
        <div className="command-panel border-dashed p-4 text-sm text-muted-foreground">
          <div className="metadata-label mb-2">Upvoted comments</div>
          <p>Upvoted comments are not available yet.</p>
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

async function UpvotedSubmissions({ userId }: { userId: string }) {
  // Resolve local user by username or Clerk id
  const db = await getDb()
  const user = await db.user.findFirst({
    where: { OR: [{ username: userId }, { clerkId: userId }] },
  })
  const votes = user
    ? await db.vote.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          story: {
            include: { author: { select: { username: true } } },
          },
        },
        take: 50,
      })
    : []

  const storyList: HnWebStory[] = votes.map((v) => {
    const s = v.story
    return {
      id: s.id,
      title: s.title,
      url: s.url || "",
      sitestr: site(s.url || undefined) || "",
      storyType: normalizeStoredStoryType(s.type),
      score: points(s.score) || "0 points",
      by: s.author.username,
      age: ago(Math.floor(new Date(s.createdAt).getTime() / 1000)) || "",
      time: Math.floor(new Date(s.createdAt).getTime() / 1000),
      comments: s.descendants ? `${s.descendants} comments` : "",
      dead: false,
      upvoted: true,
      isSelfPromo: s.isSelfPromo,
      commercialDisclosure: s.commercialDisclosure,
    }
  })
  const moreLink = ""
  return (
    <div className="space-y-3">
      {storyList.length === 0 && (
        <div className="command-panel border-dashed p-4 text-sm text-muted-foreground">
          <div className="metadata-label mb-2">Upvoted submissions</div>
          <p>No upvoted submissions found.</p>
        </div>
      )}
      {storyList.map((story, i) => (
        <div key={story.id} className="flex min-w-0 gap-3">
          <span className="metadata-label mt-4 w-5 shrink-0 text-right">
            {String(i + 1).padStart(2, "0")}
          </span>
          <Story key={story.id} data={story} hideVote={false} />
        </div>
      ))}
      <div className="flex justify-center pt-2">
        {moreLink && (
          <Link
            rel="noreferrer nofollow"
            className="command-pill"
            href={`/user/favorites?id=${userId}&${moreLink}`}
          >
            More
          </Link>
        )}
      </div>
    </div>
  )
}
