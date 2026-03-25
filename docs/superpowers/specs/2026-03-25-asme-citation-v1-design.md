# ASME Citation V1 Design

Date: `2026-03-25`

## 1. Goal

Build a first-version ASME citation tool that:

- accepts a paper URL
- returns an ASME citation in a usable, accurate format for supported sources
- lets the user manually edit the output before copying

This V1 is not trying to support every possible paper URL on the internet.
It is intentionally narrow: fewer source types, higher accuracy.

## 2. Product Positioning

This is not a "magic URL parser for everything."

This is a focused citation tool for users like:

- engineering students
- mechanical engineering students
- people writing papers or reports

These users do not want to spend time formatting citations.
They want:

- input a paper URL
- get a citation draft fast
- fix details manually if needed
- copy and move on

So the product promise must be:

- accurate for supported sources
- honest for unsupported sources

Do not fake accuracy when metadata cannot be extracted reliably.

## 3. V1 Scope

### Supported Sources

V1 supports only:

- DOI pages
- arXiv
- IEEE pages
- Springer pages

### Unsupported Sources

Examples:

- random PDF URLs
- Google Scholar result URLs
- ResearchGate mirrors
- university repository pages
- generic blog/article pages
- publisher pages outside the supported set

For unsupported sources, the system must not pretend it generated an accurate citation.
It should return a clear unsupported result and ask the user to complete it manually.

## 4. Core User Flow

1. User pastes a paper URL.
2. Frontend sends the URL to `/api/citation`.
3. Backend detects the source type.
4. Backend runs the parser for that source.
5. Backend extracts normalized metadata.
6. Backend formats the metadata into an ASME citation string.
7. Frontend shows:
   - generated citation
   - source type
   - parse status
   - editable output area
   - copy action
8. If parsing fails or the source is unsupported:
   - show a clear failure state
   - do not output fake "accurate" text

## 5. Accuracy Rule

V1 must follow this rule:

- accurate when source is supported and required fields can be extracted
- explicit failure when the source is unsupported or metadata is incomplete

That means the system should prefer:

- "unsupported source"
- "metadata incomplete"
- "could not extract required fields"

instead of silently generating garbage.

## 6. Metadata Model

The parser layer should normalize all supported sources into one shared shape.

Suggested fields:

```ts
type CitationSourceType =
  | "doi"
  | "arxiv"
  | "ieee"
  | "springer"
  | "unsupported";

type CitationMetadata = {
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
```

This is the internal model. The formatter uses this structure to generate the final ASME string.

## 7. Formatting Strategy

Formatting should be centralized in one file.

The source parsers should only do extraction and normalization.
They should not each build their own final citation string.

Why:

- formatting rules stay in one place
- easier to patch ASME output later
- easier to test input vs output

## 8. Error Handling

V1 needs three failure classes:

### Unsupported Source

The URL is not from DOI/arXiv/IEEE/Springer.

Return:

- `ok: false`
- `reason: "unsupported_source"`
- a short user-facing message

### Extraction Failed

The source type is supported, but the page cannot be fetched or parsed.

Return:

- `ok: false`
- `reason: "parse_failed"`

### Incomplete Metadata

The source is supported, but the required fields are missing.

Return:

- `ok: false`
- `reason: "incomplete_metadata"`

Do not generate a fake accurate citation in any of these cases.

## 9. Frontend Behavior

The page should remain a simple single-page tool.

V1 UI sections:

- page title and short promise
- URL input
- generate button
- loading state
- success state
- error state
- editable citation output
- copy button

Success state should show:

- generated citation
- editable textarea
- detected source label

Error state should show:

- what went wrong
- whether the source is unsupported or just failed to parse

## 10. API Contract

Suggested response shape:

```ts
type CitationApiResponse =
  | {
      ok: true;
      sourceType: "doi" | "arxiv" | "ieee" | "springer";
      citation: string;
      metadata: CitationMetadata;
    }
  | {
      ok: false;
      sourceType?: CitationSourceType;
      reason:
        | "unsupported_source"
        | "parse_failed"
        | "incomplete_metadata"
        | "invalid_url";
      message: string;
    };
```

## 11. File Structure

```text
asme-citation/
  app/
    api/
      citation/
        route.ts
    globals.css
    layout.tsx
    page.tsx
  lib/
    citation/
      formatAsme.ts
      types.ts
    sources/
      detectSource.ts
      parseArxiv.ts
      parseDoi.ts
      parseIeee.ts
      parseSpringer.ts
    utils/
      extractMeta.ts
      fetchHtml.ts
      normalizeAuthors.ts
  docs/
    superpowers/
      specs/
        2026-03-25-asme-citation-v1-design.md
  public/
  package.json
  README.md
```

## 12. File Responsibilities

### `app/page.tsx`

- input URL
- submit request
- render loading/success/error
- allow manual citation editing
- support copy action

### `app/api/citation/route.ts`

- validate URL
- detect source
- call the right parser
- call formatter
- return normalized API response

### `lib/citation/types.ts`

- shared types for metadata and API response

### `lib/citation/formatAsme.ts`

- convert normalized metadata into ASME citation string

### `lib/sources/detectSource.ts`

- identify whether URL belongs to DOI, arXiv, IEEE, Springer, or unsupported

### `lib/sources/parseDoi.ts`

- fetch and parse DOI-based pages

### `lib/sources/parseArxiv.ts`

- fetch and parse arXiv metadata

### `lib/sources/parseIeee.ts`

- fetch and parse IEEE page metadata

### `lib/sources/parseSpringer.ts`

- fetch and parse Springer page metadata

### `lib/utils/fetchHtml.ts`

- centralized remote page fetching helper
- later this is where timeout, headers, retry, or fallback logic can live

### `lib/utils/extractMeta.ts`

- helper functions for extracting `<meta>` tags or page fields

### `lib/utils/normalizeAuthors.ts`

- author cleanup and output normalization

## 13. What V1 Explicitly Does Not Do

Do not include these in V1:

- batch URL processing
- mixed-source bulk bibliography generation
- automatic sorting/reordering
- citation list management
- support for every paper platform
- user accounts
- saved history
- database
- CMS

## 14. Success Criteria

V1 is successful if:

- it works for the supported source types
- it does not lie about unsupported ones
- the generated result is editable
- the tool is deployable as a real first version

V1 is not successful if:

- it claims accuracy but generates placeholder garbage
- it silently fails and still outputs a citation
- it keeps the pure frontend constraint at the cost of correctness

## 15. Recommended Next Step

After this design, implementation should focus on:

1. replace the current client-only fetch logic
2. move parsing into server-side API route
3. support one source first, then expand

Recommended implementation order:

1. `types.ts`
2. `detectSource.ts`
3. `formatAsme.ts`
4. `parseArxiv.ts` or `parseDoi.ts` first
5. `route.ts`
6. update `page.tsx`
7. then add IEEE and Springer

The key is not to "support everything fast."
The key is to support a narrow set honestly and correctly.
