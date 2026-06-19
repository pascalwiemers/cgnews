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
    <span className={cn("inline-flex min-w-0 items-center gap-1", className)}>
      {isSelfPromo && (
        <span className="rounded-sm border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-normal text-muted-foreground">
          self-promo
        </span>
      )}
      {commercialDisclosure && (
        <span
          className="max-w-[220px] truncate rounded-sm border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground"
          title={commercialDisclosure}
        >
          disclosure: {commercialDisclosure}
        </span>
      )}
    </span>
  )
}
