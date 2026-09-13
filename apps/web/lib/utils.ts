/**
 * Lightweight className utility — filters falsy values and joins the rest.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}