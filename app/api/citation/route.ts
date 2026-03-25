import { NextResponse } from "next/server";

import { formatAsme } from "@/lib/citation/formatAsme";
import type { CitationApiResponse } from "@/lib/citation/types";
import { detectSource } from "@/lib/sources/detectSource";
import { parseArxivHtml } from "@/lib/sources/parseArxiv";
import { parseDoiCsl } from "@/lib/sources/parseDoi";
import { parseIeeeHtml } from "@/lib/sources/parseIeee";
import { parseSpringerHtml } from "@/lib/sources/parseSpringer";
import { fetchHtml } from "@/lib/utils/fetchHtml";

export async function POST(request: Request) {
  const body = (await request.json()) as { url?: unknown };
  const url = body.url;

  if (!url || typeof url !== "string") {
    return NextResponse.json<CitationApiResponse>(
      {
        ok: false,
        reason: "invalid_url",
        message: "Please provide a valid paper URL.",
      },
      { status: 400 },
    );
  }

  const sourceType = detectSource(url);

  if (sourceType === "unsupported") {
    return NextResponse.json<CitationApiResponse>(
      {
        ok: false,
        sourceType,
        reason: "unsupported_source",
        message: "This source is not supported in V1 yet.",
      },
      { status: 400 },
    );
  }

  try {
    const metadata =
      sourceType === "doi"
        ? parseDoiCsl(
            (await fetch(url, {
              headers: {
                accept: "application/vnd.citationstyles.csl+json",
                "user-agent": "Mozilla/5.0 ASME Citation Bot/1.0",
              },
              cache: "no-store",
            }).then(async (response) => {
              if (!response.ok) {
                throw new Error(`Failed to fetch DOI metadata: ${response.status}`);
              }
              return response.json();
            })) as Parameters<typeof parseDoiCsl>[0],
            url,
          )
        : sourceType === "arxiv"
          ? parseArxivHtml(await fetchHtml(url), url)
          : sourceType === "ieee"
            ? parseIeeeHtml(await fetchHtml(url), url)
            : parseSpringerHtml(await fetchHtml(url), url);

    if (!metadata.title || !metadata.authors?.length || !metadata.year) {
      return NextResponse.json<CitationApiResponse>(
        {
          ok: false,
          sourceType,
          reason: "incomplete_metadata",
          message: "Could not extract enough citation fields from this page.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json<CitationApiResponse>({
      ok: true,
      sourceType,
      citation: formatAsme(metadata),
      metadata,
    });
  } catch {
    return NextResponse.json<CitationApiResponse>(
      {
        ok: false,
        sourceType,
        reason: "parse_failed",
        message: "Failed to fetch or parse the citation source.",
      },
      { status: 500 },
    );
  }
}
