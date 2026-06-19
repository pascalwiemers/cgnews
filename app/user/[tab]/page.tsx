import { Metadata, ResolvingMetadata } from "next"
import { notFound, redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { CakeSlice } from "lucide-react"

import { profileTabs } from "@/config/conf"
import { getDb } from "@/lib/db"
import { formatDate } from "@/lib/time-utils"
import { Separator } from "@/components/ui/separator"

import ProfileTab from "../components/profile-tab"
import TabAbout from "../components/tab-about"
import TabComments from "../components/tab-comments"
import TabFavorites from "../components/tab-favorites"
import TabSubmitted from "../components/tab-submitted"
import TabUpvoted from "../components/tab-upvoted"

type Props = {
  params: { tab: string }
  searchParams: {
    id: string
    next: number
    n: number
    type: string
  }
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const userId = searchParams.id
  const tab = params.tab
  return {
    title: tab === "about" ? `Profile: ${userId}` : `${userId}'s ${tab}`,
  }
}

export type UserProfileDetails = {
  about: string
  website: string | null
  discipline: string | null
  affiliationStatus: string | null
  location: string | null
  timezone: string | null
}

type ProfileUser = {
  id: string
  created: number
  karma: number
  profile: UserProfileDetails
}

export default async function TabPage({ params, searchParams }: Props) {
  const cu = await currentUser()
  const target = searchParams.id || cu?.username || cu?.id
  const db = await getDb()
  let local = target
    ? await db.user.findFirst({
        where: { OR: [{ username: target }, { clerkId: target }] },
        include: { profile: true },
      })
    : null

  if (!local && cu && (target === cu.username || target === cu.id)) {
    local = await db.user.create({
      data: {
        clerkId: cu.id,
        username: cu.username || cu.id,
        profile: { create: {} },
      },
      include: { profile: true },
    })
  }

  if (!local) {
    notFound()
  }
  const user: ProfileUser = {
    id: local.username || local.clerkId,
    created: Math.floor(new Date(local.createdAt).getTime() / 1000),
    karma: local.profile?.karma || 0,
    profile: {
      about: local.profile?.about || "",
      website: local.profile?.website || null,
      discipline: local.profile?.discipline || null,
      affiliationStatus: local.profile?.affiliationStatus || null,
      location: local.profile?.location || null,
      timezone: local.profile?.timezone || null,
    },
  }
  const myself = cu?.id === local.clerkId
  const myselfTab = profileTabs
    .filter((item) => item.public === false)
    .map((item) => item.label.toLowerCase())
    .includes(params.tab)
  if (myselfTab && !myself) {
    redirect(`/user/about?id=${user.id}`)
  }
  return (
    <div className="flex flex-col space-y-3 pt-2">
      <UserInfo user={user} />
      <Separator orientation="horizontal" />
      <ProfileTab userId={user.id} myself={myself} />
      {params.tab === "about" && (
        <TabAbout profile={user.profile} myself={myself} />
      )}
      {params.tab === "submitted" && (
        <TabSubmitted
          userId={user.id}
          next={searchParams.next}
          n={searchParams.n}
        />
      )}
      {params.tab === "comments" && (
        <TabComments userId={user.id} next={searchParams.next} />
      )}
      {params.tab === "favorites" && (
        <TabFavorites userId={user.id} type={searchParams.type} />
      )}
      {params.tab === "upvoted" && (
        <TabUpvoted userId={user.id} type={searchParams.type} />
      )}
    </div>
  )
}

function UserInfo({ user }: { user: ProfileUser }) {
  return (
    <div className="flex flex-col space-y-2">
      <h1 className="text-3xl font-semibold">{user?.id}</h1>
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <span>
          <CakeSlice size={12} className="inline" /> Born on{" "}
          {formatDate(user.created)}
        </span>
        <span>•</span>
        <span>{user.karma} Karma</span>
      </div>
    </div>
  )
}
