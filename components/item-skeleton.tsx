import { Skeleton } from "@/components/ui/skeleton"

export default function ItemSkeleton({ length }: { length: number }) {
  return (
    <div className="space-y-4 pt-1">
      <div className="rounded-md border border-border/80 bg-card/85">
        <div className="border-b border-border/70 px-4 py-3">
          <Skeleton className="h-3 w-44 rounded-sm bg-muted/50" />
        </div>
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1.5fr)_minmax(17rem,0.8fr)]">
          <div className="min-h-72 space-y-4 border-b border-border/70 p-4 lg:border-b-0 lg:border-r">
            <Skeleton className="h-5 w-28 rounded-full bg-muted/50" />
            <Skeleton className="h-8 w-11/12 rounded-sm bg-muted/50" />
            <Skeleton className="h-8 w-8/12 rounded-sm bg-muted/50" />
            <div className="grid gap-3 pt-8 sm:grid-cols-3">
              <Skeleton className="h-14 rounded-md bg-muted/40" />
              <Skeleton className="h-14 rounded-md bg-muted/40" />
              <Skeleton className="h-14 rounded-md bg-muted/40" />
            </div>
          </div>
          <div className="min-h-72 space-y-3 p-4">
            <Skeleton className="h-5 w-36 rounded-full bg-muted/50" />
            <Skeleton className="h-6 w-10/12 rounded-sm bg-muted/50" />
            <div className="space-y-2 pt-12">
              <Skeleton className="h-9 rounded-md bg-muted/40" />
              <Skeleton className="h-9 rounded-md bg-muted/40" />
              <Skeleton className="h-9 rounded-md bg-muted/40" />
            </div>
          </div>
        </div>
      </div>
      {Array.from({ length }).map((_, index) => {
        return (
          <div
            key={index}
            className="grid min-h-[4.75rem] w-full grid-cols-[auto_minmax(0,1fr)] overflow-hidden rounded-md border border-border/75 bg-card/90 sm:grid-cols-[auto_auto_minmax(0,1fr)]"
          >
            <div className="hidden w-11 border-r border-border/60 bg-secondary/25 p-3 sm:block">
              <Skeleton className="h-3 w-4 rounded-sm bg-muted/50" />
            </div>
            <div className="w-8 border-r border-border/50 p-3 sm:w-9">
              <Skeleton className="h-4 w-3 rounded-sm bg-muted/50" />
            </div>
            <div className="flex min-w-0 items-start gap-3 p-3 sm:px-4">
              <Skeleton className="size-7 shrink-0 rounded-sm bg-muted/50" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-11/12 rounded-sm bg-muted/50" />
                <Skeleton className="h-3 w-7/12 rounded-sm bg-muted/40" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
