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

Cloudflare Pages build command:

```bash
pnpm exec next-on-pages
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
- This project is not a pure static Pages site. `/api/citation` is deployed as a Cloudflare Pages Function / Worker route.

## Deploy on Cloudflare Pages

This project is deployed with Cloudflare Pages plus `@cloudflare/next-on-pages`.

Required Pages settings:

- Build command: `pnpm exec next-on-pages`
- Build output directory: `.vercel/output/static`

Required project config:

- [`wrangler.toml`](C:\Users\mlpcm\Desktop\AIcoding_and_tool\web-making\asme-citation\wrangler.toml)
  - `pages_build_output_dir = ".vercel/output/static"`
  - `compatibility_flags = ["nodejs_compat"]`

Why `nodejs_compat` is needed:

- the app uses a dynamic API route at `app/api/citation/route.ts`
- Cloudflare Pages runs that route as a Worker / Function
- the runtime dependency chain pulls in Node built-ins such as `node:buffer` and `node:async_hooks`
- without `nodejs_compat`, deploys may succeed but the API can fail at runtime
