import { describe, expect, it } from "vitest";
import { extractMeta, extractMetaAll } from "@/lib/utils/extractMeta";

describe("extractMeta", () => {
  it("decodes html entities in single meta values", () => {
    const html = `<meta name="citation_title" content="R&#228;dke Paper" />`;

    expect(extractMeta(html, "citation_title")).toBe("Rädke Paper");
  });

  it("decodes html entities in repeated meta values", () => {
    const html = `
      <meta name="citation_author" content="R&#228;dke, Anika" />
      <meta name="citation_author" content="Schmitz-H&#252;bsch, Tanja" />
    `;

    expect(extractMetaAll(html, "citation_author")).toEqual([
      "Rädke, Anika",
      "Schmitz-Hübsch, Tanja",
    ]);
  });
});
