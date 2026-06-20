import Link from "next/link"

import { AuthForm } from "@/components/auth-form"

type PageInfo = {
  title: string
  buttonText: string
  switcherTips: string
  switcherText: string
  switcherHref: string
}
const pageMap = {
  login: {
    title: "Log in to CGNews",
    buttonText: "Login",
    switcherTips: "New to CGNews?",
    switcherText: "Create an account",
    switcherHref: "/signup",
  },
  signup: {
    title: "Create Account",
    buttonText: "Create Account",
    switcherTips: "Already have an account?",
    switcherText: "Login",
    switcherHref: "/login",
  },
} as Record<string, PageInfo>

export default function AuthPage({
  page,
  searchParams,
}: {
  page: string
  searchParams: { goto?: string }
}) {
  const pageInfo = pageMap[page]
  return (
    <div className="panel m-auto w-full max-w-sm px-4 py-5">
      <div className="mb-5 border-b border-border/60 pb-4">
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {pageInfo.title}
        </h1>
      </div>
      <div className="space-y-6">
        <AuthForm goto={searchParams.goto} creating={page === "signup"} />
        <div className="text-center text-sm text-muted-foreground">
          {pageInfo.switcherTips}{" "}
          <Link
            rel="nofollow noreferrer"
            href={pageInfo.switcherHref}
            className="underline"
          >
            {pageInfo.switcherText}
          </Link>
        </div>
      </div>
    </div>
  )
}
