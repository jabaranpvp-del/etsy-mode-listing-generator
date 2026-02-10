// api/analyze.ts

type VercelRequest = any;
type VercelResponse = any;

import { GoogleGenAI } from "@google/genai";

function dataUrlToInlineData(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data URL");
  return {
    mimeType: match[1],
    data: match[2],
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { imageDataUrl } = req.body || {};
    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      return res.status(400).json({ error: "imageDataUrl is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    const ai = new GoogleGenAI({ apiKey });
    const inlineData = dataUrlToInlineData(imageDataUrl);

    const prompt = `
Return ONLY valid JSON. No markdown. No explanations. No extra text.

Keys required:
title
description
firstMainColor
secondMainColor
homeStyle
celebration
occasion
subject
room
tags

Rules:
- tags must be a single comma-separated string of exactly 13 tags
- be concise and SEO-oriented
`;

    const resp = await ai.models.generateContent({
      model: "models/gemini-pro-vision",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            { inlineData }
          ]
        }
      ]
    });

    const raw = resp.response.text();
    const cleaned = raw
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const data = JSON.parse(cleaned);
    return res.status(200).json(data);

  } catch (err: any) {
    console.error("Analyze error:", err);
    return res.status(500).json({
      error: "Analyze failed",
      detail: String(err?.message || err),
    });
  }
}
