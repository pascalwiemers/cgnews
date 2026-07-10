import { Metadata } from "next"
import { SignIn } from "@clerk/nextjs"

import { safeRelativeRedirect } from "@/lib/redirects"
import { SignalField } from "@/components/signal-field"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Login",
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ goto?: string }>
}) {
  const query = await searchParams
  const redirectUrl = safeRelativeRedirect(query.goto)
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center">
      <div className="signal-panel relative mb-5 overflow-hidden px-4 py-5">
        <SignalField className="-right-48 -top-32 h-64 w-[32rem] opacity-30" />
        <div className="relative">
          <div className="metadata-label mb-2 text-primary">identity check</div>
          <h1 className="text-2xl font-semibold leading-tight text-foreground">
            Log in to CGNews
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Continue the discussion with the CG production community.
          </p>
        </div>
      </div>
      <div className="panel p-3 [&_.cl-card]:bg-transparent [&_.cl-card]:shadow-none [&_.cl-footerActionText]:text-muted-foreground [&_.cl-headerSubtitle]:text-muted-foreground [&_.cl-headerTitle]:text-foreground [&_.cl-rootBox]:w-full">
        <SignIn
          routing="hash"
          fallbackRedirectUrl={redirectUrl}
          signUpUrl={`/signup?goto=${encodeURIComponent(redirectUrl)}`}
        />
      </div>
    </div>
  )
}
