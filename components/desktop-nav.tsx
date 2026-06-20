"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus } from "lucide-react"

import { storyNavConfig } from "@/config/conf"
import { cn } from "@/lib/utils"

interface DesktopNavProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DesktopNav({ className, ...props }: DesktopNavProps) {
  const pathname = usePathname()

  return (
    <div className={className} {...props}>
      <nav className="flex items-center gap-1 text-xs">
        <Link
          href="/"
          prefetch={false}
          className={cn(
            "rounded-sm px-2.5 py-1.5 font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground",
            pathname === "/"
              ? "bg-secondary text-primary shadow-[inset_0_-1px_0_hsl(var(--primary)/0.75)]"
              : ""
          )}
        >
          Top
        </Link>
        {storyNavConfig.slice(1, 6).map((navItem) => {
          return (
            <Link
              key={navItem.name}
              href={navItem.link}
              prefetch={false}
              className={cn(
                "rounded-sm px-2.5 py-1.5 font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground",
                pathname === navItem.link
                  ? "bg-secondary text-primary shadow-[inset_0_-1px_0_hsl(var(--primary)/0.75)]"
                  : ""
              )}
            >
              {navItem.name}
            </Link>
          )
        })}
        <Link
          href="/submit"
          prefetch={false}
          className={cn(
            "ml-2 inline-flex h-8 items-center gap-1.5 rounded-md border border-primary/25 bg-primary/10 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-primary transition-colors hover:border-primary/50 hover:bg-primary/15 hover:text-primary",
            pathname === "/submit" ? "border-primary/60 bg-primary/15" : ""
          )}
        >
          <Plus size={14} /> Submit
        </Link>
      </nav>
    </div>
  )
}
