import { describe, expect, it } from "vitest";
import { parseDoiCsl, parseDoiHtml } from "@/lib/sources/parseDoi";

describe("parseDoiHtml", () => {
  it("extracts metadata from citation meta tags", () => {
    const html = `
      <meta name="citation_title" content="An ASME Research Paper" />
      <meta name="citation_author" content="Ada Lovelace" />
      <meta name="citation_author" content="Grace Hopper" />
      <meta name="citation_publication_date" content="2024/01/16" />
      <meta name="citation_journal_title" content="Journal of Mechanical Design" />
      <meta name="citation_volume" content="146" />
      <meta name="citation_issue" content="3" />
      <meta name="citation_firstpage" content="031404" />
      <meta name="citation_doi" content="10.1115/1.4055251" />
    `;

    const result = parseDoiHtml(html, "https://doi.org/10.1115/1.4055251");

    expect(result.sourceType).toBe("doi");
    expect(result.title).toBe("An ASME Research Paper");
    expect(result.authors).toEqual(["Ada Lovelace", "Grace Hopper"]);
    expect(result.year).toBe("2024");
    expect(result.journalOrPublisher).toBe("Journal of Mechanical Design");
    expect(result.volume).toBe("146");
    expect(result.issue).toBe("3");
    expect(result.pages).toBe("031404");
    expect(result.doi).toBe("10.1115/1.4055251");
  });

  it("extracts metadata from doi csl json", () => {
    const csl = {
      title: "An ASME Research Paper",
      author: [
        { given: "Ada", family: "Lovelace" },
        { given: "Grace", family: "Hopper" },
      ],
      issued: { "date-parts": [[2024, 1, 16]] },
      "container-title": "Journal of Mechanical Design",
      volume: "146",
      issue: "3",
      page: "031404",
      DOI: "10.1115/1.4055251",
    };

    const result = parseDoiCsl(csl, "https://doi.org/10.1115/1.4055251");

    expect(result.sourceType).toBe("doi");
    expect(result.title).toBe("An ASME Research Paper");
    expect(result.authors).toEqual(["Ada Lovelace", "Grace Hopper"]);
    expect(result.year).toBe("2024");
    expect(result.journalOrPublisher).toBe("Journal of Mechanical Design");
    expect(result.volume).toBe("146");
    expect(result.issue).toBe("3");
    expect(result.pages).toBe("031404");
    expect(result.doi).toBe("10.1115/1.4055251");
  });
});
