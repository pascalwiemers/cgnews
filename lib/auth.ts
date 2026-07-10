import "server-only"

import { cookies } from "next/headers"
import { currentUser } from "@clerk/nextjs/server"

function hasClerkCookieName(name: string) {
  return (
    name === "__session" ||
    name.startsWith("__clerk") ||
    name.startsWith("__client") ||
    name.startsWith("clerk")
  )
}

export async function hasClerkSessionCookie() {
  return (await cookies())
    .getAll()
    .some((cookie) => hasClerkCookieName(cookie.name))
}

export async function getOptionalCurrentUser() {
  if (!(await hasClerkSessionCookie())) return null
  return currentUser()
}
