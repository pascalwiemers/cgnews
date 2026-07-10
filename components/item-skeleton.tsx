import { Skeleton } from "@/components/ui/skeleton"

export default function ItemSkeleton({ length }: { length: number }) {
  return (
    <div className="space-y-4 pt-1">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
        <Skeleton className="h-4 w-20 rounded bg-white/[0.06]" />
        <Skeleton className="h-3 w-14 rounded bg-white/[0.04]" />
      </div>
      <div className="space-y-0.5">
        {Array.from({ length }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[2rem_1.5rem_minmax(0,1fr)] py-1 sm:grid-cols-[2.75rem_1.5rem_minmax(0,1fr)]"
          >
            <div className="grid place-items-start justify-end pt-3">
              <Skeleton className="h-3 w-4 rounded bg-white/[0.05]" />
            </div>
            <div className="grid place-items-start justify-center pt-3">
              <Skeleton className="size-3 rounded bg-white/[0.06]" />
            </div>
            <div className="space-y-1.5 py-2 pr-4">
              <Skeleton className="h-4 w-10/12 rounded bg-white/[0.07]" />
              <Skeleton className="h-3 w-5/12 rounded bg-white/[0.045]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
