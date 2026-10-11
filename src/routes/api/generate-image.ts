import { createFileRoute } from "@tanstack/react-router";
import { generateImage, imageSettings, ratioToSize } from "@/lib/image-gateway.server";

export const Route = createFileRoute("/api/generate-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { prompt, stream = true, aspect_ratio } = await request.json();
        if (typeof prompt !== "string" || !prompt.trim()) {
          return Response.json({ error: "A prompt is required" }, { status: 400 });
        }
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ error: "Image service is not configured" }, { status: 500 });
        const size = ratioToSize(aspect_ratio);
        const upstream = await generateImage(
          { ...imageSettings, apiKey },
          prompt,
          stream !== false,
          size ? { size } : undefined,
        );
        return new Response(upstream.body, {
          status: upstream.status,
          headers: {
            "Content-Type": upstream.headers.get("Content-Type") ?? "application/json",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
