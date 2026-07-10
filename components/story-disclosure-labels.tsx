import { cn } from "@/lib/utils"

type Props = {
  isSelfPromo?: boolean
  commercialDisclosure?: string | null
  className?: string
  compact?: boolean
}

export default function StoryDisclosureLabels({
  isSelfPromo,
  commercialDisclosure,
  className,
  compact = false,
}: Props) {
  if (!isSelfPromo && !commercialDisclosure) {
    return null
  }

  return (
    <span
      className={cn(
        "inline-flex min-w-0 max-w-full flex-wrap items-center gap-1",
        className
      )}
    >
      {isSelfPromo && (
        <span
          className={cn(
            "whitespace-nowrap text-[10px] uppercase tracking-normal text-muted-foreground",
            !compact && "rounded-sm border border-border px-1.5 py-0.5"
          )}
        >
          self-promo
        </span>
      )}
      {commercialDisclosure && (
        <span
          className={cn(
            "max-w-full text-[10px] text-muted-foreground",
            compact
              ? "whitespace-nowrap"
              : "whitespace-normal break-words rounded-sm border border-border px-1.5 py-0.5 sm:max-w-[220px] sm:truncate sm:whitespace-nowrap"
          )}
          title={commercialDisclosure}
        >
          {compact ? "disclosed" : `disclosure: ${commercialDisclosure}`}
        </span>
      )}
    </span>
  )
}
