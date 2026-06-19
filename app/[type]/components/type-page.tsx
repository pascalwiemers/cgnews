import { Suspense } from "react"

import { HnStoryType } from "@/lib/hn-types"
import ItemSkeleton from "@/components/item-skeleton"
import TypeStories from "@/app/[type]/components/type-stories"

export default function TypePage({
  pathname,
  storyType,
  cursor,
}: {
  pathname: string
  storyType: HnStoryType
  cursor?: string
}) {
  return (
    <>
      <Suspense
        key={`${storyType}-${cursor || "first"}`}
        fallback={<ItemSkeleton length={6} />}
      >
        <TypeStories
          pathname={pathname}
          cursor={cursor}
          storyType={storyType}
          pageSize={30}
        />
      </Suspense>
    </>
  )
}
