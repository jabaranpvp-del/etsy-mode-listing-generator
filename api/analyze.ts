import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI } from "@google/genai";

function dataUrlToInlineData(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data URL");
  return { mimeType: match[1], data: match[2] };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { imageDataUrl } = (req.body || {}) as { imageDataUrl?: string };
    if (!imageDataUrl) return res.status(400).json({ error: "imageDataUrl is required" });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });

    const ai = new GoogleGenAI({ apiKey });
    const inlineData = dataUrlToInlineData(imageDataUrl);

    const prompt = `
Return ONLY valid JSON (no markdown, no extra text) with these keys:
title, description, firstMainColor, secondMainColor, homeStyle, celebration, occasion, subject, room, tags.
tags must be a single comma-separated string of 13 tags.
`;

    const resp = await ai.models.generateContent({
      model: "gemini-pro-vision",
      generationConfig: { responseMimeType: "application/json" },
      contents: [{ role: "user", parts: [{ text: prompt }, { inlineData }] }],
    });

    // Compatible text extraction across SDK shapes
    const text =
      (resp as any).text ??
      (typeof (resp as any).text === "function" ? (resp as any).text() : "") ??
      (typeof (resp as any).response?.text === "function" ? (resp as any).response.text() : "");

    const cleaned = String(text).trim();
    const data = JSON.parse(cleaned);

    return res.status(200).json(data);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Analyze failed", detail: String(err?.message || err) });
  }
}
