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

export default async function TabAbout({
  profile,
  myself,
}: {
  profile: UserProfileDetails
  myself: boolean
}) {
  const rows = [
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
        <section className="space-y-3">
          {rows.length > 0 && (
            <dl className="grid gap-x-5 gap-y-2 text-sm sm:grid-cols-[9rem_1fr]">
              {rows.map((row) => (
                <div key={row.label} className="contents text-sm leading-6">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="min-w-0 text-foreground">
                    {row.href ? (
                      <a
                        href={row.href}
                        rel="noreferrer nofollow"
                        target="_blank"
                        className="inline-flex max-w-full items-center gap-1 break-all underline underline-offset-4"
                      >
                        {formatWebsite(row.href)}
                        <ExternalLink size={12} aria-hidden="true" />
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
            <p className="whitespace-pre-wrap text-sm leading-6">
              {profile.about}
            </p>
          )}
        </section>
      )}

      {myself && (
        <form
          action={updateProfileAction}
          className="space-y-4 border-t border-border pt-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              <span>Website</span>
              <Input
                defaultValue={profile.website || ""}
                inputMode="url"
                maxLength={2048}
                name="website"
                placeholder="https://example.com"
                type="text"
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Discipline</span>
              <Input
                defaultValue={profile.discipline || ""}
                maxLength={120}
                name="discipline"
                placeholder="Lighting TD"
                type="text"
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Affiliation/status</span>
              <Input
                defaultValue={profile.affiliationStatus || ""}
                maxLength={120}
                name="affiliationStatus"
                placeholder="Freelance"
                type="text"
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Location</span>
              <Input
                defaultValue={profile.location || ""}
                maxLength={120}
                name="location"
                placeholder="Berlin"
                type="text"
              />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Timezone</span>
              <Input
                defaultValue={profile.timezone || ""}
                maxLength={120}
                name="timezone"
                placeholder="CET"
                type="text"
              />
            </label>
          </div>
          <label className="block space-y-2 text-sm font-medium">
            <span>Bio/about</span>
            <Textarea
              className="min-h-28"
              defaultValue={profile.about}
              maxLength={800}
              name="about"
              placeholder="Short production background, tools, or interests."
            />
          </label>
          <Button size="sm" type="submit">
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
