import type { Metadata } from "next"

export const metadata: Metadata = { title: "Terms" }

export default function TermsPage() {
  return (
    <article className="mx-auto w-full max-w-2xl space-y-6 py-4 text-sm leading-7 text-muted-foreground">
      <h1 className="text-2xl font-semibold text-foreground">
        Community terms
      </h1>
      <p>
        Submit material you are allowed to share. Do not post spam, harassment,
        malware, deceptive links, private information, or illegal content.
      </p>
      <p>
        Clearly disclose self-promotion and commercial relationships. CGNews may
        remove content, limit accounts, or adjust ranking to protect the quality
        and safety of the community.
      </p>
      <p>
        You retain ownership of your contributions and grant CGNews permission
        to display and distribute them as part of the service. The service is
        provided as-is while it is under active development.
      </p>
    </article>
  )
}
