import { redirect } from "next/navigation"

export default function UserPage({
  searchParams,
}: {
  searchParams: { id?: string }
}) {
  const suffix = searchParams.id
    ? `?id=${encodeURIComponent(searchParams.id)}`
    : ""

  redirect(`/user/about${suffix}`)
}
