import { Suspense } from "react"
import { Metadata, ResolvingMetadata } from "next"
import { notFound } from "next/navigation"

import { searchStories } from "@/lib/data"
import ItemList from "@/components/item-list"
import Loading from "@/components/loading"

type Props = {
  searchParams: Promise<{ query?: string; sort?: string; cursor?: string }>
}

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await searchParams
  const query = params.query
  return {
    title: `Search: ${query}`,
  }
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams
  const query = params.query
  if (!query) {
    notFound()
  }
  const pageSize = 30
  return (
    <Suspense
      key={`${query}_${params.cursor || "first"}_${pageSize}`}
      fallback={<Loading />}
    >
      <SearchResult
        query={query}
        sort={params.sort}
        cursor={params.cursor}
        pageSize={pageSize}
      />
    </Suspense>
  )
}

async function SearchResult({
  query,
  sort,
  cursor,
  pageSize,
}: {
  query: string
  sort?: string
  cursor?: string
  pageSize: number
}) {
  const { stories, nextCursor } = await searchStories({
    query,
    pageSize,
    sort,
    cursor,
  })

  const moreLink =
    stories.length < pageSize || !nextCursor
      ? ""
      : `/search?query=${encodeURIComponent(query)}&cursor=${encodeURIComponent(nextCursor)}${
          sort ? `&sort=${encodeURIComponent(sort)}` : ""
        }`
  return <ItemList stories={stories} moreLink={moreLink} />
}
