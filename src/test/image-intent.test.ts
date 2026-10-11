import { describe, it, expect } from "vitest";
import { isImageGenerationRequest as f } from "@/lib/ai/image-intent";

describe("image intent", () => {
  it("draws for a direct picture request", () => {
    expect(f("Generate an image of a girl planting a seed")).toBe(true);
    expect(f("draw a logo for my bakery")).toBe(true);
  });
  it("does not draw when asked to write image-to-video prompts", () => {
    expect(f("Analyze the following story and convert it into image-to-video generation prompts")).toBe(false);
    expect(f("Create image prompts for a story")).toBe(false);
  });
  it("does not draw for long pasted briefs", () => {
    expect(f("Create an image. " + "x ".repeat(400))).toBe(false);
  });
});
