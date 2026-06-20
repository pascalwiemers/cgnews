import Link from "next/link"

import { AuthForm } from "@/components/auth-form"
import { SignalField } from "@/components/signal-field"

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
    <div className="signal-panel relative m-auto w-full max-w-sm overflow-hidden px-4 py-5">
      <SignalField className="-right-48 -top-32 h-64 w-[32rem] opacity-25" />
      <div className="relative mb-5 border-b border-border/60 pb-4">
        <div className="metadata-label mb-2 text-primary">identity</div>
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          {pageInfo.title}
        </h1>
      </div>
      <div className="relative space-y-6">
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
