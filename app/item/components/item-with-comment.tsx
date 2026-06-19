import Link from "next/link"
import { notFound } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"

import {
  updateCuratorNoteAction,
  updateFeaturedStoryAction,
} from "@/lib/actions"
import { CURATOR_NOTE_MAX_LENGTH, isCurator } from "@/lib/curators"
import { getStory } from "@/lib/data"
import { commentCount, replyableStroy } from "@/lib/hn-item-utils"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import Fave from "@/components/fave"
import HtmlText from "@/components/html-text"
import StoryBy from "@/components/story-by"
import StoryDisclosureLabels from "@/components/story-disclosure-labels"
import StoryPoint from "@/components/story-point"
import StoryTime from "@/components/story-time"
import StoryUrl from "@/components/story-url"

import Comments from "./comments"
import ReplyForm from "./reply-form"

export default async function ItemWithComment({
  id,
  faved = false,
}: {
  id: number
  faved?: boolean
}) {
  if (!id) {
    notFound()
  }
  const story = await getStory(id)
  if (!story) {
    notFound()
  }
  const [clerkUser, curator] = await Promise.all([currentUser(), isCurator()])
  return (
    <div className="flex flex-col justify-start space-y-3">
      <div>
        <Link
          className={cn("text-3xl", story.dead && "text-muted-foreground")}
          rel="noopener noreferrer nofollow"
          href={story.url || ""}
          target={story.url ? "_blank" : "_self"}
        >
          {story.dead ? "[flagged]" : story.title}
        </Link>
        <div className="flex items-center py-2 text-sm text-muted-foreground">
          <div className="flex flex-1 flex-wrap items-center gap-x-3">
            {story.url && <StoryUrl url={story.url} />}
            <StoryPoint score={story.score} />
            <StoryBy by={story.by} />
            <StoryTime time={story.time} />
            <StoryDisclosureLabels
              isSelfPromo={story.isSelfPromo}
              commercialDisclosure={story.commercialDisclosure}
            />
          </div>
          <Fave storyId={story.id} faved={faved} />
        </div>
        <HtmlText innerHtml={story.text} />
        {story.curatorNote && (
          <div className="mt-3 border-l-2 border-primary/50 pl-3 text-sm leading-6">
            <div className="text-xs font-medium text-muted-foreground">
              curator note{story.curator ? ` by ${story.curator}` : ""}
            </div>
            <p className="whitespace-pre-wrap text-foreground">
              {story.curatorNote}
            </p>
          </div>
        )}
        {curator && (
          <div className="mt-4 border-t border-border/60 pt-3">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>curator</span>
              <form action={updateFeaturedStoryAction}>
                <input type="hidden" name="storyId" value={story.id} />
                <input
                  type="hidden"
                  name="featured"
                  value={story.featuredAt ? "false" : "true"}
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="outline"
                  className="h-7 rounded-sm px-2 text-xs"
                >
                  {story.featuredAt ? "unfeature" : "feature"}
                </Button>
              </form>
              {story.featuredAt && <span>featured</span>}
            </div>
            <form action={updateCuratorNoteAction} className="space-y-2">
              <input type="hidden" name="storyId" value={story.id} />
              <Textarea
                name="curatorNote"
                defaultValue={story.curatorNote || ""}
                maxLength={CURATOR_NOTE_MAX_LENGTH}
                rows={3}
                className="min-h-[72px] resize-y rounded-sm text-sm"
              />
              <Button type="submit" size="sm" className="h-8 rounded-sm px-3">
                save note
              </Button>
            </form>
          </div>
        )}
      </div>
      {replyableStroy(story) && (
        <ReplyForm storyId={story.id} logined={!!clerkUser} />
      )}
      <Separator orientation="horizontal" className="my-2" />
      {story.descendants > 0 && (
        <span className="font-semibold">{commentCount(story.descendants)}</span>
      )}
      <Comments ids={[]} story={story} />
    </div>
  )
}
