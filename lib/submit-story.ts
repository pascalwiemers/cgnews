export type StoredStoryType = "LINK" | "ASK" | "SHOW" | "JOB"

export const STORY_LIMITS = {
  title: 160,
  url: 2048,
  text: 20_000,
  disclosure: 500,
} as const

const storyTypes = new Set<StoredStoryType>(["LINK", "ASK", "SHOW", "JOB"])

export function normalizeStoredStoryType(
  type: string | null | undefined
): StoredStoryType {
  return storyTypes.has(type as StoredStoryType)
    ? (type as StoredStoryType)
    : "LINK"
}

export function parseSubmitStoryForm(formData: FormData) {
  const title = String(formData.get("title") || "")
    .trim()
    .slice(0, STORY_LIMITS.title)
  const url = String(formData.get("url") || "")
    .trim()
    .slice(0, STORY_LIMITS.url)
  const text = String(formData.get("text") || "")
    .trim()
    .slice(0, STORY_LIMITS.text)
  const requestedType = String(formData.get("type") || "").trim()
  const isSelfPromo = formData.get("isSelfPromo") === "true"
  const commercialDisclosure =
    String(formData.get("commercialDisclosure") || "")
      .trim()
      .slice(0, STORY_LIMITS.disclosure) || null

  const type = storyTypes.has(requestedType as StoredStoryType)
    ? normalizeStoredStoryType(requestedType)
    : url
      ? "LINK"
      : "ASK"

  return {
    title,
    url,
    text,
    type,
    isSelfPromo,
    commercialDisclosure,
  }
}

export function validateSubmitStoryInput({
  title,
  url,
  text,
}: {
  title: string
  url: string
  text: string
}) {
  if (!title) return "A title is required"
  if (!url && !text) return "Add a link or text"
  if (!url) return null

  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "Only HTTP and HTTPS links are supported"
    }
  } catch {
    return "Enter a valid URL"
  }

  return null
}

export function storyTypeFeedPath(type: StoredStoryType) {
  if (type === "ASK") return "/ask"
  if (type === "SHOW") return "/show"
  if (type === "JOB") return "/jobs"
  return "/new"
}
