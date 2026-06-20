"use client"

import Link from "next/link"
import { SignOutButton } from "@clerk/nextjs"
import {
  Bookmark,
  LogOut,
  MessageCircle,
  Send,
  Triangle,
  UserRound,
} from "lucide-react"

import { HnUser } from "@/lib/hn-types"
import { formatDate } from "@/lib/time-utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function UserNav({ user }: { user: HnUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="command-focus relative ml-1 size-8 rounded-full border border-border/70 bg-card/70 p-0 hover:border-primary/35 hover:bg-secondary/70"
        >
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 font-mono text-[11px] font-semibold text-primary">
              {capitalizeFirstTwoChars(user.id)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 border-border/80 bg-popover/95 p-1.5"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="break-all text-sm font-semibold leading-none">
              {user.id}
            </p>
            <p className="metadata-label pt-1">{formatDate(user.created)}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link
              className="gap-2"
              rel="noreferrer nofollow"
              href={`/user?id=${user.id}`}
            >
              <UserRound size={14} className="mr-2" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              className="gap-2"
              rel="noreferrer nofollow"
              href={`/user/submitted?id=${user.id}`}
            >
              <Send size={14} className="mr-2" /> Submissions
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              className="gap-2"
              rel="noreferrer nofollow"
              href={`/user/comments?id=${user.id}`}
            >
              <MessageCircle size={14} className="mr-2" />
              Comments
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link className="gap-2" href={`/user/favorites?id=${user.id}`}>
              <Bookmark size={14} className="mr-2" />
              Favorites
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              className="gap-2"
              rel="noreferrer nofollow"
              href={`/user/upvoted?id=${user.id}`}
            >
              <Triangle size={14} className="mr-2" />
              Upvoted
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <SignOutButton redirectUrl="/">
            <button type="button" className="hover:cursor-default">
              <LogOut size={14} className="mr-2 inline" />
              Log out
            </button>
          </SignOutButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function capitalizeFirstTwoChars(id: string) {
  if (id.length >= 2) {
    const firstTwoChars = id.substring(0, 2)
    const capitalizedChars = firstTwoChars.toUpperCase()
    return capitalizedChars
  } else {
    return id
  }
}
