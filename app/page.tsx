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
    <main className="desk-shell min-h-screen px-4 py-8 text-[var(--foreground)] sm:px-6 lg:px-8 xl:px-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="mist-orb mist-orb-1 left-0 top-12 h-64 w-64 -translate-x-1/4" />
        <div className="mist-orb mist-orb-2 right-0 top-1/4 h-80 w-80 translate-x-1/4" />
        <div className="mist-orb mist-orb-3 bottom-0 left-1/3 h-72 w-72" />
      </div>

      <div className="mx-auto w-full max-w-[88rem] py-6 sm:py-10 md:py-12 lg:py-14 xl:py-16">
        <section className="animate-slide-up grid w-full items-start gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10 xl:gap-12 2xl:gap-14">
          <div className="flex min-w-0 flex-col gap-8 xl:gap-10">
            <header className="hero-shell space-y-7 rounded-[2.25rem] px-6 py-7 sm:px-8 sm:py-8 xl:px-9 xl:py-9">
              <div className="space-y-4">
                <p className="eyebrow text-xs">Quiet citation workspace</p>
                <h1 className="editorial-title max-w-[11ch] text-[clamp(2.6rem,4.6vw,5rem)] font-medium leading-[0.96]">
                  Free ASME Citation Generator
                </h1>
              </div>
              <p className="max-w-[30rem] text-[15px] leading-[1.7] text-[var(--text-muted)] sm:text-[16px]">
                Turn a verified paper link into an editable ASME citation without
                staring at a harsh tool interface. Built for DOI, arXiv, IEEE, and
                Springer paper pages.
              </p>
            </header>

            <div className="support-band space-y-5 rounded-[2rem] px-6 py-6 sm:px-8 sm:py-7 xl:px-9">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[15px] font-bold text-[var(--foreground)]">
                    Supported link types
                  </p>
                  <p className="mt-2 max-w-[42rem] text-[14px] leading-relaxed text-[var(--text-muted)]">
                    Use a direct paper page from <span className="font-semibold text-[var(--foreground)]">DOI</span>,{" "}
                    <span className="font-semibold text-[var(--foreground)]">arXiv</span>,{" "}
                    <span className="font-semibold text-[var(--foreground)]">IEEE</span>, or{" "}
                    <span className="font-semibold text-[var(--foreground)]">Springer</span>.
                  </p>
                </div>
              </div>
              <p className="max-w-[46rem] border-t border-[var(--line-soft)] pt-4 text-[13px] leading-relaxed text-[var(--text-soft)]">
                Avoid search results, author profile pages, publisher homepages, or
                generic landing pages. This tool is narrow on purpose so the result
                stays trustworthy.
              </p>
            </div>
          </div>

          <aside className="min-w-0 lg:sticky lg:top-8 xl:top-10">
            <div className="workbench-panel w-full rounded-[2rem] p-6 sm:p-7 xl:p-8">
              <div className="space-y-7">
                <div className="space-y-3">
                  <p className="eyebrow text-[11px]">Input</p>
                  <h2 className="text-[22px] font-bold tracking-tight text-[var(--foreground)]">
                    Start with one paper URL
                  </h2>
                  <p className="text-[14px] leading-relaxed text-[var(--text-muted)]">
                    Paste the paper page you would actually cite. The tool reads its
                    metadata, formats a draft, and leaves the final wording editable.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2.5">
                    <label className="block text-[14px] font-semibold text-[var(--foreground)] ml-1">
                      Paper URL
                    </label>
                    <div className="field-shell rounded-2xl px-4 py-3.5">
                      <input
                        type="url"
                        className="w-full bg-transparent text-[15px] outline-none placeholder:text-[var(--text-soft)] font-medium"
                        placeholder="https://doi.org/... or https://arxiv.org/abs/..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && generateCitation()}
                      />
                    </div>
                  </div>

                  <button
                    onClick={generateCitation}
                    disabled={loading || !url}
                    className="quiet-button w-full rounded-2xl px-6 py-4 text-[15px] font-bold tracking-wide"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </span>
                    ) : "Generate ASME Citation"}
                  </button>
                </div>

                <div className="workbench-divider" />

                {error && (
                  <div className="error-soft rounded-[1.5rem] px-5 py-4">
                    <p className="text-[15px] font-bold tracking-tight">{error.title}</p>
                    <p className="mt-2 text-[14px] leading-relaxed opacity-90">{error.detail}</p>
                    {error.tip && <p className="mt-3 text-[13.5px] leading-relaxed opacity-80">{error.tip}</p>}
                  </div>
                )}

                {!error && !loading && !hasResult && (
                  <div className="workbench-note rounded-[1.5rem] px-5 py-5 text-[14px] text-[var(--text-muted)]">
                    <p className="font-bold text-[var(--foreground)] tracking-tight">Ready when you are</p>
                    <p className="mt-2 leading-relaxed">
                      Paste one supported paper URL and generate an editable citation draft.
                    </p>
                    <p className="mt-3 leading-relaxed text-[13px] text-[var(--text-soft)]">
                      Best results come from direct DOI, arXiv, IEEE, or Springer article pages.
                    </p>
                  </div>
                )}

                {!error && loading && (
                  <div className="workbench-note rounded-[1.5rem] border-l-4 border-l-[var(--accent)] px-5 py-5 text-[14px]">
                    <p className="font-bold text-[var(--foreground)] tracking-tight">Extracting Metadata...</p>
                    <p className="mt-2 leading-relaxed text-[var(--text-muted)]">
                      Reading the paper metadata and securely formatting an ASME citation draft.
                    </p>
                  </div>
                )}

                {citation && !loading && (
                  <div className="citation-sheet rounded-[1.6rem] p-5 sm:p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent)] to-[var(--accent-soft)]" />
                    <div className="flex items-start justify-between gap-4 mt-1">
                      <div>
                        <p className="eyebrow text-[11px]">Citation ready</p>
                        <p className="mt-2 text-[14px] leading-relaxed text-[var(--text-muted)]">
                          Review the draft, adjust anything you need, then copy the final
                          version into your references.
                        </p>
                      </div>
                      {sourceType && (
                        <span className="result-chip rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
                          {sourceType}
                        </span>
                      )}
                    </div>

                    <div className="mt-5 rounded-[1.25rem] bg-[rgba(244,247,245,0.6)] p-1">
                      <textarea
                        value={citation}
                        onChange={(e) => setCitation(e.target.value)}
                        className="paper-textarea min-h-[160px] w-full resize-none rounded-[1rem] px-5 py-4 font-mono text-[13.5px] leading-[1.8]"
                      />
                    </div>

                    <div className="mt-5 flex justify-end">
                      <button
                        onClick={handleCopy}
                        className="subtle-action rounded-full px-5 py-2.5 text-[13px] font-bold tracking-wide text-[var(--foreground)]"
                      >
                        {copied ? (
                          <span className="flex items-center gap-1.5 text-[var(--accent)]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            Copied!
                          </span>
                        ) : "Copy citation"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </section>
        
        {/* SEO Content Section - Integrated Style */}
        <section className="mt-24 w-full border-t border-[var(--line-soft)] pt-16">
          <div className="mx-auto max-w-4xl space-y-16 px-4 pb-20">
            
            {/* Why it matters */}
            <div className="space-y-4">
              <p className="eyebrow text-xs uppercase tracking-[0.2em]">Background</p>
              <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
                Why Accurate ASME Citation Matters
              </h2>
              <p className="max-w-[65ch] text-[15px] leading-relaxed text-[var(--text-muted)]">
                The American Society of Mechanical Engineers (ASME) uses a specific numerical sequence system for references. 
                Whether you are writing a journal paper or a technical report, using an automated ASME reference generator 
                ensures that your bibliography meets professional engineering standards, saving you hours of manual formatting.
              </p>
            </div>

            {/* How to use */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
                How to Use the ASME Citation Generator
              </h2>
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-bold text-[var(--foreground)]">1. Enter Source</p>
                  <p className="text-[14px] leading-relaxed text-[var(--text-muted)]">
                    Paste the URL or DOI of your reference into the input field above.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-[var(--foreground)]">2. Generate</p>
                  <p className="text-[14px] leading-relaxed text-[var(--text-muted)]">
                    Click the &quot;Generate ASME Citation&quot; button to process your request.
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-bold text-[var(--foreground)]">3. Edit & Copy</p>
                  <p className="text-[14px] leading-relaxed text-[var(--text-muted)]">
                    Review the formatted result, make manual tweaks, and copy it directly.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="space-y-8 border-t border-[var(--line-soft)] pt-12">
              <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
                Frequently Asked Questions
              </h2>
              <div className="grid gap-8 sm:grid-cols-2">
                <div className="space-y-3">
                  <p className="text-[15px] font-bold text-[var(--foreground)]">
                    Is this updated for the latest ASME standards?
                  </p>
                  <p className="text-[14px] leading-relaxed text-[var(--text-muted)]">
                    Yes, our tool is consistently updated to align with the current ASME citation guidelines for engineering publications.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-[15px] font-bold text-[var(--foreground)]">
                    Can I format citations for online journals?
                  </p>
                  <p className="text-[14px] leading-relaxed text-[var(--text-muted)]">
                    Absolutely. Simply provide the URL or DOI, and the tool will extract the metadata required for a standard ASME format.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-[15px] font-bold text-[var(--foreground)]">
                    Do I need to register to use the tool?
                  </p>
                  <p className="text-[14px] leading-relaxed text-[var(--text-muted)]">
                    No, this is a 100% free tool with no login required, specifically designed for students and researchers.
                  </p>
                </div>
                <div className="space-y-3">
                  <p className="text-[15px] font-bold text-[var(--foreground)]">
                    Can I manually edit the results?
                  </p>
                  <p className="text-[14px] leading-relaxed text-[var(--text-muted)]">
                    Yes. We provide an editable text area so you can fine-tune every detail before copying the citation to your paper.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}



