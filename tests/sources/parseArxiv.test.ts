import { describe, expect, it } from "vitest";
import { parseArxivHtml } from "@/lib/sources/parseArxiv";

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
    expect(result.journalOrPublisher).toBe("arXiv");
  });
});
