export type CitationSourceType =
  | "doi"
  | "arxiv"
  | "ieee"
  | "springer"
  | "unsupported";

export type CitationMetadata = {
  sourceType: CitationSourceType;
  title?: string;
  authors?: string[];
  year?: string;
  journalOrPublisher?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url: string;
  accessedDate: string;
};

export type CitationApiSuccess = {
  ok: true;
  sourceType: Exclude<CitationSourceType, "unsupported">;
  citation: string;
  metadata: CitationMetadata;
};

export type CitationApiFailure = {
  ok: false;
  sourceType?: CitationSourceType;
  reason:
    | "unsupported_source"
    | "parse_failed"
    | "incomplete_metadata"
    | "invalid_url";
  message: string;
};

export type CitationApiResponse = CitationApiSuccess | CitationApiFailure;
