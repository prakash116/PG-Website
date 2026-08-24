/**
 * Working out which single sidebar entry is the current one.
 *
 * Kept free of React and of any import so it can be reasoned about — and
 * tested — on its own.
 */

export interface NavCandidate {
  href: string;
  children?: Array<{ href: string }>;
}

/** `trailingSlash: true` means the current path arrives as "/admin/". */
export function normalizePath(path: string): string {
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

/**
 * The single most specific nav entry that matches the current path.
 *
 * Matching each entry on its own lights up more than one at a time as soon as
 * an entry sits at a parent path: the Super Admin's Overview is `/admin`,
 * which is a prefix of every other admin route, so it stayed highlighted on
 * all of them. Comparing every candidate and keeping the longest match leaves
 * exactly one active.
 *
 * Children are candidates too, so CRM → Services wins over CRM.
 */
export function activeHrefFor(
  nav: NavCandidate[],
  pathname: string,
): string | null {
  const path = normalizePath(pathname);

  const candidates = nav.flatMap((item) => [
    item.href,
    ...(item.children?.map((child) => child.href) ?? []),
  ]);

  return (
    candidates
      .filter((href) => path === href || path.startsWith(`${href}/`))
      .sort((a, b) => b.length - a.length)[0] ?? null
  );
}
