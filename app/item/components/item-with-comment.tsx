import Link from "next/link"
import { notFound } from "next/navigation"

import {
  updateCuratorNoteAction,
  updateFeaturedStoryAction,
} from "@/lib/actions"
import { getOptionalCurrentUser } from "@/lib/auth"
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

type VoidFormAction = (formData: FormData) => Promise<void>

const updateFeaturedStoryFormAction =
  updateFeaturedStoryAction as unknown as VoidFormAction
const updateCuratorNoteFormAction =
  updateCuratorNoteAction as unknown as VoidFormAction

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
  const [clerkUser, curator] = await Promise.all([
    getOptionalCurrentUser(),
    isCurator(),
  ])
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col justify-start space-y-5">
      <article className="panel p-4 sm:p-5">
        <div className="flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase text-muted-foreground/80">
              {story.url && <StoryUrl url={story.url} />}
              {story.dead && <span>flagged</span>}
            </div>
            <Link
              className={cn(
                "block break-words text-2xl font-semibold leading-tight text-foreground hover:text-primary sm:text-3xl",
                story.dead &&
                  "text-muted-foreground hover:text-muted-foreground"
              )}
              rel="noopener noreferrer nofollow"
              href={story.url || `/item?id=${story.id}`}
              target={story.url ? "_blank" : "_self"}
            >
              {story.dead ? "[flagged] " : ""}
              {story.title}
            </Link>
          </div>
          <div className="shrink-0 pt-1">
            <Fave storyId={story.id} faved={faved} />
          </div>
        </div>
        <div className="mt-4 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 border-y border-border/60 py-2 font-mono text-[11px] text-muted-foreground">
          <StoryPoint score={story.score} />
          <StoryBy by={story.by} />
          <StoryTime time={story.time} />
          {story.descendants > 0 && (
            <span>{commentCount(story.descendants)}</span>
          )}
          <StoryDisclosureLabels
            isSelfPromo={story.isSelfPromo}
            commercialDisclosure={story.commercialDisclosure}
          />
        </div>
        <HtmlText
          className="mt-4 block break-words text-[15px] leading-7 text-foreground/90"
          innerHtml={story.text}
        />
        {story.curatorNote && (
          <aside className="mt-5 border-l-2 border-primary/70 bg-accent/20 px-4 py-3 text-sm leading-6">
            <div className="mb-1 font-mono text-[11px] uppercase text-muted-foreground">
              curator note{story.curator ? ` by ${story.curator}` : ""}
            </div>
            <p className="whitespace-pre-wrap break-words text-foreground/90">
              {story.curatorNote}
            </p>
          </aside>
        )}
        {curator && (
          <div className="mt-5 border-t border-border/60 pt-4">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>curator</span>
              <form action={updateFeaturedStoryFormAction}>
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
            <form action={updateCuratorNoteFormAction} className="space-y-2">
              <input type="hidden" name="storyId" value={story.id} />
              <Textarea
                name="curatorNote"
                defaultValue={story.curatorNote || ""}
                maxLength={CURATOR_NOTE_MAX_LENGTH}
                rows={3}
                className="min-h-[72px] resize-y rounded-sm bg-background/70 text-sm"
              />
              <Button type="submit" size="sm" className="h-8 rounded-sm px-3">
                save note
              </Button>
            </form>
          </div>
        )}
      </article>
      {replyableStroy(story) && (
        <section className="panel p-4 sm:px-5" aria-label="Add a comment">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-foreground">
              Join the thread
            </h2>
            <span className="font-mono text-[11px] text-muted-foreground">
              {story.descendants > 0
                ? commentCount(story.descendants)
                : "first comment"}
            </span>
          </div>
          <ReplyForm storyId={story.id} logined={!!clerkUser} />
        </section>
      )}
      <Separator orientation="horizontal" className="my-1 bg-border/60" />
      <section className="space-y-3" aria-label="Comments">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-foreground">Comments</h2>
          {story.descendants > 0 && (
            <span className="font-mono text-[11px] text-muted-foreground">
              {commentCount(story.descendants)}
            </span>
          )}
        </div>
        <Comments ids={[]} story={story} />
      </section>
    </div>
  )
}
