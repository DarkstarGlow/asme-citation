# ASME Citation

A narrow V1 citation tool for generating editable ASME references from supported paper URLs.

## V1 scope

The app is designed around one honest rule:

- support a small set of sources
- fail clearly for unsupported ones
- never fake accuracy

Currently verified working sources:

- DOI pages
- arXiv
- IEEE
- Springer

Current parser status:

- `DOI`, `arXiv`, `IEEE`, and `Springer` are all real, tested parsing paths

If a source is unsupported, inaccessible, or the metadata is incomplete, the API should return an explicit failure instead of a fake citation.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Main commands

```bash
npm run dev
npm run test
npm run lint
npm run build
```

## Project shape

- `app/page.tsx`
  - UI for URL input, result editing, and copy flow
- `app/api/citation/route.ts`
  - server-side citation generation endpoint
- `lib/sources/*`
  - source detection and parser implementations
- `lib/citation/*`
  - metadata types and ASME formatting
- `tests/*`
  - unit tests for parsing and formatting logic

## Notes

- V1 is intentionally narrow.
- Accuracy matters more than pretending every paper URL can be parsed.
- The user can always manually edit the generated citation before copying.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
