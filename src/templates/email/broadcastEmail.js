import sanitizeHtml from 'sanitize-html';
import { renderEmailLayout, renderEmailButton } from './layout.js';

/**
 * Sanitizes the rich-text body produced by the admin editor (TipTap) into
 * email-client-safe HTML, then converts CTA placeholders into real buttons.
 *
 * The editor serializes a call-to-action as `<a data-cta href="…">Label</a>`.
 * We strip it from the sanitized output and re-render it with the project-owned
 * `renderEmailButton()` so the button styling stays under our control.
 */
const TEXT_ALIGN = { 'text-align': [/^(left|right|center|justify)$/] };

const SANITIZE_OPTIONS = {
  allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'ul', 'ol', 'li', 'img', 'h1', 'h2', 'h3'],
  allowedAttributes: {
    a: ['href', 'target', 'rel', 'data-cta'],
    img: ['src', 'alt', 'width'],
    p: ['style'],
    h1: ['style'],
    h2: ['style'],
    h3: ['style'],
  },
  // Only allow text-align on block text nodes (how TipTap emits alignment).
  allowedStyles: {
    p: TEXT_ALIGN,
    h1: TEXT_ALIGN,
    h2: TEXT_ALIGN,
    h3: TEXT_ALIGN,
  },
  // Images must be absolute http(s) URLs (emails can't load relative/data URIs reliably).
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: { img: ['http', 'https'] },
  // Drop the tag entirely (with its text) for anything dangerous like <script>.
  disallowedTagsMode: 'discard',
  transformTags: {
    a: (tagName, attribs) => {
      // Force safe link behaviour for non-CTA links.
      if (attribs['data-cta'] === undefined && attribs.href) {
        return { tagName, attribs: { ...attribs, target: '_blank', rel: 'noopener noreferrer' } };
      }
      return { tagName, attribs };
    },
  },
};

/** Escapes a raw string for safe insertion into an HTML attribute. */
function escapeAttr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Replaces CTA anchors (`<a data-cta href="…">Label</a>`) in already-sanitized
 * HTML with the project's email button markup. Runs after sanitize so any
 * attributes we inject here are trusted.
 */
function renderCtaButtons(html) {
  const CTA_ANCHOR = /<a\b[^>]*\bdata-cta\b[^>]*>([\s\S]*?)<\/a>/gi;
  return html.replace(CTA_ANCHOR, (match, inner) => {
    const hrefMatch = match.match(/\bhref="([^"]*)"/i);
    const href = hrefMatch ? hrefMatch[1] : '';
    const label = inner.replace(/<[^>]*>/g, '').trim();
    if (!label || !href) return '';
    return renderEmailButton({ label, href: escapeAttr(href) });
  });
}

/**
 * Removes `<img>` tags whose `src` is not an absolute http(s) URL. Email clients
 * cannot resolve relative or data URIs, so such images are dropped entirely.
 */
function dropNonAbsoluteImages(html) {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const srcMatch = tag.match(/\bsrc="([^"]*)"/i);
    const src = srcMatch ? srcMatch[1] : '';
    return /^https?:\/\//i.test(src) ? tag : '';
  });
}

/**
 * Forces every `<img>` to be responsive so a large image can never overflow the
 * 640px email container. Runs post-sanitize, so the injected style is trusted.
 */
function constrainImages(html) {
  return html.replace(/<img\b([^>]*?)\/?>/gi, (_match, attrs) => {
    const cleaned = attrs.replace(/\s*style="[^"]*"/i, '').trimEnd();
    return `<img${cleaned ? ` ${cleaned.trim()}` : ''} style="max-width:100%;height:auto;display:block;">`;
  });
}

/**
 * Colors regular links with the brand primary inline (email clients ignore
 * `<style>`). CTA anchors are skipped because they become buttons afterwards.
 */
function colorizeLinks(html) {
  return html.replace(/<a\b([^>]*)>/gi, (full, attrs) => {
    if (/\bdata-cta\b/i.test(attrs) || /\bstyle="/i.test(attrs)) return full;
    return `<a${attrs} style="color:#FF8E4F;">`;
  });
}

/** Sanitizes editor HTML and renders embedded CTA buttons. */
export function renderBroadcastBody(bodyHtml) {
  const clean = sanitizeHtml(String(bodyHtml ?? ''), SANITIZE_OPTIONS);
  return renderCtaButtons(colorizeLinks(constrainImages(dropNonAbsoluteImages(clean))));
}

/**
 * Renders a broadcast email by injecting the sanitized rich-text body into the
 * shared Rise Social email layout. Template is fully owned here (not Brevo).
 */
export function broadcastEmail({ subject, bodyText }) {
  // `subject` is the inbox subject line only; it is intentionally NOT rendered
  // as a heading in the body, so admins control the full content via rich text.
  void subject;
  return renderEmailLayout({
    title: '',
    intro: '',
    content: renderBroadcastBody(bodyText),
  });
}
