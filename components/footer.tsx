import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/50 bg-background/95 font-sans">
      <div className="container max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-2 py-4 text-xs uppercase tracking-[0.12em] text-muted-foreground">
          <span>CGNews dispatch</span>
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
