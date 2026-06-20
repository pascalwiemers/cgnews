"use client"

import Link, { LinkProps } from "next/link"
import { usePathname, useRouter } from "next/navigation"

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
  return (
    <div
      id="mobile-navigation"
      className={cn(
        "container max-w-5xl md:hidden",
        "grid overflow-hidden text-sm transition-all duration-300 ease-in-out",
        active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}
    >
      <div
        className={cn(
          "mt-2 overflow-hidden rounded-md border border-border/70 bg-card/95 shadow-[0_14px_32px_hsl(var(--background)/0.35)]"
        )}
      >
        <div className="grid gap-1 p-2">
          {storyNavConfig?.map(
            (item) =>
              item.link && (
                <MobileLink
                  key={item.link}
                  href={item.link}
                  onActiveChange={onActiveChange}
                  className={cn(
                    "rounded-sm px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground",
                    pathname === item.link
                      ? "bg-secondary text-primary shadow-[inset_2px_0_0_hsl(var(--primary)/0.8)]"
                      : ""
                  )}
                >
                  {item.name}
                </MobileLink>
              )
          )}
        </div>
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
