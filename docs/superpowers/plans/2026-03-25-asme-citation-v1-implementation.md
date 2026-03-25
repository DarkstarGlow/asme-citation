# ASME Citation V1 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a first-version ASME citation tool that accepts a paper URL, parses supported sources on the server, returns a citation string plus metadata, and lets the user manually edit the result before copying.

**Architecture:** Move citation generation out of the client and into a Next.js route handler. Keep source detection, source-specific parsing, metadata normalization, and ASME formatting in separate files so unsupported sources fail honestly and supported sources can expand one by one. Add lightweight unit tests for the pure parsing/formatting layer before wiring the UI.

**Tech Stack:** Next.js App Router, TypeScript, route handlers, server-side fetch, Vitest for unit tests

---

## File Map

### New files

- `docs/superpowers/plans/2026-03-25-asme-citation-v1-implementation.md`
- `lib/citation/types.ts`
- `lib/citation/formatAsme.ts`
- `lib/sources/detectSource.ts`
- `lib/sources/parseArxiv.ts`
- `lib/sources/parseDoi.ts`
- `lib/sources/parseIeee.ts`
- `lib/sources/parseSpringer.ts`
- `lib/utils/fetchHtml.ts`
- `lib/utils/extractMeta.ts`
- `lib/utils/normalizeAuthors.ts`
- `app/api/citation/route.ts`
- `tests/citation/formatAsme.test.ts`
- `tests/sources/detectSource.test.ts`
- `tests/sources/parseArxiv.test.ts`
- `vitest.config.ts`

### Modified files

- `package.json`
- `app/page.tsx`
- `README.md`

### Responsibility split

- `app/page.tsx`
  - Input URL, submit to API, show loading/success/error, allow manual editing and copy.
- `app/api/citation/route.ts`
  - Validate URL, detect source, call parser, call formatter, return structured JSON.
- `lib/citation/types.ts`
  - Shared metadata and API response types.
- `lib/citation/formatAsme.ts`
  - Convert normalized metadata into one ASME citation string.
- `lib/sources/*`
  - Detect source type and parse source-specific metadata.
- `lib/utils/*`
  - Fetch HTML, extract meta tags, normalize author data.
- `tests/*`
  - Unit tests for pure logic and one parser starting point.

## Chunk 1: Test Foundation And Shared Types

### Task 1: Add the test runner

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Add failing plan note for missing tests**

Record in working notes that the project currently has no unit test runner and pure logic cannot be verified safely.

- [ ] **Step 2: Add Vitest dependencies and scripts to `package.json`**

Add:

```json
"devDependencies": {
  "vitest": "^3.2.4",
  "@vitest/coverage-v8": "^3.2.4"
},
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});
```

- [ ] **Step 4: Install dependencies**

Run: `npm install`

Expected: install completes and `package-lock.json` updates if npm is used

- [ ] **Step 5: Run tests to confirm harness is live**

Run: `npm test`

Expected: no tests found or empty suite, but Vitest starts successfully

- [ ] **Step 6: Commit**

```bash
git add package.json vitest.config.ts package-lock.json
git commit -m "test: add vitest for citation logic"
```

### Task 2: Create shared types

**Files:**
- Create: `lib/citation/types.ts`

- [ ] **Step 1: Write the failing type-usage test scaffold indirectly**

Create the import target used by later tests so future test files can import shared types without redefining shapes.

- [ ] **Step 2: Create `lib/citation/types.ts`**

```ts
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
```

- [ ] **Step 3: Run type check through build**

Run: `npm run build`

Expected: build still passes

- [ ] **Step 4: Commit**

```bash
git add lib/citation/types.ts
git commit -m "feat: add shared citation types"
```

## Chunk 2: Source Detection And Formatting Core

### Task 3: Add source detection tests

**Files:**
- Create: `tests/sources/detectSource.test.ts`
- Create: `lib/sources/detectSource.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { detectSource } from "../../lib/sources/detectSource";

describe("detectSource", () => {
  it("detects arxiv urls", () => {
    expect(detectSource("https://arxiv.org/abs/1706.03762")).toBe("arxiv");
  });

  it("detects doi urls", () => {
    expect(detectSource("https://doi.org/10.1115/1.4055251")).toBe("doi");
  });

  it("detects ieee urls", () => {
    expect(detectSource("https://ieeexplore.ieee.org/document/1234567")).toBe("ieee");
  });

  it("detects springer urls", () => {
    expect(detectSource("https://link.springer.com/article/10.1007/s00170-023-12345-6")).toBe("springer");
  });

  it("returns unsupported for unknown urls", () => {
    expect(detectSource("https://example.com/paper")).toBe("unsupported");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/sources/detectSource.test.ts`

Expected: FAIL because `detectSource` does not exist yet

- [ ] **Step 3: Write minimal implementation**

Create `lib/sources/detectSource.ts`:

```ts
import type { CitationSourceType } from "../citation/types";

export function detectSource(rawUrl: string): CitationSourceType {
  try {
    const url = new URL(rawUrl);
    const host = url.hostname.toLowerCase();

    if (host === "doi.org" || host.endsWith(".doi.org")) return "doi";
    if (host === "arxiv.org") return "arxiv";
    if (host.includes("ieee.org")) return "ieee";
    if (host.includes("springer.com")) return "springer";

    return "unsupported";
  } catch {
    return "unsupported";
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/sources/detectSource.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/sources/detectSource.test.ts lib/sources/detectSource.ts
git commit -m "feat: detect supported citation sources"
```

### Task 4: Add ASME formatter tests

**Files:**
- Create: `tests/citation/formatAsme.test.ts`
- Create: `lib/citation/formatAsme.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { formatAsme } from "../../lib/citation/formatAsme";

describe("formatAsme", () => {
  it("formats a citation from normalized metadata", () => {
    const result = formatAsme({
      sourceType: "arxiv",
      title: "Attention Is All You Need",
      authors: ["Ashish Vaswani", "Noam Shazeer"],
      year: "2017",
      journalOrPublisher: "arXiv",
      doi: "10.48550/arXiv.1706.03762",
      url: "https://arxiv.org/abs/1706.03762",
      accessedDate: "2026-03-25",
    });

    expect(result).toContain("Attention Is All You Need");
    expect(result).toContain("2017");
    expect(result).toContain("arXiv");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/citation/formatAsme.test.ts`

Expected: FAIL because formatter does not exist

- [ ] **Step 3: Write minimal implementation**

Create `lib/citation/formatAsme.ts`:

```ts
import type { CitationMetadata } from "./types";

export function formatAsme(metadata: CitationMetadata): string {
  const authors = metadata.authors?.join(", ");
  const year = metadata.year ?? "n.d.";
  const title = metadata.title ?? "Untitled";
  const source = metadata.journalOrPublisher ?? "Unknown source";
  const doiPart = metadata.doi ? `, doi: ${metadata.doi}` : "";

  return [authors, year, `"${title}"`, source, metadata.url]
    .filter(Boolean)
    .join(", ") + doiPart;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/citation/formatAsme.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/citation/formatAsme.test.ts lib/citation/formatAsme.ts
git commit -m "feat: add base asme formatter"
```

## Chunk 3: Parsing Utilities And First Supported Source

### Task 5: Add shared parsing utilities

**Files:**
- Create: `lib/utils/fetchHtml.ts`
- Create: `lib/utils/extractMeta.ts`
- Create: `lib/utils/normalizeAuthors.ts`

- [ ] **Step 1: Create `fetchHtml.ts`**

```ts
export async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 ASME Citation Bot/1.0",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch HTML: ${response.status}`);
  }

  return response.text();
}
```

- [ ] **Step 2: Create `extractMeta.ts`**

```ts
export function extractMeta(html: string, name: string): string | undefined {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+property=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return undefined;
}
```

- [ ] **Step 3: Create `normalizeAuthors.ts`**

```ts
export function normalizeAuthors(rawAuthors: string[]): string[] {
  return rawAuthors
    .map((author) => author.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}
```

- [ ] **Step 4: Run build**

Run: `npm run build`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/utils/fetchHtml.ts lib/utils/extractMeta.ts lib/utils/normalizeAuthors.ts
git commit -m "feat: add citation parsing utilities"
```

### Task 6: Implement arXiv parser first

**Files:**
- Create: `tests/sources/parseArxiv.test.ts`
- Create: `lib/sources/parseArxiv.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from "vitest";
import { parseArxivHtml } from "../../lib/sources/parseArxiv";

describe("parseArxivHtml", () => {
  it("extracts title, authors, year, and url from arxiv html", () => {
    const html = `
      <meta name="citation_title" content="Attention Is All You Need" />
      <meta name="citation_author" content="Ashish Vaswani" />
      <meta name="citation_author" content="Noam Shazeer" />
      <meta name="citation_date" content="2017/06/12" />
    `;

    const result = parseArxivHtml(html, "https://arxiv.org/abs/1706.03762");

    expect(result.title).toBe("Attention Is All You Need");
    expect(result.authors).toEqual(["Ashish Vaswani", "Noam Shazeer"]);
    expect(result.year).toBe("2017");
    expect(result.sourceType).toBe("arxiv");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/sources/parseArxiv.test.ts`

Expected: FAIL because parser does not exist

- [ ] **Step 3: Write minimal implementation**

Create `lib/sources/parseArxiv.ts`:

```ts
import type { CitationMetadata } from "../citation/types";

export function parseArxivHtml(html: string, url: string): CitationMetadata {
  const title = html.match(/citation_title["'] content=["']([^"']+)["']/i)?.[1];
  const authorMatches = [...html.matchAll(/citation_author["'] content=["']([^"']+)["']/gi)];
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/sources/parseArxiv.test.ts`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/sources/parseArxiv.test.ts lib/sources/parseArxiv.ts
git commit -m "feat: add arxiv parser"
```

## Chunk 4: API Route And Frontend Wiring

### Task 7: Add placeholder parsers for non-arXiv supported sources

**Files:**
- Create: `lib/sources/parseDoi.ts`
- Create: `lib/sources/parseIeee.ts`
- Create: `lib/sources/parseSpringer.ts`

- [ ] **Step 1: Create `parseDoi.ts` with explicit not-ready behavior**

```ts
export async function parseDoi() {
  throw new Error("DOI parser not implemented yet");
}
```

- [ ] **Step 2: Create `parseIeee.ts` with explicit not-ready behavior**

```ts
export async function parseIeee() {
  throw new Error("IEEE parser not implemented yet");
}
```

- [ ] **Step 3: Create `parseSpringer.ts` with explicit not-ready behavior**

```ts
export async function parseSpringer() {
  throw new Error("Springer parser not implemented yet");
}
```

- [ ] **Step 4: Run build**

Run: `npm run build`

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/sources/parseDoi.ts lib/sources/parseIeee.ts lib/sources/parseSpringer.ts
git commit -m "chore: stub unsupported parser implementations"
```

### Task 8: Build the route handler

**Files:**
- Create: `app/api/citation/route.ts`

- [ ] **Step 1: Write route implementation**

```ts
import { NextResponse } from "next/server";
import { formatAsme } from "../../../lib/citation/formatAsme";
import type { CitationApiResponse } from "../../../lib/citation/types";
import { detectSource } from "../../../lib/sources/detectSource";
import { parseArxivHtml } from "../../../lib/sources/parseArxiv";
import { fetchHtml } from "../../../lib/utils/fetchHtml";

export async function POST(request: Request) {
  const { url } = await request.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json<CitationApiResponse>(
      { ok: false, reason: "invalid_url", message: "Please provide a valid URL." },
      { status: 400 }
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
      { status: 400 }
    );
  }

  try {
    if (sourceType !== "arxiv") {
      return NextResponse.json<CitationApiResponse>(
        {
          ok: false,
          sourceType,
          reason: "parse_failed",
          message: "This supported source is not implemented yet.",
        },
        { status: 501 }
      );
    }

    const html = await fetchHtml(url);
    const metadata = parseArxivHtml(html, url);

    if (!metadata.title || !metadata.authors?.length || !metadata.year) {
      return NextResponse.json<CitationApiResponse>(
        {
          ok: false,
          sourceType,
          reason: "incomplete_metadata",
          message: "Could not extract enough citation fields from this page.",
        },
        { status: 422 }
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
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: PASS

- [ ] **Step 3: Manual route test**

Run:

```bash
npm run dev
```

Then POST:

```bash
curl -X POST http://localhost:3000/api/citation ^
  -H "Content-Type: application/json" ^
  -d "{\"url\":\"https://arxiv.org/abs/1706.03762\"}"
```

Expected: JSON success response with `ok: true`

- [ ] **Step 4: Commit**

```bash
git add app/api/citation/route.ts
git commit -m "feat: add citation api route"
```

### Task 9: Rewire the homepage to use the API

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Remove client-side proxy scraping**

Delete the current direct client fetch to `allorigins`.

- [ ] **Step 2: Add API-driven submit flow**

Replace `generateCitation` with a POST request to `/api/citation`.

Use state roughly like:

```ts
const [error, setError] = useState<string>("");
const [sourceType, setSourceType] = useState<string>("");
```

Request shape:

```ts
const response = await fetch("/api/citation", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ url }),
});
```

Success handling:

```ts
if (data.ok) {
  setCitation(data.citation);
  setSourceType(data.sourceType);
  setError("");
}
```

Failure handling:

```ts
if (!data.ok) {
  setCitation("");
  setSourceType(data.sourceType ?? "");
  setError(data.message);
}
```

- [ ] **Step 3: Update UI copy to match actual capability**

Change hero/supporting text so it no longer overclaims universal accuracy.

Suggested line:

```tsx
<p className="text-zinc-500 mb-8">
  Generate an editable ASME citation for supported paper sources.
</p>
```

- [ ] **Step 4: Add success/error source feedback**

Render:

- supported source label on success
- error banner on failure

- [ ] **Step 5: Run lint and build**

Run: `npm run lint`
Expected: PASS with no warnings

Run: `npm run build`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx
git commit -m "feat: wire homepage to citation api"
```

## Chunk 5: Documentation And Reality Check

### Task 10: Update README to match the real V1

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace generic Next.js boilerplate**

Document:

- what the app does
- supported sources
- unsupported-source behavior
- local commands

- [ ] **Step 2: Add a short implementation note**

State clearly that:

- V1 supports `arXiv` first in implementation
- DOI / IEEE / Springer are planned but not complete until parser tasks are implemented

- [ ] **Step 3: Run build one last time**

Run: `npm run build`

Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: describe asme citation v1 scope"
```

## Final Verification Checklist

- [ ] `npm test`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Manual test with one supported URL
- [ ] Manual test with one unsupported URL
- [ ] Confirm UI allows manual editing and copy

## Execution Notes

- Do not implement all source parsers in one pass.
- Get the architecture right with one working source first.
- arXiv is the best first parser because metadata is relatively structured.
- Only after arXiv works cleanly should DOI, IEEE, and Springer be filled in for real.

Plan complete and saved to `docs/superpowers/plans/2026-03-25-asme-citation-v1-implementation.md`. Ready to execute?
