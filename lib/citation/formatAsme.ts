import type { CitationMetadata } from "@/lib/citation/types";

export function formatAsme(metadata: CitationMetadata): string {
  const authors = metadata.authors?.join(", ");
  const year = metadata.year ?? "n.d.";
  const title = metadata.title ?? "Untitled";
  const source = metadata.journalOrPublisher ?? "Unknown source";
  const volumeAndIssue = [metadata.volume, metadata.issue && `(${metadata.issue})`]
    .filter(Boolean)
    .join("");
  const pages = metadata.pages ? `pp. ${metadata.pages}` : "";
  const doiPart = metadata.doi ? `doi: ${metadata.doi}` : "";

  return [authors, year, `"${title}"`, source, volumeAndIssue, pages, doiPart, metadata.url]
    .filter(Boolean)
    .join(", ");
}
