import "server-only"

import { currentUser } from "@clerk/nextjs/server"

import { getDb } from "@/lib/db"

function fallbackUsername(clerkId: string) {
  return `user_${clerkId.replace(/[^a-zA-Z0-9]/g, "").slice(-10)}`
}

export async function getOrCreateLocalUser(clerkId: string) {
  const db = await getDb()
  const existing = await db.user.findUnique({ where: { clerkId } })
  const clerkUser = await currentUser()
  const preferredUsername =
    clerkUser?.username?.trim() || fallbackUsername(clerkId)

  if (existing) {
    if (existing.username === preferredUsername) return existing
    try {
      return await db.user.update({
        where: { id: existing.id },
        data: { username: preferredUsername },
      })
    } catch {
      return existing
    }
  }

  try {
    return await db.user.create({
      data: {
        clerkId,
        username: preferredUsername,
        profile: { create: {} },
      },
    })
  } catch {
    const racedUser = await db.user.findUnique({ where: { clerkId } })
    if (racedUser) return racedUser
    return db.user.create({
      data: {
        clerkId,
        username: `${preferredUsername.slice(0, 48)}_${clerkId.slice(-6)}`,
        profile: { create: {} },
      },
    })
  }
}
