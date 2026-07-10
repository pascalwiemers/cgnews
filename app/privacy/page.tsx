import type { Metadata } from "next"

export const metadata: Metadata = { title: "Privacy" }

export default function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-2xl space-y-6 py-4 text-sm leading-7 text-muted-foreground">
      <h1 className="text-2xl font-semibold text-foreground">Privacy</h1>
      <p>
        CGNews uses Clerk to provide authentication. Clerk processes
        credentials, email verification, OAuth connections, and session data.
        CGNews does not store passwords.
      </p>
      <p>
        CGNews stores your Clerk user identifier, public username, optional
        profile fields, submissions, comments, votes, and favorites in
        Cloudflare D1 so the community features work.
      </p>
      <p>
        Public submissions and comments may be retained after account deletion
        to preserve discussion integrity, but the associated profile can be
        anonymized. Contact privacy@cgnews.app to request access, correction, or
        deletion of your account data.
      </p>
    </article>
  )
}
