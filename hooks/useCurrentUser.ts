import { useContext } from "react"
import { useUser } from "@clerk/nextjs"

import { CurrentUserContext } from "./currentUserContext"

export default function useCurrentUser() {
  const contextUser = useContext(CurrentUserContext)
  const { isLoaded, user } = useUser()

  if (contextUser !== undefined) return contextUser
  if (!isLoaded) return undefined
  if (!user) return null

  return {
    id: user.username || user.id,
    about: "",
    created: user.createdAt
      ? Math.floor(new Date(user.createdAt).getTime() / 1000)
      : 0,
    karma: 0,
    submitted: [],
  }
}
