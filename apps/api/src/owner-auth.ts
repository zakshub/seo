export function isOwnerAuthenticated(expected: string | undefined, supplied: string | undefined): boolean {
  return Boolean(expected && supplied && expected === supplied);
}
