import { Skeleton } from "@/components/ui/skeleton"

export default function ItemSkeleton({ length }: { length: number }) {
  return (
    <div className="space-y-1.5 pt-1">
      {Array.from({ length }).map((_, index) => {
        return (
          <div
            key={index}
            className="panel flex min-h-[4.75rem] w-full items-start gap-3 rounded-md p-3 sm:px-4"
          >
            <Skeleton className="mt-1 h-4 w-3 rounded-sm bg-muted/50" />
            <Skeleton className="mt-0.5 size-6 shrink-0 rounded-sm bg-muted/50" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-11/12 rounded-sm bg-muted/50" />
              <Skeleton className="h-3 w-7/12 rounded-sm bg-muted/40" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
