/**
 * Plain-text excerpts from stored announcement HTML.
 *
 * The admin editor stores HTML, so both the card previews and the `<meta
 * name="description">` on the detail route need a tag-free, entity-free
 * rendering of the body. Previously each call site did
 * `html.replace(/<[^>]+>/g, " ")` inline, which strips tags but leaves
 * character references intact — an announcement containing `Rules &amp;
 * Regulations` rendered the literal `&amp;` in the preview, and `&nbsp;`
 * survived whitespace collapsing as a literal 6-character string.
 *
 * Output is plain text destined for JSX text nodes and <meta content>, both of
 * which escape on write — this is deliberately NOT a sanitiser. Rendering the
 * announcement body itself stays with sanitizeNewsContent() on the server.
 */

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: " ",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  amp: "&",
};

/**
 * Numeric refs are author-supplied, so validate before converting.
 *
 * The surrogate check is NOT redundant with the range check:
 * `String.fromCodePoint` accepts 0xD800-0xDFFF and happily returns a LONE
 * surrogate, which is not valid scalar text and corrupts UTF-8 encoding
 * downstream (it reaches `<meta name="description">`). Only values above
 * 0x10FFFF throw, so the range must be rejected explicitly.
 */
function fromCodePoint(code: number): string {
  if (!Number.isInteger(code) || code < 0 || code > 0x10ffff) return "";
  if (code >= 0xd800 && code <= 0xdfff) return "";
  return String.fromCodePoint(code);
}

/**
 * Decode hex, decimal and the predefined named entities in a SINGLE pass.
 *
 * One pass is load-bearing: decoding `&amp;` in its own sweep would turn the
 * input `&amp;lt;` into `&lt;` and a later sweep would decode that again to
 * `<`. Scanning once means replacement output is never re-examined.
 */
function decodeEntities(text: string): string {
  return text.replace(
    /&(?:#[xX]([0-9a-fA-F]+)|#(\d+)|(nbsp|lt|gt|quot|apos|amp));/g,
    (match, hex: string | undefined, dec: string | undefined, name: string | undefined) => {
      if (hex !== undefined) return fromCodePoint(parseInt(hex, 16));
      if (dec !== undefined) return fromCodePoint(Number(dec));
      if (name !== undefined) return NAMED_ENTITIES[name] ?? match;
      return match;
    },
  );
}

/**
 * Strip stored HTML down to a plain-text excerpt of at most `max` characters.
 *
 * Step order matters: strip tags, THEN decode (so a decoded `<` can never be
 * read back as markup), then collapse whitespace (so a decoded `&nbsp;` folds
 * into the run), then slice. The ellipsis is the single character `…`, which
 * is correct in all five locales.
 */
export function announcementExcerpt(html: string, max: number): string {
  const plain = decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > max ? `${plain.slice(0, max).trimEnd()}…` : plain;
}
