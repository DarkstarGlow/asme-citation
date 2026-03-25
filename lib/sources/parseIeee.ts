import type { CitationMetadata } from "@/lib/citation/types";
import { extractMeta, extractMetaAll } from "@/lib/utils/extractMeta";
import { normalizeAuthors } from "@/lib/utils/normalizeAuthors";

type IeeeEmbeddedAuthor = {
  name?: string;
  firstName?: string;
  lastName?: string;
};

type IeeeEmbeddedMetadata = {
  authors?: IeeeEmbeddedAuthor[];
  publicationYear?: string;
  displayPublicationTitle?: string;
  title?: string;
  doi?: string;
  startPage?: string;
  endPage?: string;
};

export function parseIeeeHtml(html: string, url: string): CitationMetadata {
  const embedded = extractEmbeddedIeeeMetadata(html);
  const firstPage = extractMeta(html, "citation_firstpage");
  const lastPage = extractMeta(html, "citation_lastpage");
  const embeddedAuthors = normalizeAuthors(
    (embedded?.authors ?? []).map(
      (author) =>
        author.name?.trim() ||
        [author.firstName, author.lastName].filter(Boolean).join(" "),
    ),
  );

  return {
    sourceType: "ieee",
    title:
      extractMeta(html, "citation_title") ??
      embedded?.title ??
      extractMeta(html, "og:title"),
    authors: normalizeAuthors(extractMetaAll(html, "citation_author")).length
      ? normalizeAuthors(extractMetaAll(html, "citation_author"))
      : embeddedAuthors,
    year: (
      extractMeta(html, "citation_publication_date") ??
      extractMeta(html, "citation_date") ??
      embedded?.publicationYear
    )?.slice(0, 4),
    journalOrPublisher:
      extractMeta(html, "citation_journal_title") ??
      extractMeta(html, "citation_conference_title") ??
      embedded?.displayPublicationTitle ??
      "IEEE",
    volume: extractMeta(html, "citation_volume"),
    issue: extractMeta(html, "citation_issue"),
    pages:
      [firstPage, lastPage].filter(Boolean).join("-") ||
      [embedded?.startPage, embedded?.endPage].filter(Boolean).join("-") ||
      firstPage,
    doi: extractMeta(html, "citation_doi") ?? embedded?.doi,
    url,
    accessedDate: new Date().toISOString().slice(0, 10),
  };
}

function extractEmbeddedIeeeMetadata(
  html: string,
): IeeeEmbeddedMetadata | undefined {
  const match = html.match(
    /(?:xplGlobal|global)\.document\.metadata\s*=\s*(\{[\s\S]*?\});/i,
  );

  if (!match?.[1]) {
    return undefined;
  }

  try {
    return JSON.parse(match[1]) as IeeeEmbeddedMetadata;
  } catch {
    return undefined;
  }
}
