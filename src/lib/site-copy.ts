/** Legacy labels in CMS / DB copy — always show as PATS to participants. */
const BRANDING_REPLACEMENTS: [RegExp, string][] = [
  [/HQ\s*37\s*DIV/gi, "PATS"],
  [/HQ\s*160/gi, "PATS"],
];

export function normalizeBrandingCopy(text: string): string {
  let result = text;
  for (const [pattern, replacement] of BRANDING_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }
  return result;
}
