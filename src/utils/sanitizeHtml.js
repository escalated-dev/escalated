/**
 * Sanitize HTML to prevent stored XSS.
 *
 * Uses the DOM parser to walk the tree and strip dangerous elements and
 * attributes rather than regex, which avoids incomplete-sanitization pitfalls.
 */

const DANGEROUS_TAGS = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'form', 'input',
  'textarea', 'button', 'select', 'option', 'link', 'meta', 'base',
  'applet', 'noscript', 'noframes',
])

const URI_ATTRS = new Set(['href', 'src', 'action', 'formaction', 'xlink:href'])

export function sanitizeHtml(html) {
  if (!html) return ''

  const doc = new DOMParser().parseFromString(html, 'text/html')

  // Remove dangerous elements
  for (const tag of DANGEROUS_TAGS) {
    const els = doc.body.getElementsByTagName(tag)
    while (els.length) els[0].remove()
  }

  // Walk all remaining elements and strip dangerous attributes
  const all = doc.body.querySelectorAll('*')
  for (let i = 0; i < all.length; i++) {
    const el = all[i]
    const attrs = [...el.attributes]
    for (let j = 0; j < attrs.length; j++) {
      const name = attrs[j].name.toLowerCase()

      // Remove event handlers (onclick, onerror, etc.)
      if (name.startsWith('on')) {
        el.removeAttribute(attrs[j].name)
        continue
      }

      // Remove javascript: / vbscript: / dangerous data: URIs
      if (URI_ATTRS.has(name)) {
        const val = (attrs[j].value || '').replace(/[\s\u0000-\u001F]+/g, '').toLowerCase()
        if (
          val.startsWith('javascript:') ||
          val.startsWith('vbscript:') ||
          (val.startsWith('data:') && !val.startsWith('data:image/'))
        ) {
          el.removeAttribute(attrs[j].name)
        }
      }

      // Remove style attributes containing expressions or javascript
      if (name === 'style') {
        const val = (attrs[j].value || '').toLowerCase()
        if (val.includes('expression(') || val.includes('javascript:') || val.includes('url(')) {
          el.removeAttribute(attrs[j].name)
        }
      }
    }
  }

  return doc.body.innerHTML
}
