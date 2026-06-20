import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/60 bg-background/90 font-sans">
      <div className="container max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-2 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <span>CGNews command dispatch</span>
          <Link
            href="https://www.pascalwiemers.com"
            target="_blank"
            className="font-semibold text-foreground/75 transition-colors hover:text-primary hover:no-underline"
            rel="noreferrer"
          >
            pascal wiemers
          </Link>
        </div>
      </div>
    </footer>
  )
}
