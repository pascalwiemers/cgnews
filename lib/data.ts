import { unstable_cache } from "next/cache"
import type { Prisma } from "@prisma/client"

import { PUBLIC_FEED_CACHE_TAG, PUBLIC_SEARCH_CACHE_TAG } from "./cache-tags"
import { getDb } from "./db"
import { HnItem, HnItemType } from "./hn-types"
import { HnWebThread } from "./hn-web-types"
import { sortByHot } from "./ranking"
import { normalizeStoredStoryType } from "./submit-story"
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

type PublicStoryOrder = "hot" | "new" | "top"
type SearchOrder = "date" | "score"

export type StoryPage = {
  stories: HnItem[]
  nextCursor?: string
}

const PUBLIC_FEED_REVALIDATE_SECONDS = 60
const MAX_PUBLIC_PAGE_SIZE = 50
const HOT_WINDOW_SIZE = 120

function storyWhere(storyType: StoryTypeParam): Prisma.StoryWhereInput {
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
  const storyType = normalizeStoredStoryType(story.type)

  return {
    id: story.id,
    deleted: false,
    type: storyType === "JOB" ? HnItemType.job : HnItemType.story,
    storyType,
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
    isSelfPromo: story.isSelfPromo,
    commercialDisclosure: story.commercialDisclosure,
  }
}

const storyInclude = {
  author: { select: { username: true } },
  curator: { select: { username: true } },
  _count: { select: { comments: true } },
} satisfies Prisma.StoryInclude

function normalizePageSize(pageSize: number) {
  if (!Number.isFinite(pageSize)) return 30
  return Math.min(Math.max(Math.floor(pageSize), 1), MAX_PUBLIC_PAGE_SIZE)
}

function andWhere(
  ...parts: Array<Prisma.StoryWhereInput | undefined>
): Prisma.StoryWhereInput {
  const filtered = parts.filter(Boolean) as Prisma.StoryWhereInput[]
  if (filtered.length === 0) return {}
  if (filtered.length === 1) return filtered[0]
  return { AND: filtered }
}

function dateFromMillis(value: string) {
  const millis = Number(value)
  if (!Number.isFinite(millis)) return null
  const date = new Date(millis)
  return Number.isNaN(date.getTime()) ? null : date
}

function encodeNewCursor(story: Pick<StoryWithAuthor, "createdAt" | "id">) {
  return ["n", story.createdAt.getTime(), story.id].join(":")
}

function encodeTopCursor(
  story: Pick<StoryWithAuthor, "score" | "createdAt" | "id">
) {
  return ["t", story.score ?? 0, story.createdAt.getTime(), story.id].join(":")
}

function encodeHotCursor(story: Pick<StoryWithAuthor, "id">) {
  return ["h", story.id].join(":")
}

function parseNewCursor(cursor?: string): Prisma.StoryWhereInput | undefined {
  if (!cursor) return undefined
  const [kind, millis, idValue] = cursor.split(":")
  if (kind !== "n") return undefined

  const createdAt = dateFromMillis(millis)
  const id = Number(idValue)
  if (!createdAt || !Number.isInteger(id)) return undefined

  return {
    OR: [
      { createdAt: { lt: createdAt } },
      { createdAt: { equals: createdAt }, id: { lt: id } },
    ],
  }
}

function parseTopCursor(cursor?: string): Prisma.StoryWhereInput | undefined {
  if (!cursor) return undefined
  const [kind, scoreValue, millis, idValue] = cursor.split(":")
  if (kind !== "t") return undefined

  const score = Number(scoreValue)
  const createdAt = dateFromMillis(millis)
  const id = Number(idValue)
  if (!Number.isFinite(score) || !createdAt || !Number.isInteger(id)) {
    return undefined
  }

  return {
    OR: [
      { score: { lt: score } },
      { score, createdAt: { lt: createdAt } },
      { score, createdAt: { equals: createdAt }, id: { lt: id } },
    ],
  }
}

function parseHotCursorId(cursor?: string) {
  if (!cursor) return null
  const [kind, idValue] = cursor.split(":")
  const id = Number(idValue)
  return kind === "h" && Number.isInteger(id) ? id : null
}

function splitPage<T>(items: T[], pageSize: number) {
  return {
    pageItems: items.slice(0, pageSize),
    hasMore: items.length > pageSize,
  }
}

async function listStoriesUncached({
  storyType,
  pageSize = 30,
  order = "hot",
  cursor,
}: {
  storyType: StoryTypeParam
  pageSize?: number
  order?: PublicStoryOrder
  cursor?: string
}): Promise<StoryPage> {
  const limit = normalizePageSize(pageSize)
  const where = storyWhere(storyType)
  const db = await getDb()
  if (order === "new") {
    const stories = await db.story.findMany({
      where: andWhere(where, parseNewCursor(cursor)),
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      include: storyInclude,
    })
    const { pageItems, hasMore } = splitPage(stories, limit)
    return {
      stories: pageItems.map(toHnItem),
      nextCursor: hasMore
        ? encodeNewCursor(pageItems[pageItems.length - 1])
        : undefined,
    }
  }
  if (order === "top") {
    const stories = await db.story.findMany({
      where: andWhere(where, parseTopCursor(cursor)),
      orderBy: [{ score: "desc" }, { createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      include: storyInclude,
    })
    const { pageItems, hasMore } = splitPage(stories, limit)
    return {
      stories: pageItems.map(toHnItem),
      nextCursor: hasMore
        ? encodeTopCursor(pageItems[pageItems.length - 1])
        : undefined,
    }
  }

  const stories = await db.story.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: Math.max(limit * 3, HOT_WINDOW_SIZE),
    include: storyInclude,
  })
  const ranked = sortByHot(stories)
  const cursorId = parseHotCursorId(cursor)
  const cursorIndex =
    cursorId === null ? -1 : ranked.findIndex((story) => story.id === cursorId)
  const start = cursorIndex >= 0 ? cursorIndex + 1 : 0
  const pageItems = ranked.slice(start, start + limit)
  const lastItem = pageItems[pageItems.length - 1]

  return {
    stories: pageItems.map(toHnItem),
    nextCursor:
      lastItem && start + limit < ranked.length
        ? encodeHotCursor(lastItem)
        : undefined,
  }
}

const listCachedStories = unstable_cache(
  async (
    storyType: StoryTypeParam,
    pageSize: number,
    order: PublicStoryOrder,
    cursor?: string
  ) => listStoriesUncached({ storyType, pageSize, order, cursor }),
  ["public-story-feed"],
  { revalidate: PUBLIC_FEED_REVALIDATE_SECONDS, tags: [PUBLIC_FEED_CACHE_TAG] }
)

export async function listStories({
  storyType,
  pageSize = 30,
  order = "hot",
  cursor,
}: {
  storyType: StoryTypeParam
  pageSize?: number
  order?: PublicStoryOrder
  cursor?: string
}) {
  return listCachedStories(
    storyType,
    normalizePageSize(pageSize),
    order,
    cursor
  )
}

async function searchStoriesUncached({
  query,
  pageSize = 30,
  sort,
  cursor,
}: {
  query: string
  pageSize?: number
  sort?: string
  cursor?: string
}): Promise<StoryPage> {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    return { stories: [] }
  }

  const limit = normalizePageSize(pageSize)
  const contains = { contains: trimmedQuery }
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
  const searchOrder: SearchOrder = sort === "byDate" ? "date" : "score"
  const cursorWhere =
    searchOrder === "date" ? parseNewCursor(cursor) : parseTopCursor(cursor)
  const orderBy: Prisma.StoryOrderByWithRelationInput[] =
    searchOrder === "date"
      ? [{ createdAt: "desc" }, { id: "desc" }]
      : [{ score: "desc" }, { createdAt: "desc" }, { id: "desc" }]

  const db = await getDb()
  const stories = await db.story.findMany({
    where: andWhere(where, cursorWhere),
    orderBy,
    take: limit + 1,
    include: storyInclude,
  })
  const { pageItems, hasMore } = splitPage(stories, limit)
  return {
    stories: pageItems.map(toHnItem),
    nextCursor: hasMore
      ? searchOrder === "date"
        ? encodeNewCursor(pageItems[pageItems.length - 1])
        : encodeTopCursor(pageItems[pageItems.length - 1])
      : undefined,
  }
}

const searchCachedStories = unstable_cache(
  async (query: string, pageSize: number, sort?: string, cursor?: string) =>
    searchStoriesUncached({ query, pageSize, sort, cursor }),
  ["public-story-search"],
  {
    revalidate: PUBLIC_FEED_REVALIDATE_SECONDS,
    tags: [PUBLIC_SEARCH_CACHE_TAG],
  }
)

export async function searchStories({
  query,
  pageSize = 30,
  sort,
  cursor,
}: {
  query: string
  pageSize?: number
  sort?: string
  cursor?: string
}) {
  return searchCachedStories(query, normalizePageSize(pageSize), sort, cursor)
}

export async function getStory(id: number): Promise<HnItem | null> {
  const db = await getDb()
  const story = await db.story.findUnique({
    where: { id },
    include: storyInclude,
  })
  if (!story) return null
  return toHnItem(story)
}

export async function listStoryComments(storyId: number) {
  const db = await getDb()
  const comments = await db.comment.findMany({
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
  const db = await getDb()
  const user = await db.user.findFirst({
    where: { OR: [{ username: userId }, { clerkId: userId }] },
    select: { id: true, username: true, clerkId: true },
  })
  return user
}

export async function listUserFavoriteStories(userId: string) {
  const user = await resolveUserId(userId)
  const db = await getDb()
  const favorites = user
    ? await db.favorite.findMany({
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
  const db = await getDb()
  const comments = user
    ? await db.comment.findMany({
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
