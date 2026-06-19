import { Suspense } from "react"
import Link from "next/link"

import { getOptionalCurrentUser } from "@/lib/auth"
import { listUserFavoriteStories } from "@/lib/data"
import { hnItem2HnWebStory } from "@/lib/hn-item-utils"
import Loading from "@/components/loading"
import Story from "@/components/story"

import FavoritesTab from "./favorites-tab"
import Thread from "./thread"

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
    <div className="pt-2">
      <p className="text-sm text-muted-foreground">
        Comment favorites are not available yet.
      </p>
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
    <div>
      {storyList.map((story, i) => (
        <div key={story.id} className="flex">
          <span className="my-2 w-5 text-muted-foreground">{story.rank}</span>
          <Story
            key={story.id}
            data={story}
            hideVote={true}
            hideFave={userId !== loginUserId}
          />
        </div>
      ))}
      <div className="py-3">
        {moreLink && (
          <Link
            rel="noreferrer nofollow"
            className="text-sm underline"
            href={`/user/favorites?id=${userId}&${moreLink}`}
          >
            More
          </Link>
        )}
      </div>
    </div>
  )
}
