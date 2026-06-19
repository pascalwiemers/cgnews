import { revalidatePath, revalidateTag } from "next/cache"
import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"

import {
  PUBLIC_FEED_CACHE_TAG,
  PUBLIC_SEARCH_CACHE_TAG,
} from "@/lib/cache-tags"
import { getDb } from "@/lib/db"
import { parseSubmitStoryForm, storyTypeFeedPath } from "@/lib/submit-story"

export async function POST(req: Request) {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return NextResponse.redirect(new URL(`/login?goto=/submit`, req.url))
  }
  try {
    const db = await getDb()
    let user = await db.user.findUnique({ where: { clerkId } })
    if (!user) {
      const cUser = await currentUser()
      const preferredUsername = cUser?.username || clerkId
      user = await db.user.create({
        data: { clerkId, username: preferredUsername, profile: { create: {} } },
      })
    } else {
      // Keep username in sync if it changed
      const cUser = await currentUser()
      const desiredUsername = cUser?.username || clerkId
      if (desiredUsername && user.username !== desiredUsername) {
        user = await db.user.update({
          where: { id: user.id },
          data: { username: desiredUsername },
        })
      }
    }

    const formData = await req.formData()
    const { title, url, text, type, isSelfPromo, commercialDisclosure } =
      parseSubmitStoryForm(formData)
    if (!title || (!url && !text)) {
      console.warn(`[api/submit] invalid payload`, {
        title,
        urlLen: url.length,
        textLen: text.length,
      })
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 }
      )
    }

    const story = await db.story.create({
      data: {
        title,
        url: url || null,
        text: text || null,
        type,
        isSelfPromo,
        commercialDisclosure,
        authorId: user.id,
      },
    })
    console.log(`[api/submit] created story`, {
      storyId: story.id,
      type,
      authorId: user.id,
    })

    const dest = storyTypeFeedPath(type)
    revalidatePath(dest)
    revalidatePath("/")
    revalidatePath("/user/submitted")
    revalidateTag(PUBLIC_FEED_CACHE_TAG)
    revalidateTag(PUBLIC_SEARCH_CACHE_TAG)

    return NextResponse.redirect(new URL(dest, req.url))
  } catch (e) {
    console.error(`[api/submit] error`, e)
    return NextResponse.json(
      { success: false, error: "Submit failed" },
      { status: 500 }
    )
  }
}
