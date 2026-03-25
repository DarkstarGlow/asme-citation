import type { CitationSourceType } from "@/lib/citation/types";

export function detectSource(rawUrl: string): CitationSourceType {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();

    if (host === "doi.org" || host.endsWith(".doi.org")) {
      return "doi";
    }

    if (host === "arxiv.org") {
      return "arxiv";
    }

    if (host.includes("ieee.org")) {
      return "ieee";
    }

    if (host.includes("springer.com")) {
      return "springer";
    }

    return "unsupported";
  } catch {
    return "unsupported";
  }
}
