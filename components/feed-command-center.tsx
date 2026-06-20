"use client"

import Link from "next/link"
import { Activity, ArrowRight, Sparkles } from "lucide-react"

import {
  hideCommentCount,
  hideScore,
  hideUsername,
  hideVote,
  hnItem2HnWebStory,
} from "@/lib/hn-item-utils"
import { HnItem } from "@/lib/hn-types"
import { SignalField } from "@/components/signal-field"
import Story from "@/components/story"

type FeedCommandCenterProps = {
  stories: HnItem[]
  offset: number
  moreLink?: string
}

const storyTypeLabel: Record<string, string> = {
  LINK: "Link",
  ASK: "Ask",
  SHOW: "Show",
  JOB: "Job",
}

export default function FeedCommandCenter({
  stories,
  offset,
  moreLink,
}: FeedCommandCenterProps) {
  const [leadStory, ...streamStories] = stories
  const lead = leadStory ? hnItem2HnWebStory(leadStory) : null

  if (!leadStory || !lead) {
    return (
      <section className="grid min-h-64 place-items-center rounded-md border border-border/80 bg-card/85 px-4 py-12 text-center">
        <div className="space-y-2">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            Signal quiet
          </p>
          <h1 className="text-xl font-semibold text-foreground">
            No dispatches found
          </h1>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            Try another feed or a broader search phrase.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="rounded-md border border-border/80 bg-card/85">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-3 py-2 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid size-6 place-items-center rounded-sm border border-primary/30 bg-primary/10">
              <Activity size={13} className="text-primary" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                CGNews command center
              </p>
              <h1 className="truncate text-lg font-semibold leading-tight text-foreground sm:text-xl">
                Production signal feed
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            <span className="rounded-full border border-border/70 bg-secondary/45 px-2 py-1">
              {stories.length} items
            </span>
            <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-amber-200">
              lead locked
            </span>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.5fr)_minmax(17rem,0.8fr)]">
          <LeadStory story={leadStory} />
          <SignalPanel
            storyCount={stories.length}
            streamCount={streamStories.length}
          />
        </div>
      </div>

      <div className="rounded-md border border-border/80 bg-card/80">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/70 px-3 py-2 sm:px-4">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Stream
            </p>
            <h2 className="text-sm font-semibold text-foreground">
              Latest operator dispatches
            </h2>
          </div>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            rank / type / signal
          </span>
        </div>
        <div className="p-2 sm:p-3">
          {streamStories.map((story, index) => (
            <Story
              key={story.id}
              rank={offset + index + 1}
              data={hnItem2HnWebStory(story)}
              hideVote={hideVote(story.type)}
              hidePoints={hideScore(story.type)}
              hideCommentCount={hideCommentCount(story.type)}
              hideUsername={hideUsername(story.type)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-1">
        {moreLink && (
          <Link
            className="inline-flex h-9 items-center gap-2 rounded-full border border-border/80 bg-secondary/45 px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/80 transition-colors hover:border-primary/45 hover:bg-secondary/70 hover:text-primary hover:no-underline"
            href={moreLink}
            prefetch={false}
            scroll={true}
          >
            More signals
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        )}
      </div>
    </section>
  )
}

function LeadStory({ story }: { story: HnItem }) {
  const lead = hnItem2HnWebStory(story)
  const href = lead.dead ? "" : lead.url || `item?id=${lead.id}`
  const typeLabel = story.storyType ? storyTypeLabel[story.storyType] : "Link"

  return (
    <article className="relative min-h-[22rem] overflow-hidden border-b border-border/70 p-4 sm:p-5 lg:border-b-0 lg:border-r">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-primary/70 via-amber-300/55 to-transparent" />
      <div className="relative z-10 flex h-full flex-col justify-between gap-8">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]">
            <span className="rounded-full border border-amber-300/35 bg-amber-300/10 px-2.5 py-1 text-amber-200">
              Lead story
            </span>
            <span className="rounded-full border border-border/70 bg-secondary/45 px-2.5 py-1 text-muted-foreground">
              {typeLabel}
            </span>
          </div>
          <div className="space-y-3">
            <Link
              className="hn-story-link block max-w-3xl text-balance text-2xl font-semibold leading-tight text-foreground transition-colors hover:text-primary sm:text-3xl"
              href={href}
              rel="noopener noreferrer nofollow"
              target={lead.url ? "_blank" : "_self"}
            >
              {(lead.dead ? "[dead] " : "") + lead.title}
            </Link>
            {lead.sitestr && (
              <Link
                className="hn-story-link inline-flex max-w-full break-all font-mono text-xs font-semibold uppercase tracking-[0.12em] text-primary/85 hover:text-primary"
                href={`/search?query=${lead.sitestr}&sort=byDate`}
                rel="noopener noreferrer nofollow"
              >
                {lead.sitestr}
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <LeadMetric label="Score" value={lead.score || "0"} />
          <LeadMetric label="By" value={lead.by || "unknown"} />
          <LeadMetric label="Age" value={lead.age || "now"} />
        </div>
      </div>
    </article>
  )
}

function LeadMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/70 bg-background/35 px-3 py-2">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-semibold text-foreground">
        {value}
      </div>
    </div>
  )
}

function SignalPanel({
  storyCount,
  streamCount,
}: {
  storyCount: number
  streamCount: number
}) {
  return (
    <aside className="signal-panel relative min-h-[22rem] overflow-hidden p-4 sm:p-5">
      <SignalField className="opacity-55" />
      <div className="relative z-10 flex h-full flex-col justify-between gap-6">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            <Sparkles size={12} aria-hidden="true" />
            deterministic signal
          </div>
          <h2 className="max-w-xs text-xl font-semibold leading-tight text-foreground">
            Observatory panel for the current feed window
          </h2>
        </div>
        <div className="grid gap-2">
          <SignalMetric label="Window" value={`${storyCount} stories`} />
          <SignalMetric label="Queued" value={`${streamCount} rows`} />
          <SignalMetric label="Mode" value="human curated" amber />
        </div>
      </div>
    </aside>
  )
}

function SignalMetric({
  label,
  value,
  amber = false,
}: {
  label: string
  value: string
  amber?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-background/45 px-3 py-2">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span
        className={
          amber
            ? "font-mono text-xs font-semibold uppercase tracking-[0.08em] text-amber-200"
            : "font-mono text-xs font-semibold uppercase tracking-[0.08em] text-foreground"
        }
      >
        {value}
      </span>
    </div>
  )
}
