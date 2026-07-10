import { Metadata, ResolvingMetadata } from "next"
import { notFound, redirect } from "next/navigation"
import { Activity, CakeSlice, ShieldCheck } from "lucide-react"

import { profileTabs } from "@/config/conf"
import { getOptionalCurrentUser } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { getOrCreateLocalUser } from "@/lib/local-user"
import { formatDate } from "@/lib/time-utils"

import ProfileTab from "../components/profile-tab"
import TabAbout from "../components/tab-about"
import TabComments from "../components/tab-comments"
import TabFavorites from "../components/tab-favorites"
import TabSubmitted from "../components/tab-submitted"
import TabUpvoted from "../components/tab-upvoted"

type Props = {
  params: Promise<{ tab: string }>
  searchParams: Promise<{
    id: string
    next: number
    n: number
    type: string
  }>
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const [route, query] = await Promise.all([params, searchParams])
  const userId = query.id
  const tab = route.tab
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
  const [route, query] = await Promise.all([params, searchParams])
  const cu = await getOptionalCurrentUser()
  const target = query.id || cu?.username || cu?.id
  const db = await getDb()
  let local = target
    ? await db.user.findFirst({
        where: { OR: [{ username: target }, { clerkId: target }] },
        include: { profile: true },
      })
    : null

  if (!local && cu && (target === cu.username || target === cu.id)) {
    await getOrCreateLocalUser(cu.id)
    local = await db.user.findUnique({
      where: { clerkId: cu.id },
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
    .includes(route.tab)
  if (myselfTab && !myself) {
    redirect(`/user/about?id=${user.id}`)
  }
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 pb-8 pt-2">
      <UserInfo user={user} />
      <section className="command-panel overflow-hidden">
        <div className="border-b border-border/70 px-3 py-2 sm:px-4">
          <ProfileTab userId={user.id} myself={myself} />
        </div>
        <div className="min-w-0 px-3 py-4 sm:px-4">
          {route.tab === "about" && (
            <TabAbout profile={user.profile} myself={myself} />
          )}
          {route.tab === "submitted" && (
            <TabSubmitted userId={user.id} next={query.next} n={query.n} />
          )}
          {route.tab === "comments" && (
            <TabComments userId={user.id} next={query.next} />
          )}
          {route.tab === "favorites" && (
            <TabFavorites userId={user.id} type={query.type} />
          )}
          {route.tab === "upvoted" && (
            <TabUpvoted userId={user.id} type={query.type} />
          )}
        </div>
      </section>
    </div>
  )
}

function UserInfo({ user }: { user: ProfileUser }) {
  return (
    <section className="border-b border-border/70 px-1 pb-5">
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-3">
          <div className="metadata-label flex items-center gap-2">
            <ShieldCheck size={13} aria-hidden="true" />
            Profile command record
          </div>
          <h1 className="break-all font-sans text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
            {user.id}
          </h1>
        </div>
        <dl className="grid min-w-0 grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div className="min-w-0">
            <div className="metadata-label mb-1 flex items-center gap-1.5">
              <CakeSlice size={12} aria-hidden="true" />
              Joined
            </div>
            <div className="break-words text-foreground">
              {formatDate(user.created)}
            </div>
          </div>
          <div className="min-w-0">
            <div className="metadata-label mb-1 flex items-center gap-1.5">
              <Activity size={12} aria-hidden="true" />
              Karma
            </div>
            <div className="font-mono text-foreground">{user.karma}</div>
          </div>
        </dl>
      </div>
    </section>
  )
}
