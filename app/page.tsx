import { HnStoryType } from "@/lib/hn-types"
import TypePage from "@/app/[type]/components/type-page"

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string }>
}) {
  const query = await searchParams
  return (
    <TypePage
      pathname={""}
      storyType={HnStoryType.topstories}
      cursor={query.cursor}
    />
  )
}
