import { SignalField } from "@/components/signal-field"
import { SubmitForm } from "@/app/submit/submit-form"

export const dynamic = "force-dynamic"

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="signal-panel relative mb-5 overflow-hidden px-4 py-5 sm:px-5">
        <SignalField className="-right-44 -top-28 h-64 w-[32rem] opacity-30" />
        <div className="relative">
          <div className="metadata-label mb-2 text-primary">submit uplink</div>
          <h1 className="text-2xl font-semibold leading-tight text-foreground">
            Submit to CGNews
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Share a link, question, show-and-tell, or job post for the CG
            production community.
          </p>
        </div>
      </div>
      <SubmitForm />
    </div>
  )
}
