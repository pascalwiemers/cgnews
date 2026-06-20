"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus } from "lucide-react"

import { storyNavConfig } from "@/config/conf"
import { cn } from "@/lib/utils"

interface DesktopNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DesktopNav({ className, ...props }: DesktopNavProps) {
  const pathname = usePathname()
  const feedItems = storyNavConfig.slice(0, 3)
  const channelItems = storyNavConfig.slice(3, 6)

  return (
    <div className={className} {...props}>
      <nav className="flex items-center gap-2 text-xs">
        <NavGroup items={feedItems} pathname={pathname} homeAsActive />
        <NavGroup items={channelItems} pathname={pathname} />
        <Link
          href="/submit"
          prefetch={false}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-primary transition-colors hover:border-primary/55 hover:bg-primary/15 hover:text-primary hover:no-underline",
            pathname === "/submit" ? "border-primary/60 bg-primary/15" : ""
          )}
        >
          <Plus size={14} /> Submit
        </Link>
      </nav>
    </div>
  )
}

function NavGroup({
  items,
  pathname,
  homeAsActive = false,
}: {
  items: { name: string; link: string }[]
  pathname: string
  homeAsActive?: boolean
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-secondary/35 p-1">
      {items.map((navItem) => {
        const active =
          pathname === navItem.link ||
          (homeAsActive && navItem.link === "/top" && pathname === "/")

        return (
          <Link
            key={navItem.name}
            href={navItem.link}
            prefetch={false}
            className={cn(
              "rounded-full px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-secondary/75 hover:text-foreground hover:no-underline",
              active
                ? "bg-primary/12 text-primary shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.28)]"
                : ""
            )}
          >
            {navItem.name}
          </Link>
        )
      })}
    </div>
  )
}
