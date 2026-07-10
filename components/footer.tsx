import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-[#020203]/70 font-sans backdrop-blur-xl">
      <div className="container max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 py-6 text-xs text-muted-foreground">
          <span>CGNews — signal over noise.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link
              href="https://www.pascalwiemers.com"
              target="_blank"
              className="font-medium text-foreground/70 transition-colors hover:text-foreground hover:no-underline"
              rel="noreferrer"
            >
              pascal wiemers
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
