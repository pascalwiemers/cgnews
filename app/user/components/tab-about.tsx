import { ExternalLink } from "lucide-react"

import { updateProfileAction } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type UserProfileDetails = {
  about: string
  website: string | null
  discipline: string | null
  affiliationStatus: string | null
  location: string | null
  timezone: string | null
}

type ProfileRow = {
  label: string
  value: string | null
  href?: string | null
}

export default async function TabAbout({
  profile,
  myself,
}: {
  profile: UserProfileDetails
  myself: boolean
}) {
  const rows: ProfileRow[] = [
    {
      label: "Website",
      value: profile.website,
      href: profile.website,
    },
    {
      label: "Discipline",
      value: profile.discipline,
    },
    {
      label: "Affiliation",
      value: profile.affiliationStatus,
    },
    {
      label: "Location",
      value: profile.location,
    },
    {
      label: "Timezone",
      value: profile.timezone,
    },
  ].filter((row) => row.value)

  return (
    <div className="max-w-2xl space-y-5 pt-2">
      {(rows.length > 0 || profile.about) && (
        <section className="space-y-4">
          {rows.length > 0 && (
            <dl className="divide-y divide-border/60 rounded-sm border border-border/70 bg-card/35">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="grid gap-1 p-3 text-sm sm:grid-cols-[9rem_1fr] sm:gap-5"
                >
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm sm:normal-case sm:tracking-normal">
                    {row.label}
                  </dt>
                  <dd className="min-w-0 text-foreground [overflow-wrap:anywhere]">
                    {row.href ? (
                      <a
                        href={row.href}
                        rel="noreferrer nofollow"
                        target="_blank"
                        className="inline-flex max-w-full items-center gap-1 break-all text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
                      >
                        {formatWebsite(row.href)}
                        <ExternalLink
                          size={12}
                          aria-hidden="true"
                          className="shrink-0"
                        />
                      </a>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {profile.about && (
            <p className="whitespace-pre-wrap rounded-sm border border-border/70 bg-card/25 p-3 text-sm leading-6 text-foreground">
              {profile.about}
            </p>
          )}
        </section>
      )}

      {myself && (
        <form
          action={updateProfileAction}
          className="space-y-4 border-t border-border/70 pt-5"
        >
          <div className="grid gap-3 rounded-sm border border-border/70 bg-card/30 p-3 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-foreground">
              <span className="text-muted-foreground">Website</span>
              <Input
                className="bg-background/80"
                defaultValue={profile.website || ""}
                inputMode="url"
                maxLength={2048}
                name="website"
                placeholder="https://example.com"
                type="text"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-foreground">
              <span className="text-muted-foreground">Discipline</span>
              <Input
                className="bg-background/80"
                defaultValue={profile.discipline || ""}
                maxLength={120}
                name="discipline"
                placeholder="Lighting TD"
                type="text"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-foreground">
              <span className="text-muted-foreground">Affiliation/status</span>
              <Input
                className="bg-background/80"
                defaultValue={profile.affiliationStatus || ""}
                maxLength={120}
                name="affiliationStatus"
                placeholder="Freelance"
                type="text"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-foreground">
              <span className="text-muted-foreground">Location</span>
              <Input
                className="bg-background/80"
                defaultValue={profile.location || ""}
                maxLength={120}
                name="location"
                placeholder="Berlin"
                type="text"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-foreground sm:col-span-2">
              <span className="text-muted-foreground">Timezone</span>
              <Input
                className="bg-background/80"
                defaultValue={profile.timezone || ""}
                maxLength={120}
                name="timezone"
                placeholder="CET"
                type="text"
              />
            </label>
          </div>
          <label className="block space-y-2 rounded-sm border border-border/70 bg-card/30 p-3 text-sm font-medium text-foreground">
            <span className="text-muted-foreground">Bio/about</span>
            <Textarea
              className="min-h-28 bg-background/80"
              defaultValue={profile.about}
              maxLength={800}
              name="about"
              placeholder="Short production background, tools, or interests."
            />
          </label>
          <Button size="sm" type="submit" variant="soft">
            Save profile
          </Button>
        </form>
      )}
    </div>
  )
}

function formatWebsite(value: string) {
  try {
    const url = new URL(value)
    return url.hostname.replace(/^www\./, "")
  } catch {
    return value
  }
}
