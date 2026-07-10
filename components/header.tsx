"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { LogIn, Menu, Plus, X } from "lucide-react"

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
    <header className="site-header sticky top-0 z-50 w-full border-b border-white/[0.045] bg-[#050506]/90 font-sans backdrop-blur-xl">
      <div className="container max-w-5xl">
        <div className="grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-3 hover:no-underline"
            prefetch={false}
            aria-label="CGNews home"
          >
            <span className="min-w-0">
              <Logo />
            </span>
          </Link>
          <div className="hidden min-w-0 justify-center overflow-hidden px-2 lg:flex">
            {storyNavVisiable && <DesktopNav />}
          </div>
          <div className="flex min-w-0 items-center justify-end gap-2">
            <Link
              href="/submit"
              prefetch={false}
              className="hidden h-8 shrink-0 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground hover:no-underline md:inline-flex"
            >
              <Plus size={14} aria-hidden="true" />
              Submit
            </Link>
            <SearchInput />
            <Suspense fallback={null}>
              <HeaderAuth storyNavVisiable={storyNavVisiable} goto={goto} />
            </Suspense>
            <button
              type="button"
              className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-foreground/80 transition-colors hover:bg-white/[0.08] hover:text-foreground lg:hidden"
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
