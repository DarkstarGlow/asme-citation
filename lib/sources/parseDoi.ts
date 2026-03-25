import type { CitationMetadata } from "@/lib/citation/types";
import { extractMeta, extractMetaAll } from "@/lib/utils/extractMeta";
import { normalizeAuthors } from "@/lib/utils/normalizeAuthors";

type DoiCslAuthor = {
  given?: string;
  family?: string;
  literal?: string;
};

type DoiCslData = {
  title?: string;
  author?: DoiCslAuthor[];
  issued?: { "date-parts"?: (string | number)[][] };
  "container-title"?: string;
  volume?: string;
  issue?: string;
  page?: string;
  DOI?: string;
};

export function parseDoiHtml(html: string, url: string): CitationMetadata {
  const firstPage = extractMeta(html, "citation_firstpage");
  const lastPage = extractMeta(html, "citation_lastpage");

  return {
    sourceType: "doi",
    title: extractMeta(html, "citation_title"),
    authors: normalizeAuthors(extractMetaAll(html, "citation_author")),
    year: (
      extractMeta(html, "citation_publication_date") ??
      extractMeta(html, "citation_date")
    )?.slice(0, 4),
    journalOrPublisher:
      extractMeta(html, "citation_journal_title") ??
      extractMeta(html, "citation_conference_title") ??
      extractMeta(html, "citation_publisher") ??
      extractMeta(html, "og:site_name"),
    volume: extractMeta(html, "citation_volume"),
    issue: extractMeta(html, "citation_issue"),
    pages: [firstPage, lastPage].filter(Boolean).join("-") || firstPage,
    doi:
      extractMeta(html, "citation_doi") ??
      url.match(/^https?:\/\/doi\.org\/(.+)$/i)?.[1],
    url,
    accessedDate: new Date().toISOString().slice(0, 10),
  };
}

export function parseDoiCsl(data: DoiCslData, url: string): CitationMetadata {
  return {
    sourceType: "doi",
    title: data.title,
    authors: normalizeAuthors(
      (data.author ?? []).map((author) =>
        author.literal?.trim() ||
        [author.given, author.family].filter(Boolean).join(" "),
      ),
    ),
    year: data.issued?.["date-parts"]?.[0]?.[0]?.toString(),
    journalOrPublisher: data["container-title"],
    volume: data.volume,
    issue: data.issue,
    pages: data.page,
    doi: data.DOI,
    url,
    accessedDate: new Date().toISOString().slice(0, 10),
  };
}
