import { Metadata, ResolvingMetadata } from "next"
import { notFound } from "next/navigation"

import { storyFeedNavConfig } from "@/config/conf"
import TypePage from "@/app/[type]/components/type-page"

type Props = {
  params: Promise<{ type: string }>
  searchParams: Promise<{
    cursor?: string | string[]
    page?: string | string[]
  }>
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const route = await params
  const type = route.type
  return {
    title: `${type.charAt(0).toUpperCase() + type.slice(1)}`,
  }
}

export default async function Page({ searchParams, params }: Props) {
  const [route, query] = await Promise.all([params, searchParams])
  const cursor = Array.isArray(query.cursor) ? query.cursor[0] : query.cursor
  const pathname = route.type || "top"
  const navItem = storyFeedNavConfig.filter(
    (navItem) => navItem.name.toLowerCase() === pathname
  )
  const storyType = navItem && navItem.length === 1 ? navItem[0].type : null
  if (!storyType) {
    notFound()
  }
  return <TypePage pathname={pathname} storyType={storyType} cursor={cursor} />
}
