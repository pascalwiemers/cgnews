import { revalidatePath, revalidateTag } from "next/cache"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

import {
  PUBLIC_FEED_CACHE_TAG,
  PUBLIC_SEARCH_CACHE_TAG,
} from "@/lib/cache-tags"
import { getDb } from "@/lib/db"
import { getOrCreateLocalUser } from "@/lib/local-user"
import {
  parseSubmitStoryForm,
  storyTypeFeedPath,
  validateSubmitStoryInput,
} from "@/lib/submit-story"

export async function POST(req: Request) {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    return NextResponse.redirect(new URL(`/login?goto=/submit`, req.url))
  }
  try {
    const db = await getDb()
    const user = await getOrCreateLocalUser(clerkId)

    const recentStory = await db.story.findFirst({
      where: {
        authorId: user.id,
        createdAt: { gt: new Date(Date.now() - 60_000) },
      },
      select: { id: true },
    })
    if (recentStory) {
      return NextResponse.json(
        { success: false, error: "Wait a minute before submitting again" },
        { status: 429 }
      )
    }

    const formData = await req.formData()
    const { title, url, text, type, isSelfPromo, commercialDisclosure } =
      parseSubmitStoryForm(formData)
    const validationError = validateSubmitStoryInput({ title, url, text })
    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
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
