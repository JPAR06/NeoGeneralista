// Returns the callbackUrl ONLY if it's a safe internal path.
// Rejects anything that could be an open redirect (absolute URLs, protocol-
// relative `//evil.com`, etc.). Default fallback when missing/unsafe.

export function safeCallback(callbackUrl, fallback = "/algoritmo-humano") {
  if (!callbackUrl || typeof callbackUrl !== "string") return fallback;
  // Must start with "/" but not "//" (which would be protocol-relative).
  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) return fallback;
  // Reject anything trying to embed a scheme.
  if (callbackUrl.includes(":")) return fallback;
  return callbackUrl;
}
