/**
 * Sanitize HTML to prevent stored XSS.
 *
 * Strips dangerous tags, event handlers, javascript: URIs, and CSS expressions.
 * Mirrors the server-side sanitization in the Adonis/Laravel inbound email services.
 */

const ALLOWED_TAGS = [
  'p', 'br', 'b', 'i', 'u', 'strong', 'em', 'a', 'ul', 'ol', 'li',
  'blockquote', 'pre', 'code', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span',
  'hr', 'sub', 'sup', 'dl', 'dt', 'dd',
]

const TAG_PATTERN = ALLOWED_TAGS.join('|')
const STRIP_TAGS_RE = new RegExp(`<(?!\\/?(?:${TAG_PATTERN})(?:\\s|>|\\/))\\/?[^>]*>`, 'gi')

export function sanitizeHtml(html) {
  if (!html) return ''

  let clean = html

  // Strip non-allowed tags
  clean = clean.replace(STRIP_TAGS_RE, '')

  // Remove event handlers (onclick, onerror, etc.)
  clean = clean.replace(/\s+on\w+\s*=\s*"[^"]*"/gi, '')
  clean = clean.replace(/\s+on\w+\s*=\s*'[^']*'/gi, '')
  clean = clean.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '')

  // Remove javascript: and vbscript: protocols from href/src/action
  clean = clean.replace(/\b(href|src|action)\s*=\s*["']?\s*(?:javascript|vbscript)\s*:/gi, '$1="')

  // Remove dangerous data: URIs (allow data:image)
  clean = clean.replace(/\b(href|src|action)\s*=\s*["']?\s*data\s*:(?!image\/)/gi, '$1="')

  // Remove CSS expressions and javascript in style attributes
  clean = clean.replace(/style\s*=\s*"[^"]*expression\s*\([^"]*"/gi, '')
  clean = clean.replace(/style\s*=\s*'[^']*expression\s*\([^']*'/gi, '')
  clean = clean.replace(/style\s*=\s*"[^"]*url\s*\(\s*["']?\s*javascript:[^"]*"/gi, '')
  clean = clean.replace(/style\s*=\s*'[^']*url\s*\(\s*['"]?\s*javascript:[^']*'/gi, '')

  return clean
}
