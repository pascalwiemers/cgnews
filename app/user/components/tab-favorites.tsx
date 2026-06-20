import { Suspense } from "react"
import Link from "next/link"

import { getOptionalCurrentUser } from "@/lib/auth"
import { listUserFavoriteStories } from "@/lib/data"
import { hnItem2HnWebStory } from "@/lib/hn-item-utils"
import Loading from "@/components/loading"
import Story from "@/components/story"

import FavoritesTab from "./favorites-tab"

export default function TabFavorites({
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
          <FavoriteSubmissions userId={userId} />
        </Suspense>
      )}
      {type === "comments" && (
        <Suspense key={userId + "-" + type} fallback={<Loading />}>
          <FavoriteComments userId={userId} />
        </Suspense>
      )}
    </div>
  )
}

async function FavoriteComments({ userId }: { userId: string }) {
  return (
    <div className="command-panel border-dashed p-4 text-sm text-muted-foreground">
      <div className="metadata-label mb-2">Favorite comments</div>
      <p>Comment favorites are not available yet.</p>
    </div>
  )
}

async function FavoriteSubmissions({ userId }: { userId: string }) {
  const stories = await listUserFavoriteStories(userId)
  const storyList = stories.map(hnItem2HnWebStory)
  const loginUser = await getOptionalCurrentUser()
  const loginUserId = loginUser?.username || loginUser?.id
  const moreLink = ""
  return (
    <div className="space-y-3">
      {storyList.length === 0 && (
        <div className="command-panel border-dashed p-4 text-sm text-muted-foreground">
          <div className="metadata-label mb-2">Favorite submissions</div>
          <p>No favorite submissions found.</p>
        </div>
      )}
      {storyList.map((story, i) => (
        <div key={story.id} className="flex min-w-0 gap-3">
          <span className="metadata-label mt-4 w-5 shrink-0 text-right">
            {String(i + 1).padStart(2, "0")}
          </span>
          <Story
            key={story.id}
            data={story}
            hideVote={true}
            hideFave={userId !== loginUserId}
          />
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
