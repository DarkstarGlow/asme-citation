"use client";

import { useState } from "react";
import { getUserFacingError } from "@/lib/citation/getUserFacingError";
import type { CitationApiResponse } from "@/lib/citation/types";

export default function Home() {
  const [url, setUrl] = useState("");
  const [citation, setCitation] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{
    title: string;
    detail: string;
    tip?: string;
  } | null>(null);
  const [sourceType, setSourceType] = useState("");
  const hasResult = Boolean(citation);

  const generateCitation = async () => {
    if (!url) return;

    setLoading(true);
    try {
      const response = await fetch("/api/citation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });
      const data = (await response.json()) as CitationApiResponse;

      if (data.ok) {
        setCitation(data.citation);
        setSourceType(data.sourceType);
        setError(null);
        setCopied(false);
      } else {
        setCitation("");
        setSourceType(data.sourceType ?? "");
        setError(getUserFacingError(data));
        setCopied(false);
      }
    } catch {
      setCitation("");
      setSourceType("");
      setError({
        title: "We could not generate the citation",
        detail:
          "Something unexpected happened while contacting the citation service.",
        tip: "Try again in a moment. If the problem keeps happening, test the same paper with its DOI page.",
      });
      setCopied(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="desk-shell min-h-screen overflow-hidden px-4 py-8 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mist-orb -left-12 top-10 h-44 w-44 bg-[#d9e8dc]" />
      <div className="mist-orb right-0 top-28 h-56 w-56 bg-[#e9f0ea]" />
      <div className="mist-orb bottom-10 left-1/3 h-40 w-40 bg-[#dfe9df]" />

      <div className="mx-auto flex w-full max-w-5xl items-start pt-6 sm:pt-8 lg:min-h-[calc(100vh-4rem)] lg:items-center lg:pt-0">
        <section className="paper-panel grid w-full gap-8 rounded-[2rem] p-6 sm:p-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:p-10">
          <div className="flex flex-col justify-between gap-8">
            <div className="space-y-5">
              <p className="eyebrow text-xs font-medium">Quiet citation workspace</p>
              <div className="space-y-4">
                <h1 className="editorial-title text-4xl leading-tight font-medium text-[var(--foreground)] sm:text-5xl">
                  Free ASME Citation Generator
                </h1>
                <p className="max-w-xl text-[15px] leading-7 text-[var(--text-muted)] sm:text-base">
                  Turn a verified paper link into an editable ASME citation without
                  staring at a harsh tool interface. Built for DOI, arXiv, IEEE, and
                  Springer paper pages.
                </p>
              </div>
            </div>

            <div className="paper-well rounded-[1.5rem] p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    Supported link types
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                    Use a direct paper page from <span className="font-semibold">DOI</span>,{" "}
                    <span className="font-semibold">arXiv</span>,{" "}
                    <span className="font-semibold">IEEE</span>, or{" "}
                    <span className="font-semibold">Springer</span>.
                  </p>
                </div>
                <div className="result-chip rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">
                  Verified
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
                Avoid search results, author profile pages, publisher homepages, or
                generic landing pages. This tool is narrow on purpose so the result
                stays trustworthy.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="paper-well rounded-[1.5rem] p-5 sm:p-6">
              <div className="mb-4">
                <p className="eyebrow text-[11px] font-semibold">Input</p>
                <h2 className="mt-2 text-lg font-semibold text-[var(--foreground)]">
                  Start with one paper URL
                </h2>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-[var(--foreground)]">
                  Paper URL
                </label>
                <div className="field-shell rounded-2xl px-4 py-3 transition-all">
                  <input
                    type="url"
                    className="w-full bg-transparent text-[15px] outline-none placeholder:text-[var(--text-soft)]"
                    placeholder="https://doi.org/... or https://arxiv.org/abs/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && generateCitation()}
                  />
                </div>

                <div className="support-note rounded-2xl px-4 py-3 text-sm leading-6 text-[var(--text-muted)]">
                  Paste the paper page you would actually cite. The tool reads its
                  metadata, formats a draft, and leaves the final wording editable.
                </div>

                <button
                  onClick={generateCitation}
                  disabled={loading || !url}
                  className="quiet-button w-full rounded-2xl px-5 py-3.5 text-sm font-semibold tracking-[0.01em] transition-all disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {loading ? "Generating citation..." : "Generate ASME Citation"}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-soft rounded-[1.5rem] px-5 py-4 text-sm">
                <p className="font-semibold">{error.title}</p>
                <p className="mt-1 leading-6 opacity-90">{error.detail}</p>
                {error.tip && <p className="mt-3 leading-6 opacity-80">{error.tip}</p>}
              </div>
            )}

            {!error && !loading && !hasResult && (
              <div className="status-soft rounded-[1.5rem] px-5 py-5 text-sm text-[var(--text-muted)]">
                <p className="font-semibold text-[var(--foreground)]">Ready when you are</p>
                <p className="mt-2 leading-6">
                  Paste one supported paper URL and generate an editable citation draft.
                </p>
                <p className="mt-2 leading-6 text-[var(--text-soft)]">
                  Best results come from direct DOI, arXiv, IEEE, or Springer article pages.
                </p>
              </div>
            )}

            {!error && loading && (
              <div className="status-soft rounded-[1.5rem] px-5 py-5 text-sm text-[var(--text-muted)]">
                <p className="font-semibold text-[var(--foreground)]">Generating citation...</p>
                <p className="mt-2 leading-6">
                  Reading the paper metadata and formatting an ASME citation draft.
                </p>
              </div>
            )}

            {citation && !loading && (
              <div className="citation-sheet rounded-[1.7rem] p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow text-[11px] font-semibold">Citation ready</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                      Review the draft, adjust anything you need, then copy the final
                      version into your references.
                    </p>
                  </div>
                  {sourceType && (
                    <span className="result-chip rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">
                      {sourceType}
                    </span>
                  )}
                </div>

                <div className="mt-5 rounded-[1.4rem] bg-white/45 px-4 py-4">
                  <textarea
                    value={citation}
                    onChange={(e) => setCitation(e.target.value)}
                    className="paper-textarea min-h-[168px] w-full resize-none bg-transparent font-mono text-[13px] leading-8"
                  />
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleCopy}
                    className="subtle-action rounded-full px-4 py-2 text-xs font-semibold tracking-[0.04em] text-[var(--foreground)] transition-colors"
                  >
                    {copied ? "Copied!" : "Copy citation"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
