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
      className="relative min-w-0"
      role="search"
    >
      <SearchIcon
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-primary/85"
      />
      <Input
        placeholder="Search signals"
        className="h-9 w-[10.25rem] rounded-full border-border/80 bg-background/55 pl-8 pr-3 font-sans text-sm text-foreground shadow-inner shadow-background/30 transition-[width,border-color,background-color] duration-200 placeholder:text-muted-foreground/70 focus:w-48 focus:border-primary/55 focus:bg-secondary/55 focus:ring-1 focus:ring-primary/45 sm:w-56 sm:focus:w-64"
        defaultValue={searchParams.get("query")?.toString()}
        name="query"
        autoComplete="off"
      />
    </form>
  )
}
