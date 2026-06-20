"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"

const tabs = [
  {
    label: "Submissions",
  },
  {
    label: "Comments",
  },
]
export default function FavoritesTab({ userId }: { userId?: string | null }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const type = searchParams.get("type")

  return (
    <div className="flex flex-wrap items-center gap-1">
      {tabs.map((example, index) => (
        <Link
          rel="noreferrer nofollow"
          href={{
            pathname: pathname,
            query: { id: userId, type: example.label.toLowerCase() },
          }}
          key={example.label}
          data-state={
            type === example.label.toLowerCase() || (index === 0 && !type)
              ? "active"
              : "inactive"
          }
          className={cn(
            "command-focus inline-flex h-8 items-center justify-center rounded-full border px-3 font-mono text-[11px] font-semibold uppercase tracking-widest transition-colors",
            "data-[state=active]:border-primary/45 data-[state=active]:bg-primary/10 data-[state=active]:text-primary",
            "data-[state=inactive]:border-border/70 data-[state=inactive]:bg-secondary/40 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:border-primary/30 data-[state=inactive]:hover:bg-secondary/70 data-[state=inactive]:hover:text-foreground"
          )}
        >
          {example.label}
        </Link>
      ))}
    </div>
  )
}
