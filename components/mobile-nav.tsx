"use client"

import Link, { LinkProps } from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { storyNavConfig } from "@/config/conf"
import { cn } from "@/lib/utils"

export default function MobileNav({
  active,
  onActiveChange,
}: {
  active: boolean
  onActiveChange: (open: boolean) => void
}) {
  const pathname = usePathname()
  const feedItems = storyNavConfig.slice(0, 3)
  const channelItems = storyNavConfig.slice(3, 6)

  return (
    <div
      id="mobile-navigation"
      className={cn(
        "container max-w-6xl lg:hidden",
        "grid overflow-hidden text-sm transition-all duration-300 ease-in-out",
        active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}
    >
      <div
        className={cn(
          "mt-2 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0a0a0c]/95 shadow-[0_20px_60px_rgba(0,0,0,.5),inset_0_1px_0_rgba(255,255,255,.06)] backdrop-blur-2xl"
        )}
      >
        <div className="grid gap-3 p-3">
          <MobileGroup
            label="Feeds"
            items={feedItems}
            pathname={pathname}
            onActiveChange={onActiveChange}
          />
          <MobileGroup
            label="Channels"
            items={channelItems}
            pathname={pathname}
            onActiveChange={onActiveChange}
          />
          <MobileLink
            href="/submit"
            onActiveChange={onActiveChange}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#5E6AD2] px-3 text-xs font-semibold text-white shadow-[0_4px_18px_rgba(94,106,210,.28),inset_0_1px_0_rgba(255,255,255,.2)] transition-colors hover:bg-[#6872D9] hover:text-white hover:no-underline",
              pathname === "/submit" ? "border-primary/65 bg-primary/15" : ""
            )}
          >
            <Plus size={14} aria-hidden="true" />
            Submit
          </MobileLink>
        </div>
      </div>
    </div>
  )
}

function MobileGroup({
  label,
  items,
  pathname,
  onActiveChange,
}: {
  label: string
  items: { name: string; link: string }[]
  pathname: string
  onActiveChange: (open: boolean) => void
}) {
  return (
    <div className="grid gap-2">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {items?.map(
          (item) =>
            item.link && (
              <MobileLink
                key={item.link}
                href={item.link}
                onActiveChange={onActiveChange}
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.04] px-2 text-xs font-medium text-muted-foreground transition-colors hover:border-white/[0.12] hover:bg-white/[0.07] hover:text-foreground hover:no-underline",
                  pathname === item.link ||
                    (item.link === "/top" && pathname === "/")
                    ? "border-primary/45 bg-primary/10 text-primary"
                    : ""
                )}
              >
                {item.name}
              </MobileLink>
            )
        )}
      </div>
    </div>
  )
}

interface MobileLinkProps extends LinkProps {
  onActiveChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

function MobileLink({
  href,
  onActiveChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const router = useRouter()
  return (
    <Link
      href={href}
      prefetch={false}
      onClick={() => {
        router.push(href.toString())
        onActiveChange?.(false)
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Link>
  )
}
