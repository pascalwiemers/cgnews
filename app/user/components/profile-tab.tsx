"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { profileTabs } from "@/config/conf"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export default function ProfileTab({
  userId,
  myself,
}: {
  userId: string
  myself: boolean
}) {
  const pathname = usePathname()

  return (
    <ScrollArea className="max-w-full lg:max-w-none">
      <div className="flex w-max min-w-full items-center gap-1 rounded-full border border-border/70 bg-card/40 p-1">
        {profileTabs.map((tab, index) => {
          const active =
            pathname?.endsWith(tab.label.toLowerCase()) ||
            (index === 0 && pathname === `/user`)

          return (
            (tab.public === true || myself) && (
              <Link
                rel="noreferrer nofollow"
                href={`/user/${tab.label.toLowerCase()}?id=${userId}`}
                key={tab.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-8 shrink-0 items-center justify-center rounded-full border border-transparent px-3 text-center text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:px-4",
                  active
                    ? "border-border/80 bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {tab.label}
              </Link>
            )
          )
        })}
      </div>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  )
}
