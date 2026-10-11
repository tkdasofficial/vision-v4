/** Maximum length of a chat name. */
export const CHAT_TITLE_MAX = 50;

/** Trims whitespace, collapses spaces and caps a chat name at CHAT_TITLE_MAX characters. */
export function normalizeChatTitle(value: string): string {
  return Array.from(value.replace(/\s+/g, " ").trim()).slice(0, CHAT_TITLE_MAX).join("").trim();
}
