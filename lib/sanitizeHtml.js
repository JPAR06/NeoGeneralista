// Minimal HTML sanitizer for admin-authored messages (notify-event, etc).
// Allow only a small set of formatting tags; <a> only with http/https/mailto.
// All other tags + event handlers are stripped. No third-party dep — easier
// to audit. NOT a general-purpose XSS sanitizer; use only for trusted admin
// input that's about to be embedded into outgoing emails.

const ALLOWED_TAGS = new Set([
  "strong", "b", "em", "i", "u",
  "br", "p", "div",
  "a", "font", "span",
  "ul", "ol", "li",
])

const SAFE_HREF = /^(https?:\/\/|mailto:)/i
const SAFE_COLOR = /^(#[0-9a-f]{3,8}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|[a-z]+)$/i

export function sanitizeHtml(html) {
  if (typeof html !== "string") return ""

  // Drop entire dangerous blocks (script/style/etc and their contents).
  let out = html.replace(
    /<(script|style|iframe|object|embed|link|meta|form|input|textarea|button)\b[\s\S]*?<\/\1>/gi,
    ""
  )
  // Also drop self-closing/unclosed dangerous tags.
  out = out.replace(/<(script|style|iframe|object|embed|link|meta)\b[^>]*\/?>/gi, "")

  // Walk every tag and keep only allowlist ones with minimal attrs.
  out = out.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (full, tagRaw, attrsRaw) => {
    const tag = tagRaw.toLowerCase()
    if (!ALLOWED_TAGS.has(tag)) return ""

    if (full.startsWith("</")) return `</${tag}>`

    // For <a>, allow href if it's a safe protocol; force target+rel for safety.
    if (tag === "a") {
      const hrefMatch = attrsRaw.match(/\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i)
      const rawHref = hrefMatch ? (hrefMatch[2] ?? hrefMatch[3] ?? hrefMatch[4] ?? "") : ""
      const href = SAFE_HREF.test(rawHref) ? rawHref : ""
      if (!href) return ""
      return `<a href="${escapeAttr(href)}" target="_blank" rel="noopener noreferrer">`
    }

    // For <font>, keep only safe color attribute (used by execCommand foreColor).
    if (tag === "font") {
      const colorMatch = attrsRaw.match(/\bcolor\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i)
      const raw = colorMatch ? (colorMatch[2] ?? colorMatch[3] ?? colorMatch[4] ?? "") : ""
      const color = SAFE_COLOR.test(raw.trim()) ? raw.trim() : ""
      return color ? `<font color="${escapeAttr(color)}">` : `<font>`
    }

    // For <span>, keep only safe inline `color:...` rule from style (other styles dropped).
    if (tag === "span") {
      const styleMatch = attrsRaw.match(/\bstyle\s*=\s*("([^"]*)"|'([^']*)')/i)
      const rawStyle = styleMatch ? (styleMatch[2] ?? styleMatch[3] ?? "") : ""
      const colorM = rawStyle.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i)
      const color = colorM ? colorM[1].trim() : ""
      if (color && SAFE_COLOR.test(color)) {
        return `<span style="color:${escapeAttr(color)}">`
      }
      return `<span>`
    }

    // All other allowed tags: emit with no attributes.
    return `<${tag}>`
  })

  // Belt-and-braces strip any leftover event handlers / javascript: refs.
  out = out
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|\S+)/gi, "")
    .replace(/javascript\s*:/gi, "")

  return out
}

// Best-effort plain text version of the message for the email's text/plain body.
export function htmlToText(html) {
  if (typeof html !== "string") return ""
  return html
    .replace(/<\/?(p|div|br|li)[^>]*>/gi, "\n")
    .replace(/<\/?(ul|ol)[^>]*>/gi, "\n")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, "$2 ($1)")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}
