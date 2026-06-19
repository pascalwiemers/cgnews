"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Menu, X } from "lucide-react"

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
    <header className="site-header sticky top-0 z-50 w-full bg-transparent pt-3 font-sans sm:pt-4">
      <div className="container max-w-5xl overflow-hidden rounded-t-3xl">
        <div className="panel mb-0 flex h-16 items-center justify-between rounded-b-none rounded-t-3xl border-b-0 !bg-card px-6 sm:px-8">
          <div className="flex items-center space-x-12">
            <Link href="/" className="flex items-center" prefetch={false}>
              <Logo />
            </Link>
            {storyNavVisiable && <DesktopNav className="hidden md:flex" />}
          </div>
          <div className="flex items-center gap-2">
            <SearchInput />
            <Suspense fallback={null}>
              <HeaderAuth storyNavVisiable={storyNavVisiable} goto={goto} />
            </Suspense>
            <div
              className="block cursor-pointer p-2 md:hidden"
              onClick={() => setMobileNavActive(!mobileNavActive)}
            >
              {mobileNavActive ? <X size={20} /> : <Menu size={20} />}
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
    <Button size={"sm"} variant={"outline"} className="ml-1 h-7 px-2 text-xs">
      <Link
        rel="noreferrer nofollow"
        href={`/login?goto=${goto}`}
        className="text-xs"
      >
        Login
      </Link>
    </Button>
  )
}
