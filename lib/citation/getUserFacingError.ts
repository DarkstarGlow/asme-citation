import type { CitationApiFailure } from "@/lib/citation/types";

export function getUserFacingError(error: CitationApiFailure): {
  title: string;
  detail: string;
  tip?: string;
} {
  switch (error.reason) {
    case "invalid_url":
      return {
        title: "Enter a full paper URL",
        detail:
          "Paste a direct paper link, not a search result or partial text.",
        tip: "Try a DOI, arXiv, IEEE, or Springer article page URL.",
      };
    case "unsupported_source":
      return {
        title: "This link is not supported yet",
        detail:
          "This tool currently works with verified DOI, arXiv, IEEE, or Springer paper pages.",
        tip: "If you can, use the paper's DOI page instead of a generic landing page.",
      };
    case "incomplete_metadata":
      return {
        title: "Not enough citation details were found",
        detail:
          "We found the page, but not enough structured metadata to generate a reliable ASME citation.",
        tip: "Try another version of the same paper, especially its DOI page.",
      };
    case "parse_failed":
      return {
        title: "We could not read that page",
        detail:
          "The page may be unavailable, the site blocked access, or the link may not point to a usable paper record.",
        tip: "Try again, or switch to a DOI page if one exists.",
      };
    default:
      return {
        title: "Something went wrong",
        detail: error.message,
      };
  }
}
