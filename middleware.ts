import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/top",
  "/new",
  "/best",
  "/ask",
  "/show",
  "/jobs",
  "/api/submit",
  "/item/(.*)",
  "/search",
  "/api/(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return
  }
  const { userId, redirectToSignIn } = await auth()
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url })
  }
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/"],
}
