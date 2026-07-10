import { Suspense } from "react"
import { Metadata, ResolvingMetadata } from "next"

import { getStory } from "@/lib/data"
import Loading from "@/components/loading"

import ItemWithComment from "./components/item-with-comment"

type Props = {
  searchParams: Promise<{ id: string }>
}

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const query = await searchParams
  const storyId = Number(query.id)
  const story = await getStory(storyId)
  return {
    title: `${story?.title || "Comment"}`,
  }
}

export default async function Page({ searchParams }: Props) {
  const query = await searchParams
  const id = Number(query.id)
  return (
    <Suspense key={id} fallback={<Loading />}>
      <ItemWithComment id={id} />
    </Suspense>
  )
}
