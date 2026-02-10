import { GoogleGenAI } from "@google/genai";

function dataUrlToInlineData(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data URL");
  return { mimeType: match[1], data: match[2] };
}

// Vercel Node Function entry
export default {
  async fetch(request: Request) {
    try {
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
      }

      const body = await request.json().catch(() => ({}));
      const imageDataUrl = body?.imageDataUrl;

      if (!imageDataUrl || typeof imageDataUrl !== "string") {
        return Response.json({ error: "imageDataUrl is required" }, { status: 400 });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return Response.json({ error: "Missing GEMINI_API_KEY on server" }, { status: 500 });
      }

      const ai = new GoogleGenAI({ apiKey });

      const inlineData = dataUrlToInlineData(imageDataUrl);

      // ساده و بیسیک: فقط JSON برگردون
      const prompt = `
Return ONLY valid JSON (no markdown, no extra text) with these keys:
title, description, firstMainColor, secondMainColor, homeStyle, celebration, occasion, subject, room, tags.
- tags must be a single comma-separated string of 13 tags.
`;

      const resp = await ai.models.generateContent({
        // اگر این مدل در اکانتت در دسترس نبود، بعداً سریع عوضش می‌کنیم.
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }, { inlineData }],
          },
        ],
      });

      const text = (resp as any).text?.trim?.() ?? "";
      const cleaned = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

      const data = JSON.parse(cleaned);

      return Response.json(data, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (err: any) {
      return Response.json(
        { error: "Analyze failed", detail: String(err?.message || err) },
        { status: 500 }
      );
    }
  },
};
