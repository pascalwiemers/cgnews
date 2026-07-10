export function safeRelativeRedirect(
  value: string | undefined,
  fallback = "/"
) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback
  }
  return value
}
