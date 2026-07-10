"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { SearchIcon } from "lucide-react"

import { Input } from "@/components/ui/input"

export default function SearchInput() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace, push } = useRouter()

  const submitSearch = (value?: string) => {
    const query = value?.trim()
    if (!query) return

    const target = `/search?query=${encodeURIComponent(query)}`
    if (pathname === "/search") {
      replace(target)
    } else {
      push(target)
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        submitSearch(formData.get("query")?.toString())
      }}
      className="relative hidden min-w-0 sm:block"
      role="search"
    >
      <SearchIcon
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        placeholder="Search stories"
        className="h-9 w-40 rounded-lg border-white/10 bg-white/[0.045] pl-8 pr-3 font-sans text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,.03)] transition-all duration-200 placeholder:text-muted-foreground/70 focus:border-primary/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-primary/20 xl:w-52"
        defaultValue={searchParams.get("query")?.toString()}
        name="query"
        autoComplete="off"
      />
    </form>
  )
}
