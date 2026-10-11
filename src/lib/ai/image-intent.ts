// Decides whether a chat message is asking the app to actually draw a picture,
// versus asking for text ABOUT images (e.g. "write image-to-video prompts").
const VERB = /\b(generate|create|make|draw|design|paint|render|sketch|illustrate)\b/i;
const NOUN = /\b(image|picture|photo|illustration|graphic|visual|thumbnail|art(work)?|logo|icon|banner|poster|flyer|infographic|meme|wallpaper)s?\b/i;
// Asking for written output, not a picture.
const TEXT_OUTPUT = /\b(prompts?|script|story(board)?|scene list|description|caption|text|outline|steps|json|code|analy[sz]e|explain|list)\b/i;

export function isImageGenerationRequest(text: string): boolean {
  const t = text.trim();
  if (!t || t.length > 300) return false; // long briefs are text tasks
  if (TEXT_OUTPUT.test(t)) return false;
  // verb must be followed closely by an image noun ("draw a cat logo", "make an image of…")
  const m = VERB.exec(t);
  if (!m) return false;
  const after = t.slice(m.index).split(/\s+/).slice(0, 8).join(" ");
  return NOUN.test(after);
}
