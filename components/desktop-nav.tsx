"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { storyNavConfig } from "@/config/conf"
import { cn } from "@/lib/utils"

interface DesktopNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DesktopNav({ className, ...props }: DesktopNavProps) {
  const pathname = usePathname()
  const feedItems = storyNavConfig.slice(0, 3)
  const channelItems = storyNavConfig.slice(3, 6)

  return (
    <div className={className} {...props}>
      <nav className="flex items-center gap-5 text-xs">
        <NavGroup items={feedItems} pathname={pathname} homeAsActive />
        <NavGroup items={channelItems} pathname={pathname} />
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
    <div className="inline-flex min-w-0 items-center gap-4">
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
              "tab-underline py-1 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground hover:no-underline",
              active ? "tab-underline-active text-foreground" : ""
            )}
          >
            {navItem.name}
          </Link>
        )
      })}
    </div>
  )
}
