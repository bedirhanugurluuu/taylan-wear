/** Dev stores append this and the link opens the password page instead of checkout. */
export function checkoutHref(checkoutUrl?: string | null) {
  if (!checkoutUrl) return undefined;

  try {
    const url = new URL(checkoutUrl);
    url.searchParams.delete('preview_theme_id');
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}
