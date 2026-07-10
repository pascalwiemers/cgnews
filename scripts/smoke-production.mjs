const origin = process.env.CGNEWS_PRODUCTION_URL || "https://cgnews.app"
const publicChecks = [
  ["/", "CGNews"],
  ["/top", "CGNews"],
  ["/new", "CGNews"],
  ["/best", "CGNews"],
  ["/ask", "CGNews"],
  ["/show", "CGNews"],
  ["/jobs", "CGNews"],
  ["/search?query=render", "Search"],
  ["/user/about?id=cgnews", "cgnews"],
  ["/login", "Log in to CGNews"],
  ["/privacy", "Privacy"],
  ["/terms", "Terms"],
  ["/robots.txt", "Sitemap:"],
  ["/sitemap.xml", "<urlset"],
]

for (const [path, marker] of publicChecks) {
  const url = new URL(path, origin)
  const response = await fetch(url, {
    redirect: "follow",
    headers: { "user-agent": "cgnews-production-smoke/1.0" },
  })

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`)
  }

  const body = await response.text()
  if (!body.includes(marker)) {
    throw new Error(`${url} did not contain expected marker: ${marker}`)
  }

  console.log(`${response.status} ${url}`)
}

const protectedUrl = new URL("/submit", origin)
const protectedResponse = await fetch(protectedUrl, {
  redirect: "manual",
  headers: { "user-agent": "cgnews-production-smoke/1.0" },
})

if (![307, 308].includes(protectedResponse.status)) {
  throw new Error(
    `${protectedUrl} returned ${protectedResponse.status}; expected an auth redirect`
  )
}

const location = protectedResponse.headers.get("location") || ""
const localLogin =
  location.includes("/login") && location.includes("goto=%2Fsubmit")
const clerkLogin =
  location.startsWith("https://accounts.cgnews.app/sign-in") &&
  location.includes("redirect_url=https%3A%2F%2Fcgnews.app%2Fsubmit")
if (!localLogin && !clerkLogin) {
  throw new Error(
    `${protectedUrl} returned an unexpected redirect: ${location}`
  )
}

console.log(`${protectedResponse.status} ${protectedUrl} -> ${location}`)
