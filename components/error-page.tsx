"use client"

import { Button } from "@/components/ui/button"
import { SignalField } from "@/components/signal-field"

export default function ErrorPage({ reset }: { reset?: () => void }) {
  return (
    <div className="mx-auto flex min-h-[55vh] w-full max-w-md items-center justify-center">
      <div className="signal-panel relative w-full overflow-hidden px-5 py-6 text-center">
        <SignalField className="-right-44 -top-32 h-64 w-[32rem] opacity-25" />
        <div className="relative">
          <div className="metadata-label text-destructive">error signal</div>
          <h2 className="mt-2 text-xl font-semibold text-foreground">
            Something went wrong.
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
            The page could not finish loading. Try again and we will reload the
            current view.
          </p>
          <Button
            className="mt-5 rounded-md"
            onClick={() => {
              if (reset) {
                reset()
                return
              }
              window.location.reload()
            }}
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  )
}
