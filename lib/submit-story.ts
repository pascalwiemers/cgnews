export type StoredStoryType = "LINK" | "ASK" | "SHOW" | "JOB"

const storyTypes = new Set<StoredStoryType>(["LINK", "ASK", "SHOW", "JOB"])

export function normalizeStoredStoryType(
  type: string | null | undefined
): StoredStoryType {
  return storyTypes.has(type as StoredStoryType)
    ? (type as StoredStoryType)
    : "LINK"
}

export function parseSubmitStoryForm(formData: FormData) {
  const title = String(formData.get("title") || "").trim()
  const url = String(formData.get("url") || "").trim()
  const text = String(formData.get("text") || "").trim()
  const requestedType = String(formData.get("type") || "").trim()
  const isSelfPromo = formData.get("isSelfPromo") === "true"
  const commercialDisclosure =
    String(formData.get("commercialDisclosure") || "").trim() || null

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

export function storyTypeFeedPath(type: StoredStoryType) {
  if (type === "ASK") return "/ask"
  if (type === "SHOW") return "/show"
  if (type === "JOB") return "/jobs"
  return "/new"
}
