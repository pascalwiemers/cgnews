import { siteConf } from "@/config/conf"

export default function Logo() {
  return (
    <div className="flex min-w-0 items-baseline gap-2">
      <p className="truncate text-base font-black uppercase tracking-[0.08em] text-foreground">
        {siteConf.title}
      </p>
      <span className="hidden size-1.5 rounded-full bg-primary sm:block" />
    </div>
  )
}
