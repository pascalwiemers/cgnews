import { Loader2 } from "lucide-react"

import { SignalField } from "@/components/signal-field"

export default function Loading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex min-h-[55vh] w-full items-center justify-center">
      <div className="signal-panel relative inline-flex min-w-52 items-center gap-3 overflow-hidden px-4 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        <SignalField className="-right-52 -top-36 h-60 w-[30rem] opacity-25" />
        <Loader2 className="relative size-4 animate-spin text-primary" />
        <span className="relative">{text}</span>
      </div>
    </div>
  )
}
