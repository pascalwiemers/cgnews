import { Suspense } from "react"
import Link from "next/link"

import { prisma } from "@/lib/db"
import { ago, points, site } from "@/lib/hn-item-utils"
import { HnWebStory } from "@/lib/hn-web-types"
import ItemSkeleton from "@/components/item-skeleton"
import Story from "@/components/story"

export const dynamic = "force-dynamic"

export default function TabSubmitted(searchParams: {
  userId: string
  next: number
  n: number
}) {
  return (
    <Suspense
      key={searchParams.userId + "-" + searchParams.next + "-" + searchParams.n}
      fallback={<ItemSkeleton length={3} />}
    >
      <Submitted
        userId={searchParams.userId}
        next={searchParams.next}
        n={searchParams.n}
      />
    </Suspense>
  )
}

async function Submitted({
  userId,
  next,
  n,
}: {
  userId: string
  next: number
  n: number
}) {
  const pageSize = 10
  const skip = Number(next) || 0
  // Resolve the actual Prisma user first using either username or Clerk ID
  const user = await prisma.user.findFirst({
    where: { OR: [{ username: userId }, { clerkId: userId }] },
  })
  const stories = user
    ? await prisma.story.findMany({
        where: { authorId: user.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      })
    : []
  const storyList: HnWebStory[] = stories.map((s) => ({
    id: s.id,
    title: s.title,
    url: s.url || "",
    sitestr: site(s.url || undefined) || "",
    storyType: s.type,
    score: points(s.score) || "0 points",
    by: user?.username || userId,
    age: ago(Math.floor(new Date(s.createdAt).getTime() / 1000)) || "",
    time: Math.floor(new Date(s.createdAt).getTime() / 1000),
    comments: s.descendants ? `${s.descendants} comments` : "",
    dead: false,
    isSelfPromo: s.isSelfPromo,
    commercialDisclosure: s.commercialDisclosure,
  }))
  const nextOffset = stories.length < pageSize ? undefined : skip + pageSize
  const moreLink = nextOffset !== undefined ? `next=${nextOffset}` : ""
  return (
    <div>
      {storyList.map((story, i) => (
        <div key={story.id} className="flex space-x-3">
          <span className="my-2 w-5 text-muted-foreground">{story.rank}</span>
          <Story key={story.id} data={story} hideVote={true} />
        </div>
      ))}
      <div className="py-3">
        {moreLink && (
          <Link
            rel="noreferrer nofollow"
            className="text-sm underline"
            href={`/user/submitted?id=${userId}&${moreLink}`}
          >
            More
          </Link>
        )}
      </div>
    </div>
  )
}
