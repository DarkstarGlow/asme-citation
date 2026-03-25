import { describe, expect, it } from "vitest";
import { detectSource } from "@/lib/sources/detectSource";

describe("detectSource", () => {
  it("detects arxiv urls", () => {
    expect(detectSource("https://arxiv.org/abs/1706.03762")).toBe("arxiv");
  });

  it("detects doi urls", () => {
    expect(detectSource("https://doi.org/10.1115/1.4055251")).toBe("doi");
  });

  it("detects ieee urls", () => {
    expect(detectSource("https://ieeexplore.ieee.org/document/1234567")).toBe(
      "ieee",
    );
  });

  it("detects springer urls", () => {
    expect(
      detectSource(
        "https://link.springer.com/article/10.1007/s00170-023-12345-6",
      ),
    ).toBe("springer");
  });

  it("returns unsupported for unknown urls", () => {
    expect(detectSource("https://example.com/paper")).toBe("unsupported");
  });
});
