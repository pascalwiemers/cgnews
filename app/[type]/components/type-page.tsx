import { Suspense } from "react"
import { BriefcaseBusiness, Radio } from "lucide-react"

import { HnStoryType } from "@/lib/hn-types"
import ItemSkeleton from "@/components/item-skeleton"
import TypeStories from "@/app/[type]/components/type-stories"

export default function TypePage({
  pathname,
  storyType,
  cursor,
}: {
  pathname: string
  storyType: HnStoryType
  cursor?: string
}) {
  const isJobs = storyType === HnStoryType.jobstories

  if (!isJobs) {
    return (
      <Suspense
        key={`${storyType}-${cursor || "first"}`}
        fallback={<ItemSkeleton length={6} />}
      >
        <TypeStories
          pathname={pathname}
          cursor={cursor}
          storyType={storyType}
          pageSize={30}
        />
      </Suspense>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 pb-8">
      <JobsHeader />
      <Suspense
        key={`${storyType}-${cursor || "first"}`}
        fallback={<ItemSkeleton length={6} />}
      >
        <TypeStories
          pathname={pathname}
          cursor={cursor}
          storyType={storyType}
          pageSize={isJobs ? 20 : 30}
        />
      </Suspense>
    </div>
  )
}

function JobsHeader() {
  return (
    <section className="signal-panel overflow-hidden p-4 sm:p-5">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="metadata-label flex items-center gap-2">
            <BriefcaseBusiness size={13} aria-hidden="true" />
            Jobs command board
          </div>
          <h1 className="font-sans text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
            CG, VFX, animation, games, and pipeline roles
          </h1>
        </div>
        <div className="command-panel min-w-0 px-3 py-2 text-sm">
          <div className="metadata-label mb-1 flex items-center gap-1.5">
            <Radio size={12} aria-hidden="true" />
            Posting signal
          </div>
          <p className="max-w-sm text-muted-foreground [overflow-wrap:anywhere]">
            Prefer clear location, remote policy, contract type, and pay range.
          </p>
        </div>
      </div>
    </section>
  )
}
