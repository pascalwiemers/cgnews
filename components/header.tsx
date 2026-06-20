"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { LogIn, Menu, Radio, X } from "lucide-react"

import { showStoryNav } from "@/config/conf"
import { HnUser } from "@/lib/hn-types"
import { Button } from "@/components/ui/button"
import { DesktopNav } from "@/components/desktop-nav"
import Logo from "@/components/logo"
import MobileNav from "@/components/mobile-nav"
import SearchInput from "@/components/search-input"
import { UserNav } from "@/components/user-nav"

function toHeaderUser(user: ReturnType<typeof useUser>["user"]): HnUser | null {
  if (!user) return null

  return {
    id: user.username || user.id,
    about: "",
    created: user.createdAt
      ? Math.floor(new Date(user.createdAt).getTime() / 1000)
      : 0,
    karma: 0,
    submitted: [],
  }
}

export function Header() {
  const pathname = usePathname()
  const goto = pathname || "/"
  const storyNavVisiable = showStoryNav(pathname)
  const [mobileNavActive, setMobileNavActive] = useState(false)

  return (
    <header className="site-header sticky top-0 z-50 w-full bg-background/70 pt-2 font-sans backdrop-blur-xl sm:pt-3">
      <div className="container max-w-5xl">
        <div className="rounded-md border border-border/80 bg-card/95 shadow-[0_16px_44px_hsl(var(--background)/0.5),inset_0_1px_0_hsl(var(--foreground)/0.06)]">
          <div className="flex min-h-14 items-center justify-between gap-3 px-3 py-2 sm:min-h-[3.8rem] sm:px-4">
            <Link
              href="/"
              className="group flex min-w-0 items-center gap-3 hover:no-underline"
              prefetch={false}
              aria-label="CGNews home"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-md border border-primary/30 bg-primary/10 font-mono text-[11px] font-black uppercase tracking-[0.08em] text-primary shadow-[inset_0_0_18px_hsl(var(--primary)/0.08)]">
                CG
              </span>
              <span className="min-w-0">
                <Logo />
                <span className="hidden font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:block">
                  command feed
                </span>
              </span>
            </Link>
            <div className="hidden min-w-0 flex-1 justify-center px-2 md:flex">
              {storyNavVisiable && <DesktopNav />}
            </div>
            <div className="flex min-w-0 items-center justify-end gap-2">
              <div className="hidden items-center gap-1.5 rounded-full border border-border/70 bg-secondary/40 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground lg:flex">
                <Radio size={12} className="text-primary" aria-hidden="true" />
                live
              </div>
              <SearchInput />
              <Suspense fallback={null}>
                <HeaderAuth storyNavVisiable={storyNavVisiable} goto={goto} />
              </Suspense>
              <button
                type="button"
                className="grid size-9 shrink-0 place-items-center rounded-md border border-border/70 bg-secondary/50 text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground md:hidden"
                onClick={() => setMobileNavActive(!mobileNavActive)}
                aria-label={
                  mobileNavActive ? "Close navigation" : "Open navigation"
                }
                aria-expanded={mobileNavActive}
                aria-controls="mobile-navigation"
              >
                {mobileNavActive ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
      <MobileNav active={mobileNavActive} onActiveChange={setMobileNavActive} />
    </header>
  )
}

function HeaderAuth({
  storyNavVisiable,
  goto,
}: {
  storyNavVisiable: boolean
  goto: string
}) {
  const { isLoaded, user: clerkUser } = useUser()
  const user = toHeaderUser(clerkUser)

  if (!isLoaded) return null
  if (user) return <UserNav user={user} />
  if (!storyNavVisiable) return null

  return (
    <Button
      asChild
      size="sm"
      variant="outline"
      className="h-8 rounded-md border-border/70 bg-secondary/40 px-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-foreground/80 hover:bg-secondary hover:text-foreground sm:px-3"
    >
      <Link
        rel="noreferrer nofollow"
        href={`/login?goto=${goto}`}
        className="gap-1.5 text-xs"
        aria-label="Login"
      >
        <LogIn size={14} aria-hidden="true" />
        <span className="hidden sm:inline">Login</span>
      </Link>
    </Button>
  )
}
