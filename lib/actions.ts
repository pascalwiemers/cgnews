"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"

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

export const faveAction = async (storyId: number, faved: boolean) => {
  const { userId: clerkId } = await auth()
  if (!clerkId) return { success: false, message: "Not Login" }
  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) return { success: false, message: "User not found" }
  if (faved) {
    await prisma.favorite.upsert({
      where: { userId_storyId: { userId: user.id, storyId } },
      update: {},
      create: { userId: user.id, storyId },
    })
  } else {
    await prisma.favorite.delete({ where: { userId_storyId: { userId: user.id, storyId } } }).catch(() => null)
  }
  revalidatePath("/user/favorites")
  return { success: true }
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
  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) return { success: false, message: "User not found" }

  if (normalizedParentId) {
    const parent = await prisma.comment.findFirst({
      where: { id: normalizedParentId, storyId },
      select: { id: true },
    })
    if (!parent) return { success: false, message: "Parent comment not found" }
  }

  await prisma.$transaction([
    prisma.comment.create({
      data: {
        storyId,
        parentId: normalizedParentId,
        authorId: user.id,
        text: trimmedText,
      },
    }),
    prisma.story.update({
      where: { id: storyId },
      data: { descendants: { increment: 1 } },
    }),
  ])
  // Ensure the item page re-renders with fresh comments
  try {
    revalidatePath("/item")
  } catch (_) {}
  return { success: true }
}

export type VoteStatus = "up" | "un"
export const voteAction = async (storyId: number, how: VoteStatus) => {
  const { userId: clerkId } = await auth()
  if (!clerkId) return { success: false, message: "Not Login" }
  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) return { success: false, message: "User not found" }
  if (how === "up") {
    await prisma.vote.upsert({
      where: { userId_storyId: { userId: user.id, storyId } },
      update: {},
      create: { userId: user.id, storyId },
    })
    await prisma.story.update({ where: { id: storyId }, data: { score: { increment: 1 } } })
  } else {
    await prisma.vote.delete({ where: { userId_storyId: { userId: user.id, storyId } } }).catch(() => null)
    await prisma.story.update({ where: { id: storyId }, data: { score: { decrement: 1 } } })
  }
  revalidatePath("/user/upvoted")
  return { success: true }
}

export const submitStoryAction = async (formData: FormData) => {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    redirect(`/login?goto=/submit`)
  }
  let user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) {
    // Create minimal user record if missing
    const cUser = await currentUser()
    const preferredUsername = cUser?.username || clerkId
    user = await prisma.user.create({
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
      user = await prisma.user.update({
        where: { id: user.id },
        data: { username: desiredUsername },
      })
    }
  } catch (_) {}

  const title = String(formData.get("title") || "").trim()
  const url = String(formData.get("url") || "").trim()
  const text = String(formData.get("text") || "").trim()

  console.log(`[submitStoryAction] incoming`, { title, url, textLen: text.length, clerkId })

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

  const type = validatedUrl ? "LINK" : "ASK"
  const story = await prisma.story.create({
    data: {
      title,
      url: validatedUrl,
      text: text || null,
      type: type as any,
      authorId: user.id,
    },
  })
  console.log(`[submitStoryAction] created story`, { storyId: story.id, type, authorId: user.id })
  // Redirect to appropriate feed
  if (validatedUrl) {
    revalidatePath("/new")
    revalidatePath("/")
    revalidatePath("/user/submitted")
    redirect(`/new`)
  } else {
    revalidatePath("/ask")
    revalidatePath("/")
    revalidatePath("/user/submitted")
    redirect(`/ask`)
  }
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
  const user = await prisma.user.findUnique({ where: { clerkId } })
  if (!user) return { success: false, message: "User not found" }
  const comment = await prisma.comment.findUnique({ where: { id: commentId } })
  if (!comment) return { success: false, message: "Comment not found" }
  if (comment.authorId !== user.id) return { success: false, message: "Forbidden" }
  const ageMs = Date.now() - new Date(comment.createdAt).getTime()
  const withinWindow = ageMs <= 2 * 60 * 60 * 1000
  if (!withinWindow) return { success: false, message: "Delete window expired" }
  await prisma.comment.update({ where: { id: commentId }, data: { text: "[deleted]" } })
  try { revalidatePath('/item') } catch (_) {}
  return { success: true }
}
