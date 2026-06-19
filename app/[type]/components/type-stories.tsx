import { listStories } from "@/lib/data"
import { HnStoryType } from "@/lib/hn-types"
import ItemList from "@/components/item-list"

export default async function TypeStories({
  pathname,
  storyType,
  cursor,
  pageSize = 30,
}: {
  cursor?: string
  pageSize?: number
  storyType: HnStoryType
  pathname: string
}) {
  const limit = pageSize || 30
  const order =
    storyType === HnStoryType.newstories
      ? "new"
      : storyType === HnStoryType.beststories
        ? "top"
        : "hot"
  const { stories, nextCursor } = await listStories({
    storyType,
    pageSize: limit,
    order,
    cursor,
  })

  const searchParams = new URLSearchParams()
  if (nextCursor) {
    searchParams.set("cursor", nextCursor)
  }

  const path = pathname ? `/${pathname}` : "/"
  const moreLink =
    stories.length < limit || !nextCursor
      ? ""
      : `${path}?${searchParams.toString()}`
  return <ItemList stories={stories} moreLink={moreLink} />
}
