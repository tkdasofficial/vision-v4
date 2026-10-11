import { describe, it, expect } from "vitest";
import { normalizeChatTitle, CHAT_TITLE_MAX } from "@/lib/chat-title";

describe("chat title limit", () => {
  it("caps names at 50 characters", () => {
    expect(CHAT_TITLE_MAX).toBe(50);
    expect(normalizeChatTitle("a".repeat(80))).toHaveLength(50);
  });
  it("keeps a 50-character name intact", () => {
    expect(normalizeChatTitle("b".repeat(50))).toBe("b".repeat(50));
  });
  it("trims whitespace", () => {
    expect(normalizeChatTitle("  Hello   world  ")).toBe("Hello world");
  });
});
