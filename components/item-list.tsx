"use client"

import { HnItem } from "@/lib/hn-types"
import FeedCommandCenter from "@/components/feed-command-center"

export interface Props {
  stories: HnItem[]
  offset?: number
  moreLink?: string
}

export default function ItemList({ stories, offset = 1, moreLink }: Props) {
  return (
    <FeedCommandCenter stories={stories} offset={offset} moreLink={moreLink} />
  )
}
