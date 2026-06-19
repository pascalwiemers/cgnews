import { getHnApiUrl } from "@/config/urls"

import { HnComment, HnItem, HnStoryType, HnUser } from "./hn-types"

async function fetchData<T>(type: string) {
  const res = await fetch(getHnApiUrl(`${type}.json`), {
    next: {
      revalidate: 120,
    },
  })
  if (res.status !== 200) {
    throw new Error(`Status ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function fetchStoryIds(type: HnStoryType) {
  const storyIds = await fetchData<number[]>(type)
  if (!storyIds) {
    return []
  } else {
    return storyIds as number[]
  }
}

export async function fetchUser(userId: string) {
  const user = await fetchData<HnUser>(`user/${userId}`)
  return safeUser(user)
}

export async function fetchItem(id: number) {
  const hnItem = await fetchData<HnItem>(`item/${id}`)
  return safeItem(hnItem)
}

export function safeItem(val: HnItem) {
  if (val) {
    val.url = val.url || ""
    val.kids = val.kids || []
    val.descendants = val.descendants || 0
    return val
  } else {
    return null
  }
}

export function safeUser(val: HnUser) {
  if (val) {
    val.about = val.about || ""
    val.karma = val.karma || 0
    val.submitted = val.submitted || []
    return val
  } else {
    return null
  }
}

function isHnComment(comment: HnItem | null): comment is HnComment {
  return comment !== null
}

export async function fetchStories(ids: number[]) {
  const stories = (await Promise.all(
    ids.map(async (itemId) => {
      return await fetchItem(itemId)
    })
  )) as HnItem[]
  return stories.filter((item) => item !== null)
}

export function fetchComments(ids: number[]) {
  return Promise.all(
    ids.map(async (id) => {
      const val = await fetchData<HnComment>(`item/${id}`)
      val.comments =
        val.kids && val.kids.length > 0
          ? (await fetchComments(val.kids)).filter(isHnComment)
          : []
      return safeItem(val) as HnComment | null
    })
  )
}
