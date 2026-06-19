import "server-only"

import { auth, currentUser } from "@clerk/nextjs/server"

import { hasClerkSessionCookie } from "@/lib/auth"
import { getDb } from "@/lib/db"

export const CURATOR_NOTE_MAX_LENGTH = 500

function curatorClerkIds() {
  return new Set(
    (process.env.CGNEWS_CURATOR_CLERK_IDS || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  )
}

export function isCuratorClerkId(clerkId?: string | null) {
  return Boolean(clerkId && curatorClerkIds().has(clerkId))
}

export async function isCurator() {
  if (!hasClerkSessionCookie()) return false
  const { userId } = await auth()
  return isCuratorClerkId(userId)
}

export async function requireCurator() {
  const { userId } = await auth()
  if (!userId || !isCuratorClerkId(userId)) {
    throw new Error("Forbidden")
  }
  return userId
}

export function normalizeCuratorNote(note: FormDataEntryValue | null) {
  return String(note || "")
    .replace(/\r\n?/g, "\n")
    .trim()
    .slice(0, CURATOR_NOTE_MAX_LENGTH)
}

export async function getOrCreateCuratorUser(clerkId: string) {
  const db = await getDb()
  const existing = await db.user.findUnique({ where: { clerkId } })
  if (existing) return existing

  const clerkUser = await currentUser()
  return db.user.create({
    data: {
      clerkId,
      username: clerkUser?.username || clerkId,
      profile: { create: {} },
    },
  })
}
