import { SubmitForm } from "@/app/submit/submit-form"

export const dynamic = "force-dynamic"

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-5 border-b border-border/60 pb-4">
        <h1 className="text-2xl font-semibold leading-tight text-foreground">
          Submit to CGNews
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Share a link, question, show-and-tell, or job post for the CG
          production community.
        </p>
      </div>
      <SubmitForm />
    </div>
  )
}
