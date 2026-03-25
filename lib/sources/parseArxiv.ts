import type { CitationMetadata } from "@/lib/citation/types";

export function parseArxivHtml(html: string, url: string): CitationMetadata {
  const title = html.match(/citation_title["'] content=["']([^"']+)["']/i)?.[1];
  const authorMatches = [
    ...html.matchAll(/citation_author["'] content=["']([^"']+)["']/gi),
  ];
  const date = html.match(/citation_date["'] content=["']([^"']+)["']/i)?.[1];

  return {
    sourceType: "arxiv",
    title,
    authors: authorMatches.map((match) => match[1]),
    year: date?.slice(0, 4),
    journalOrPublisher: "arXiv",
    url,
    accessedDate: new Date().toISOString().slice(0, 10),
  };
}
