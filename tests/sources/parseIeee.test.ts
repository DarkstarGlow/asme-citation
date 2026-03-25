import { describe, expect, it } from "vitest";
import { parseIeeeHtml } from "@/lib/sources/parseIeee";

describe("parseIeeeHtml", () => {
  it("extracts metadata from ieee citation meta tags", () => {
    const html = `
      <meta name="citation_title" content="IEEE Example Paper" />
      <meta name="citation_author" content="Jane Doe" />
      <meta name="citation_publication_date" content="2023/05/01" />
      <meta name="citation_journal_title" content="IEEE Transactions on Industrial Electronics" />
      <meta name="citation_volume" content="70" />
      <meta name="citation_issue" content="5" />
      <meta name="citation_firstpage" content="4201" />
      <meta name="citation_lastpage" content="4210" />
      <meta name="citation_doi" content="10.1109/TIE.2023.1234567" />
    `;

    const result = parseIeeeHtml(
      html,
      "https://ieeexplore.ieee.org/document/1234567",
    );

    expect(result.sourceType).toBe("ieee");
    expect(result.title).toBe("IEEE Example Paper");
    expect(result.authors).toEqual(["Jane Doe"]);
    expect(result.year).toBe("2023");
    expect(result.journalOrPublisher).toBe(
      "IEEE Transactions on Industrial Electronics",
    );
    expect(result.pages).toBe("4201-4210");
    expect(result.doi).toBe("10.1109/TIE.2023.1234567");
  });

  it("falls back to og metadata when citation tags are missing", () => {
    const html = `
      <meta property="og:title" content="High capacity motors on-line diagnosis based on ultra wide band partial discharge detection" />
      <meta property="og:description" content="A noninvasive ultra-wide band diagnostic paper." />
    `;

    const result = parseIeeeHtml(
      html,
      "https://ieeexplore.ieee.org/document/1234567",
    );

    expect(result.sourceType).toBe("ieee");
    expect(result.title).toBe(
      "High capacity motors on-line diagnosis based on ultra wide band partial discharge detection",
    );
    expect(result.journalOrPublisher).toBe("IEEE");
  });

  it("extracts rich metadata from embedded ieee document metadata", () => {
    const html = `
      <script>
        xplGlobal.document.metadata={"authors":[
          {"name":"A. Carvajal","firstName":"A.","lastName":"Carvajal"},
          {"name":"V.R. Garcia-Colon","firstName":"V.R.","lastName":"Garcia-Colon"}
        ],
        "publicationYear":"2003",
        "displayPublicationTitle":"4th IEEE International Symposium on Diagnostics for Electric Machines, Power Electronics and Drives, 2003. SDEMPED 2003.",
        "title":"High capacity motors on-line diagnosis based on ultra wide band partial discharge detection",
        "doi":"10.1109/DEMPED.2003.1234567",
        "startPage":"168",
        "endPage":"170"};
      </script>
    `;

    const result = parseIeeeHtml(
      html,
      "https://ieeexplore.ieee.org/document/1234567",
    );

    expect(result.sourceType).toBe("ieee");
    expect(result.authors).toEqual(["A. Carvajal", "V.R. Garcia-Colon"]);
    expect(result.year).toBe("2003");
    expect(result.title).toBe(
      "High capacity motors on-line diagnosis based on ultra wide band partial discharge detection",
    );
    expect(result.journalOrPublisher).toContain("4th IEEE International Symposium");
    expect(result.pages).toBe("168-170");
    expect(result.doi).toBe("10.1109/DEMPED.2003.1234567");
  });
});
