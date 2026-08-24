import { describe, expect, it } from "vitest";
import { content } from "../client/src/contexts/LanguageContext";

describe("Habesha Haven bilingual content", () => {
  it("provides English and Amharic public navigation and primary landing copy", () => {
    expect(content.nav.home.en).toBeTruthy();
    expect(content.nav.home.am).toBeTruthy();
    expect(content.home.title.en).toContain("Ethiopia");
    expect(content.home.title.am).toContain("ኢትዮጵያ");
  });
});
