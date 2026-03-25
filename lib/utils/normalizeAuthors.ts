export function normalizeAuthors(rawAuthors: string[]): string[] {
  return rawAuthors
    .map((author) => author.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}
