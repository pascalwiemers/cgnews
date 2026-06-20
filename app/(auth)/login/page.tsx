import { Metadata } from "next"
import { SignIn } from "@clerk/nextjs"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Login",
  }
}

export default function Page({
  searchParams,
}: {
  searchParams: { goto?: string }
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center">
      <div className="mb-5 border-b border-border/60 pb-4">
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          Log in to CGNews
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Continue the discussion with the CG production community.
        </p>
      </div>
      <div className="panel p-3 [&_.cl-card]:bg-transparent [&_.cl-card]:shadow-none [&_.cl-footerActionText]:text-muted-foreground [&_.cl-headerSubtitle]:text-muted-foreground [&_.cl-headerTitle]:text-foreground [&_.cl-rootBox]:w-full">
        <SignIn routing="hash" />
      </div>
    </div>
  )
}
