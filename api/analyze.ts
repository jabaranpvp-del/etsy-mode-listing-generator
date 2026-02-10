// api/analyze.ts
import OpenAI from "openai";

type VercelRequest = any;
type VercelResponse = any;

function splitDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data URL");
  return { mimeType: match[1], base64: match[2] };
}

function safeJsonParse(text: string) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`Model returned non-JSON output: ${cleaned.slice(0, 400)}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY on server." });
    }

    const body = req.body || {};
    const imageDataUrl =
      body.imageDataUrl || body.image || body.imageData || body.dataUrl || body.base64;

    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      return res.status(400).json({
        error: "imageDataUrl is required",
        gotKeys: Object.keys(body || {}),
      });
    }

    const { mimeType, base64 } = splitDataUrl(imageDataUrl);

    const client = new OpenAI({ apiKey });

    const prompt = `
Return ONLY valid JSON. No markdown. No extra text.

Required keys:
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
- tags must be a single comma-separated string of exactly 13 tags.
- Keep output concise and SEO-oriented.
`;

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            {
              type: "input_image",
              image_url: `data:${mimeType};base64,${base64}`,
            },
          ],
        },
      ],
    });

    const text = (response.output_text || "").trim();
    if (!text) {
      return res.status(500).json({ error: "Empty response from model." });
    }

    const data = safeJsonParse(text);

    // Minimal validation
    const required = [
      "title",
      "description",
      "firstMainColor",
      "secondMainColor",
      "homeStyle",
      "celebration",
      "occasion",
      "subject",
      "room",
      "tags",
    ];
    const missing = required.filter((k) => !(k in data));
    if (missing.length > 0) {
      return res.status(500).json({
        error: "Model JSON missing required keys",
        missing,
        rawPreview: text.slice(0, 300),
      });
    }

    return res.status(200).json(data);
  } catch (err: any) {
    console.error("Analyze error:", err);

    // Helpful error payload
    return res.status(500).json({
      error: "Analyze failed",
      detail: String(err?.message || err),
    });
  }
}
