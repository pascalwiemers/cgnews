import { Loader2 } from "lucide-react"

export default function Loading({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex min-h-[55vh] w-full items-center justify-center">
      <div className="panel inline-flex items-center gap-3 px-4 py-3 font-mono text-[11px] uppercase text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-primary" />
        <span>{text}</span>
      </div>
    </div>
  )
}
