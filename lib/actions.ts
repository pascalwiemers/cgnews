"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { auth, currentUser } from "@clerk/nextjs/server"

import {
  PUBLIC_FEED_CACHE_TAG,
  PUBLIC_SEARCH_CACHE_TAG,
} from "@/lib/cache-tags"
import {
  getOrCreateCuratorUser,
  normalizeCuratorNote,
  requireCurator,
} from "@/lib/curators"
import { getDb } from "@/lib/db"
import { parseSubmitStoryForm, storyTypeFeedPath } from "@/lib/submit-story"

const PROFILE_TEXT_LIMIT = 120
const PROFILE_ABOUT_LIMIT = 800

const goto = (path: string | FormData) => {
  let target: string = "/"
  if (typeof path === "string") {
    target = path || "/"
  } else {
    target = path.get("goto")?.toString() || "/"
  }
  revalidatePath(target.substring(0, target.lastIndexOf("?")))
  redirect(target)
}

const revalidatePublicStoryCaches = () => {
  revalidateTag(PUBLIC_FEED_CACHE_TAG)
  revalidateTag(PUBLIC_SEARCH_CACHE_TAG)
}

const trimProfileText = (
  value: FormDataEntryValue | null,
  maxLength = PROFILE_TEXT_LIMIT
) => {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.slice(0, maxLength)
}

const normalizeWebsite = (value: FormDataEntryValue | null) => {
  const trimmed = trimProfileText(value, 2048)
  if (!trimmed) return null

  const candidate = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  try {
    const url = new URL(candidate)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    return url.toString()
  } catch {
    return null
  }
}

async function getOrCreateLocalUser(clerkId: string) {
  const db = await getDb()
  const clerkUser = await currentUser()
  const username = clerkUser?.username || clerkId
  const user = await db.user.findUnique({ where: { clerkId } })

  if (!user) {
    return db.user.create({
      data: {
        clerkId,
        username,
        profile: { create: {} },
      },
    })
  }

  if (user.username !== username) {
    try {
      return await db.user.update({
        where: { id: user.id },
        data: { username },
      })
    } catch {
      return user
    }
  }

  return user
}

export const faveAction = async (storyId: number, faved: boolean) => {
  const { userId: clerkId } = await auth()
  if (!clerkId) return { success: false, message: "Not Login" }
  const db = await getDb()
  const user = await db.user.findUnique({ where: { clerkId } })
  if (!user) return { success: false, message: "User not found" }
  if (faved) {
    await db.favorite.upsert({
      where: { userId_storyId: { userId: user.id, storyId } },
      update: {},
      create: { userId: user.id, storyId },
    })
  } else {
    await db.favorite
      .delete({ where: { userId_storyId: { userId: user.id, storyId } } })
      .catch(() => null)
  }
  revalidatePath("/user/favorites")
  return { success: true }
}

export const updateProfileAction = async (formData: FormData) => {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    redirect("/login?goto=/user/about")
  }

  const user = await getOrCreateLocalUser(clerkId)
  const db = await getDb()
  const profile = {
    about: trimProfileText(formData.get("about"), PROFILE_ABOUT_LIMIT) || "",
    website: normalizeWebsite(formData.get("website")),
    discipline: trimProfileText(formData.get("discipline")),
    affiliationStatus: trimProfileText(formData.get("affiliationStatus")),
    location: trimProfileText(formData.get("location")),
    timezone: trimProfileText(formData.get("timezone")),
  }

  await db.profile.upsert({
    where: { userId: user.id },
    update: profile,
    create: {
      userId: user.id,
      ...profile,
    },
  })

  revalidatePath("/user/about")
  redirect(`/user/about?id=${encodeURIComponent(user.username)}`)
}

export const replyAction = async ({
  storyId,
  parentId = null,
  text,
}: {
  storyId: number
  parentId?: number | null
  text: string
}) => {
  const { userId: clerkId } = await auth()
  if (!clerkId) return { success: false, message: "Not Login" }
  if (!Number.isInteger(storyId) || storyId < 1)
    return { success: false, message: "Invalid story" }
  const normalizedParentId = parentId ?? null
  if (
    normalizedParentId !== null &&
    (!Number.isInteger(normalizedParentId) || normalizedParentId < 1)
  ) {
    return { success: false, message: "Invalid parent comment" }
  }
  const trimmedText = text.trim()
  if (!trimmedText)
    return { success: false, message: "Please enter your comment" }
  const db = await getDb()
  const user = await db.user.findUnique({ where: { clerkId } })
  if (!user) return { success: false, message: "User not found" }

  if (normalizedParentId) {
    const parent = await db.comment.findFirst({
      where: { id: normalizedParentId, storyId },
      select: { id: true },
    })
    if (!parent) return { success: false, message: "Parent comment not found" }
  }

  await db.comment.create({
    data: {
      storyId,
      parentId: normalizedParentId,
      authorId: user.id,
      text: trimmedText,
    },
  })
  await db.story.update({
    where: { id: storyId },
    data: { descendants: { increment: 1 } },
  })
  // Ensure the item page re-renders with fresh comments
  try {
    revalidatePath("/item")
    revalidatePublicStoryCaches()
  } catch (_) {}
  return { success: true }
}

export type VoteStatus = "up" | "un"
export const voteAction = async (storyId: number, how: VoteStatus) => {
  const { userId: clerkId } = await auth()
  if (!clerkId) return { success: false, message: "Not Login" }
  const db = await getDb()
  const user = await db.user.findUnique({ where: { clerkId } })
  if (!user) return { success: false, message: "User not found" }
  if (how === "up") {
    await db.vote.upsert({
      where: { userId_storyId: { userId: user.id, storyId } },
      update: {},
      create: { userId: user.id, storyId },
    })
    await db.story.update({
      where: { id: storyId },
      data: { score: { increment: 1 } },
    })
  } else {
    await db.vote
      .delete({ where: { userId_storyId: { userId: user.id, storyId } } })
      .catch(() => null)
    await db.story.update({
      where: { id: storyId },
      data: { score: { decrement: 1 } },
    })
  }
  revalidatePath("/user/upvoted")
  revalidatePublicStoryCaches()
  return { success: true }
}

export const submitStoryAction = async (formData: FormData) => {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    redirect(`/login?goto=/submit`)
  }
  const db = await getDb()
  let user = await db.user.findUnique({ where: { clerkId } })
  if (!user) {
    // Create minimal user record if missing
    const cUser = await currentUser()
    const preferredUsername = cUser?.username || clerkId
    user = await db.user.create({
      data: {
        clerkId,
        username: preferredUsername,
        profile: { create: {} },
      },
    })
  }
  // Ensure username stays in sync with Clerk username if it changes
  try {
    const cUser = await currentUser()
    const desiredUsername = cUser?.username || clerkId
    if (desiredUsername && user.username !== desiredUsername) {
      user = await db.user.update({
        where: { id: user.id },
        data: { username: desiredUsername },
      })
    }
  } catch (_) {}

  const { title, url, text, type, isSelfPromo, commercialDisclosure } =
    parseSubmitStoryForm(formData)

  console.log(`[submitStoryAction] incoming`, {
    title,
    url,
    textLen: text.length,
    type,
    clerkId,
  })

  if (!title || (!url && !text)) {
    redirect(`/submit?error=Invalid payload`)
  }

  // Validate URL if provided
  let validatedUrl: string | null = null
  if (url) {
    try {
      // Check if URL is valid
      new URL(url)
      validatedUrl = url
    } catch (error) {
      console.error(`[submitStoryAction] Invalid URL: ${url}`, error)
      // If URL is invalid, treat it as text instead
      if (!text) {
        // If no text provided, redirect back with error
        redirect(`/submit?error=Invalid URL provided`)
      }
    }
  }

  const story = await db.story.create({
    data: {
      title,
      url: validatedUrl,
      text: text || null,
      type,
      isSelfPromo,
      commercialDisclosure,
      authorId: user.id,
    },
  })
  console.log(`[submitStoryAction] created story`, {
    storyId: story.id,
    type,
    authorId: user.id,
  })
  const destination = storyTypeFeedPath(type)
  revalidatePath(destination)
  revalidatePath("/")
  revalidatePath("/user/submitted")
  revalidatePublicStoryCaches()
  redirect(destination)
}

export const updateCuratorNoteAction = async (formData: FormData) => {
  let clerkId: string
  try {
    clerkId = await requireCurator()
  } catch (_) {
    return { success: false, message: "Forbidden" }
  }

  const storyId = Number(formData.get("storyId"))
  if (!Number.isInteger(storyId) || storyId < 1) {
    return { success: false, message: "Invalid story" }
  }

  const curator = await getOrCreateCuratorUser(clerkId)
  const db = await getDb()
  await db.story.update({
    where: { id: storyId },
    data: {
      curatorNote: normalizeCuratorNote(formData.get("curatorNote")) || null,
      curatorId: curator.id,
    },
  })
  revalidatePath("/item")
  revalidatePublicStoryCaches()
  return { success: true }
}

export const updateFeaturedStoryAction = async (formData: FormData) => {
  let clerkId: string
  try {
    clerkId = await requireCurator()
  } catch (_) {
    return { success: false, message: "Forbidden" }
  }

  const storyId = Number(formData.get("storyId"))
  if (!Number.isInteger(storyId) || storyId < 1) {
    return { success: false, message: "Invalid story" }
  }

  const curator = await getOrCreateCuratorUser(clerkId)
  const featured = formData.get("featured") === "true"
  const db = await getDb()
  await db.story.update({
    where: { id: storyId },
    data: {
      featuredAt: featured ? new Date() : null,
      curatorId: curator.id,
    },
  })
  revalidatePath("/item")
  revalidatePath("/")
  revalidatePublicStoryCaches()
  return { success: true }
}

export const logoutAction = async () => {
  const { clerkClient } = await import("@clerk/nextjs/server")
  // For server actions, we need to redirect to a client-side logout
  redirect("/sign-out")
}

export const deleteCommentAction = async (formData: FormData) => {
  const { userId: clerkId } = await auth()
  if (!clerkId) return { success: false, message: "Not Login" }
  const commentId = Number(formData.get("commentId"))
  const storyId = Number(formData.get("storyId"))
  if (!commentId) return { success: false, message: "Invalid comment" }
  const db = await getDb()
  const user = await db.user.findUnique({ where: { clerkId } })
  if (!user) return { success: false, message: "User not found" }
  const comment = await db.comment.findUnique({ where: { id: commentId } })
  if (!comment) return { success: false, message: "Comment not found" }
  if (comment.authorId !== user.id)
    return { success: false, message: "Forbidden" }
  const ageMs = Date.now() - new Date(comment.createdAt).getTime()
  const withinWindow = ageMs <= 2 * 60 * 60 * 1000
  if (!withinWindow) return { success: false, message: "Delete window expired" }
  await db.comment.update({
    where: { id: commentId },
    data: { text: "[deleted]" },
  })
  try {
    revalidatePath("/item")
    revalidateTag(PUBLIC_SEARCH_CACHE_TAG)
  } catch (_) {}
  return { success: true }
}
