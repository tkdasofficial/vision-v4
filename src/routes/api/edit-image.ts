import { createFileRoute } from "@tanstack/react-router";
import { editImage, imageSettings, ratioToSize } from "@/lib/image-gateway.server";

export const Route = createFileRoute("/api/edit-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return Response.json({ error: "Image service is not configured" }, { status: 500 });
        const form = await request.formData();
        const size = ratioToSize(form.get("aspect_ratio")?.toString());
        form.delete("aspect_ratio");
        if (size) form.set("size", size);
        const upstream = await editImage({ ...imageSettings, apiKey }, form);
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
