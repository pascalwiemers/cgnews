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
    <div className="mx-auto flex w-full max-w-4xl flex-col justify-start space-y-6">
      <article className="overflow-hidden rounded-xl border border-border/70 bg-card/65 shadow-[0_18px_50px_hsl(var(--background)/0.28)]">
        <div className="space-y-4 p-4 sm:p-6">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {story.dead && (
              <span className="command-pill border-destructive/40 bg-destructive/10 text-destructive">
                flagged
              </span>
            )}
            <StoryDisclosureLabels
              isSelfPromo={story.isSelfPromo}
              commercialDisclosure={story.commercialDisclosure}
            />
          </div>
          <Link
            className={cn(
              "block min-w-0 break-words text-[1.9rem] font-semibold leading-[1.1] text-foreground transition-colors hover:text-primary sm:text-4xl",
              story.dead && "text-muted-foreground hover:text-muted-foreground"
            )}
            rel="noopener noreferrer nofollow"
            href={story.url || `/item?id=${story.id}`}
            target={story.url ? "_blank" : "_self"}
          >
            {story.dead ? "[flagged] " : ""}
            {story.title}
          </Link>
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground">
            <StoryPoint score={story.score} />
            <StoryBy by={story.by} />
            <StoryTime time={story.time} />
            <span>
              {story.descendants > 0
                ? commentCount(story.descendants)
                : "no comments"}
            </span>
            {story.url ? <StoryUrl url={story.url} /> : <span>discussion</span>}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Fave storyId={story.id} faved={faved} />
            <Link
              href={`/item?id=${story.id}`}
              className="underline-offset-4 hover:text-primary hover:underline"
            >
              Permalink
            </Link>
          </div>
        </div>
        {story.text && (
          <div className="border-t border-border/60 p-4 sm:px-6">
            <HtmlText
              className="block break-words text-[15px] leading-7 text-foreground/90"
              innerHtml={story.text}
            />
          </div>
        )}
        {story.curatorNote && (
          <aside className="mx-4 mb-4 rounded-lg border border-command-amber/25 bg-command-amber/[0.06] px-4 py-3 text-sm leading-6 sm:mx-6 sm:mb-6">
            <div className="mb-1 text-xs font-medium text-command-amber/90">
              Curator note{story.curator ? ` by ${story.curator}` : ""}
            </div>
            <p className="whitespace-pre-wrap break-words text-foreground/90">
              {story.curatorNote}
            </p>
          </aside>
        )}
        {curator && (
          <div className="border-t border-border/70 bg-command-raised/30 p-4 sm:px-5">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="metadata-label">curator controls</span>
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
                  className="h-7 rounded-md px-2 font-mono text-[11px]"
                >
                  {story.featuredAt ? "unfeature" : "feature"}
                </Button>
              </form>
              {story.featuredAt && (
                <span className="command-pill border-command-amber/40 bg-command-amber/10 text-command-amber">
                  featured
                </span>
              )}
            </div>
            <form action={updateCuratorNoteFormAction} className="space-y-2">
              <input type="hidden" name="storyId" value={story.id} />
              <Textarea
                name="curatorNote"
                defaultValue={story.curatorNote || ""}
                maxLength={CURATOR_NOTE_MAX_LENGTH}
                rows={3}
                className="min-h-[84px] resize-y rounded-md border-border/80 bg-background/75 text-sm leading-6 focus-visible:ring-primary/60"
              />
              <Button type="submit" size="sm" className="h-8 rounded-md px-3">
                save note
              </Button>
            </form>
          </div>
        )}
      </article>
      {replyableStroy(story) && (
        <section
          className="rounded-xl border border-border/70 bg-card/55 p-4 sm:p-5"
          aria-label="Add a comment"
        >
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="text-sm font-semibold text-foreground">
              Add a comment
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
      <section className="space-y-3" aria-label="Comments">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
          <h2 className="text-lg font-semibold text-foreground">Discussion</h2>
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
