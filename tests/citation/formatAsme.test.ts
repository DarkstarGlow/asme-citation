import { describe, expect, it } from "vitest";
import { formatAsme } from "@/lib/citation/formatAsme";

describe("formatAsme", () => {
  it("formats a citation from normalized metadata", () => {
    const result = formatAsme({
      sourceType: "arxiv",
      title: "Attention Is All You Need",
      authors: ["Ashish Vaswani", "Noam Shazeer"],
      year: "2017",
      journalOrPublisher: "arXiv",
      doi: "10.48550/arXiv.1706.03762",
      url: "https://arxiv.org/abs/1706.03762",
      accessedDate: "2026-03-25",
    });

    expect(result).toContain("Attention Is All You Need");
    expect(result).toContain("2017");
    expect(result).toContain("arXiv");
    expect(result).toContain("10.48550/arXiv.1706.03762");
  });
});
