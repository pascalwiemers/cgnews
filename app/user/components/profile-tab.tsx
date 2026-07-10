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
      <div className="flex w-max min-w-full items-center gap-1 border-b border-border/70">
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
                  "command-focus -mb-px flex h-9 shrink-0 items-center justify-center border-b-2 px-3 text-center text-xs font-medium transition-colors md:px-4",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
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
