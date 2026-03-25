import { describe, expect, it } from "vitest";
import { getUserFacingError } from "@/lib/citation/getUserFacingError";

describe("getUserFacingError", () => {
  it("formats unsupported source errors into product language", () => {
    const result = getUserFacingError({
      ok: false,
      sourceType: "unsupported",
      reason: "unsupported_source",
      message: "raw backend message",
    });

    expect(result.title).toBe("This link is not supported yet");
    expect(result.detail).toContain("DOI, arXiv, IEEE, or Springer");
  });

  it("formats incomplete metadata errors with a recovery path", () => {
    const result = getUserFacingError({
      ok: false,
      sourceType: "ieee",
      reason: "incomplete_metadata",
      message: "raw backend message",
    });

    expect(result.title).toBe("Not enough citation details were found");
    expect(result.detail).toContain("reliable ASME citation");
    expect(result.tip).toContain("DOI");
  });

  it("formats parse failures as temporary access problems", () => {
    const result = getUserFacingError({
      ok: false,
      sourceType: "springer",
      reason: "parse_failed",
      message: "raw backend message",
    });

    expect(result.title).toBe("We could not read that page");
    expect(result.detail).toContain("site blocked access");
  });
});
