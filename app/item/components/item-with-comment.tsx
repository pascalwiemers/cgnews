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
import { SignalField } from "@/components/signal-field"
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
    <div className="mx-auto flex w-full max-w-4xl flex-col justify-start space-y-5">
      <article className="signal-panel overflow-hidden">
        <div className="relative overflow-hidden border-b border-border/70 p-4 sm:p-5">
          <SignalField className="-right-40 -top-28 h-72 w-[34rem] opacity-35 sm:-right-28" />
          <div className="relative grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_12rem]">
            <div className="min-w-0 space-y-3">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="command-pill border-primary/35 bg-primary/10 font-mono text-[10px] uppercase tracking-[0.12em] text-primary">
                  story dossier
                </span>
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
                  "block min-w-0 break-words text-[1.9rem] font-semibold leading-[1.08] text-foreground transition-colors hover:text-primary sm:text-4xl",
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
            <aside className="grid min-w-0 gap-2 border-t border-border/60 pt-3 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground md:border-l md:border-t-0 md:pl-4 md:pt-0">
              <div className="flex min-w-0 items-center justify-between gap-3 md:block">
                <span className="metadata-label">source</span>
                <div className="mt-0 min-w-0 truncate text-right normal-case tracking-normal text-foreground/80 md:mt-1 md:text-left">
                  {story.url ? <StoryUrl url={story.url} /> : "discussion"}
                </div>
              </div>
              <div className="flex min-w-0 items-center justify-between gap-3 border-t border-border/50 pt-2 md:block">
                <span className="metadata-label">action</span>
                <div className="mt-0 flex items-center justify-end gap-2 md:mt-2 md:justify-start">
                  <Fave storyId={story.id} faved={faved} />
                  <Link
                    href={`/item?id=${story.id}`}
                    className="command-pill h-8 rounded-md px-2 font-mono text-[10px] uppercase tracking-widest hover:no-underline"
                  >
                    permalink
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
        <div className="grid border-b border-border/70 bg-command-raised/45 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground sm:grid-cols-4">
          <div className="min-w-0 border-b border-border/50 px-4 py-2.5 sm:border-b-0 sm:border-r sm:px-5">
            <StoryPoint score={story.score} />
          </div>
          <div className="min-w-0 border-b border-border/50 px-4 py-2.5 sm:border-b-0 sm:border-r sm:px-5">
            <StoryBy by={story.by} />
          </div>
          <div className="min-w-0 border-b border-border/50 px-4 py-2.5 sm:border-b-0 sm:border-r sm:px-5">
            <StoryTime time={story.time} />
          </div>
          <div className="min-w-0 px-4 py-2.5 sm:px-5">
            {story.descendants > 0
              ? commentCount(story.descendants)
              : "no comments"}
          </div>
        </div>
        <div className="px-4 py-5 sm:px-5">
          {story.text && (
            <HtmlText
              className="block break-words text-[15px] leading-7 text-foreground/90"
              innerHtml={story.text}
            />
          )}
        </div>
        {story.curatorNote && (
          <aside className="mx-4 mb-5 border-l-2 border-command-amber/80 bg-command-amber/10 px-4 py-3 text-sm leading-6 shadow-[inset_0_1px_0_hsl(var(--foreground)/0.04)] sm:mx-5">
            <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.12em] text-command-amber">
              curator note{story.curator ? ` by ${story.curator}` : ""}
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
        <section className="panel p-4 sm:px-5" aria-label="Add a comment">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3 border-b border-border/60 pb-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold uppercase tracking-[0.08em] text-foreground">
            Comment telemetry
          </h2>
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
