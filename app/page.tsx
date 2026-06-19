import { HnStoryType } from "@/lib/hn-types"
import TypePage from "@/app/[type]/components/type-page"

export default function Page({
  searchParams,
}: {
  searchParams: { cursor?: string }
}) {
  return (
    <TypePage
      pathname={""}
      storyType={HnStoryType.topstories}
      cursor={searchParams.cursor}
    />
  )
}
