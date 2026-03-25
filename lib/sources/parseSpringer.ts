import type { CitationMetadata } from "@/lib/citation/types";
import { extractMeta, extractMetaAll } from "@/lib/utils/extractMeta";
import { normalizeAuthors } from "@/lib/utils/normalizeAuthors";

export function parseSpringerHtml(
  html: string,
  url: string,
): CitationMetadata {
  const firstPage = extractMeta(html, "citation_firstpage");
  const lastPage = extractMeta(html, "citation_lastpage");

  return {
    sourceType: "springer",
    title: extractMeta(html, "citation_title"),
    authors: normalizeAuthors(extractMetaAll(html, "citation_author")),
    year: (
      extractMeta(html, "citation_publication_date") ??
      extractMeta(html, "citation_date")
    )?.slice(0, 4),
    journalOrPublisher:
      extractMeta(html, "citation_journal_title") ??
      extractMeta(html, "citation_publisher") ??
      "Springer",
    volume: extractMeta(html, "citation_volume"),
    issue: extractMeta(html, "citation_issue"),
    pages: [firstPage, lastPage].filter(Boolean).join("-") || firstPage,
    doi: extractMeta(html, "citation_doi"),
    url,
    accessedDate: new Date().toISOString().slice(0, 10),
  };
}
