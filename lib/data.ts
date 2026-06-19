import { Prisma } from "@prisma/client"

import { prisma } from "./db"
import { HnItem, HnItemType } from "./hn-types"
import { HnWebThread } from "./hn-web-types"
import { sortByHot } from "./ranking"
import { timeAgo } from "./time-utils"

type StoryTypeParam =
  | "topstories"
  | "newstories"
  | "beststories"
  | "askstories"
  | "showstories"
  | "jobstories"

type StoredStoryType = "LINK" | "ASK" | "SHOW" | "JOB"

const typeMap: Partial<Record<StoryTypeParam, StoredStoryType>> = {
  askstories: "ASK",
  showstories: "SHOW",
  jobstories: "JOB",
}

function storyWhere(storyType: StoryTypeParam) {
  const type = typeMap[storyType]
  return type ? { type } : {}
}

type StoryWithAuthor = Prisma.StoryGetPayload<{
  include: {
    author: { select: { username: true } }
    curator: { select: { username: true } }
    _count: { select: { comments: true } }
  }
}>

function toHnItem(story: StoryWithAuthor): HnItem {
  return {
    id: story.id,
    deleted: false,
    type: story.type === "JOB" ? HnItemType.job : HnItemType.story,
    by: story.author.username,
    time: Math.floor(new Date(story.createdAt).getTime() / 1000),
    text: story.text ?? "",
    dead: false,
    parent: undefined,
    url: story.url ?? "",
    score: story.score ?? 0,
    title: story.title,
    descendants: story._count?.comments ?? story.descendants ?? 0,
    curatorNote: story.curatorNote ?? undefined,
    curator: story.curator?.username,
    featuredAt: story.featuredAt
      ? Math.floor(new Date(story.featuredAt).getTime() / 1000)
      : undefined,
  }
}

const storyInclude = {
  author: { select: { username: true } },
  curator: { select: { username: true } },
  _count: { select: { comments: true } },
} satisfies Prisma.StoryInclude

export async function listStories({
  storyType,
  page = 1,
  pageSize = 30,
  order = "hot",
}: {
  storyType: StoryTypeParam
  page?: number
  pageSize?: number
  order?: "hot" | "new" | "top"
}) {
  const skip = (page - 1) * pageSize
  const where = storyWhere(storyType)
  if (order === "new") {
    const stories = await prisma.story.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: storyInclude,
    })
    return stories.map(toHnItem)
  }
  if (order === "top") {
    const stories = await prisma.story.findMany({
      where,
      orderBy: { score: "desc" },
      skip,
      take: pageSize,
      include: storyInclude,
    })
    return stories.map(toHnItem)
  }
  // hot
  const stories = await prisma.story.findMany({
    where,
    orderBy: { createdAt: "desc" },
    // Keep hot ranking over a bounded recent window for D1; this can become a stored rankScore later.
    skip: 0,
    take: Math.max(pageSize * 3, 120),
    include: storyInclude,
  })
  const ranked = sortByHot(stories)
  const pageSlice = ranked.slice(skip, skip + pageSize)
  return pageSlice.map(toHnItem)
}

export async function searchStories({
  query,
  page = 1,
  pageSize = 30,
  sort,
}: {
  query: string
  page?: number
  pageSize?: number
  sort?: string
}) {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    return []
  }

  const contains = { contains: trimmedQuery, mode: "insensitive" as const }
  const where: Prisma.StoryWhereInput = {
    OR: [
      { title: contains },
      { url: contains },
      { text: contains },
      { curatorNote: contains },
      { commercialDisclosure: contains },
      { comments: { some: { text: contains } } },
    ],
  }
  const skip = (page - 1) * pageSize
  const orderBy: Prisma.StoryOrderByWithRelationInput[] =
    sort === "byDate"
      ? [{ createdAt: "desc" }]
      : [{ score: "desc" }, { createdAt: "desc" }]

  const stories = await prisma.story.findMany({
    where,
    orderBy,
    skip,
    take: pageSize,
    include: storyInclude,
  })
  return stories.map(toHnItem)
}

export async function getStory(id: number): Promise<HnItem | null> {
  const story = await prisma.story.findUnique({
    where: { id },
    include: storyInclude,
  })
  if (!story) return null
  return toHnItem(story)
}

export async function listStoryComments(storyId: number) {
  const comments = await prisma.comment.findMany({
    where: { storyId },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    include: { author: { select: { username: true } } },
  })

  const nodes = comments.map((comment) => ({
    id: comment.id,
    by: comment.author.username,
    text: comment.text,
    time: Math.floor(new Date(comment.createdAt).getTime() / 1000),
    parentId: comment.parentId,
    comments: [] as StoryComment[],
  }))
  const byId = new Map(nodes.map((comment) => [comment.id, comment]))
  const roots: StoryComment[] = []

  for (const comment of nodes) {
    const parent = comment.parentId ? byId.get(comment.parentId) : null
    if (parent) {
      parent.comments.push(comment)
    } else {
      roots.push(comment)
    }
  }

  return roots
}

export type StoryComment = {
  id: number
  by: string
  text: string
  time: number
  parentId: number | null
  comments: StoryComment[]
}

export async function resolveUserId(userId: string) {
  const user = await prisma.user.findFirst({
    where: { OR: [{ username: userId }, { clerkId: userId }] },
    select: { id: true, username: true, clerkId: true },
  })
  return user
}

export async function listUserFavoriteStories(userId: string) {
  const user = await resolveUserId(userId)
  const favorites = user
    ? await prisma.favorite.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          story: {
            include: storyInclude,
          },
        },
        take: 50,
      })
    : []

  return favorites.map((favorite) => toHnItem(favorite.story))
}

export async function listUserCommentThreads(userId: string) {
  const user = await resolveUserId(userId)
  const comments = user
    ? await prisma.comment.findMany({
        where: { authorId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          story: { select: { id: true, title: true } },
        },
        take: 50,
      })
    : []

  return comments.map(
    (comment): HnWebThread => ({
      id: comment.id,
      indent: 0,
      age: `${timeAgo(Math.floor(new Date(comment.createdAt).getTime() / 1000))} ago`,
      time: Math.floor(new Date(comment.createdAt).getTime() / 1000),
      userId: user?.username || userId,
      onStory: comment.story.title,
      storyLink: `/item?id=${comment.story.id}`,
      commentHtml: comment.text,
      kids: [],
    })
  )
}
