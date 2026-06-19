import { Suspense } from "react"
import { Metadata, ResolvingMetadata } from "next"
import { notFound } from "next/navigation"

import { searchStories } from "@/lib/data"
import ItemList from "@/components/item-list"
import Loading from "@/components/loading"

type Props = {
  searchParams: { query?: string; sort?: string; page?: string }
}

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const query = searchParams.query
  return {
    title: `Search: ${query}`,
  }
}

export default async function Page({ searchParams }: Props) {
  const query = searchParams.query
  if (!query) {
    notFound()
  }
  const page = Number(searchParams.page) || 1
  const pageSize = 30
  return (
    <Suspense key={`${query}_${page}_${pageSize}`} fallback={<Loading />}>
      <SearchResult
        query={query}
        sort={searchParams.sort}
        page={page}
        pageSize={pageSize}
      />
    </Suspense>
  )
}

async function SearchResult({
  query,
  sort,
  page,
  pageSize,
}: {
  query: string
  sort?: string
  page: number
  pageSize: number
}) {
  const searchItemList = await searchStories({
    query,
    page,
    pageSize,
    sort,
  })

  const moreLink =
    searchItemList.length < pageSize
      ? ""
      : `/search?query=${encodeURIComponent(query)}&page=${page + 1}${
          sort ? `&sort=${encodeURIComponent(sort)}` : ""
        }`
  return (
    <ItemList
      stories={searchItemList}
      moreLink={moreLink}
      offset={(page - 1) * pageSize}
    />
  )
}
