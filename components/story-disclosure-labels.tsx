import { cn } from "@/lib/utils"

type Props = {
  isSelfPromo?: boolean
  commercialDisclosure?: string | null
  className?: string
}

export default function StoryDisclosureLabels({
  isSelfPromo,
  commercialDisclosure,
  className,
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
        <span className="whitespace-nowrap rounded-sm border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-normal text-muted-foreground">
          self-promo
        </span>
      )}
      {commercialDisclosure && (
        <span
          className="max-w-full whitespace-normal break-words rounded-sm border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground sm:max-w-[220px] sm:truncate sm:whitespace-nowrap"
          title={commercialDisclosure}
        >
          disclosure: {commercialDisclosure}
        </span>
      )}
    </span>
  )
}
