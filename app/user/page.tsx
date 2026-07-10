import { redirect } from "next/navigation"

export default async function UserPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const query = await searchParams
  const suffix = query.id ? `?id=${encodeURIComponent(query.id)}` : ""

  redirect(`/user/about${suffix}`)
}
