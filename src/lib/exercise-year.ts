/**
 * Edition year shown to the public.
 *
 * The exercise runs early in the calendar year, so from July onwards the site
 * should already be advertising the NEXT edition rather than the one that has
 * just finished. The hero headline was the first place this rule appeared;
 * the footer copyright line now shares it so the two can never drift apart.
 *
 * @param now Injected for tests; defaults to the current instant.
 */
export function computeExerciseYear(now: Date = new Date()): number {
  const currentYear = now.getFullYear();
  // getMonth() is 0-indexed, so 6 is July
  return now.getMonth() >= 6 ? currentYear + 1 : currentYear;
}
