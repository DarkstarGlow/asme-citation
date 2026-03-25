import { describe, expect, it } from "vitest";
import { parseSpringerHtml } from "@/lib/sources/parseSpringer";

describe("parseSpringerHtml", () => {
  it("extracts metadata from springer citation meta tags", () => {
    const html = `
      <meta name="citation_title" content="Springer Example Paper" />
      <meta name="citation_author" content="John Smith" />
      <meta name="citation_date" content="2022/08/10" />
      <meta name="citation_journal_title" content="The International Journal of Advanced Manufacturing Technology" />
      <meta name="citation_volume" content="123" />
      <meta name="citation_issue" content="7" />
      <meta name="citation_firstpage" content="100" />
      <meta name="citation_lastpage" content="118" />
      <meta name="citation_doi" content="10.1007/s00170-022-12345-6" />
    `;

    const result = parseSpringerHtml(
      html,
      "https://link.springer.com/article/10.1007/s00170-022-12345-6",
    );

    expect(result.sourceType).toBe("springer");
    expect(result.title).toBe("Springer Example Paper");
    expect(result.authors).toEqual(["John Smith"]);
    expect(result.year).toBe("2022");
    expect(result.journalOrPublisher).toBe(
      "The International Journal of Advanced Manufacturing Technology",
    );
    expect(result.pages).toBe("100-118");
    expect(result.doi).toBe("10.1007/s00170-022-12345-6");
  });
});
