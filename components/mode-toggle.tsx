"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const isDark = theme === "dark"
  return (
    <Button
      type="button"
      variant="ghost"
      className="size-8 px-0"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {mounted ? (
        isDark ? (
          <Moon className="size-[1.2rem]" />
        ) : (
          <Sun className="size-[1.2rem]" />
        )
      ) : (
        <span className="inline-block size-[1.2rem]" />
      )}
    </Button>
  )
}
