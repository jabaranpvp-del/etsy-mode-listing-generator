// api/analyze.ts

type VercelRequest = any;
type VercelResponse = any;

import OpenAI from "openai";

function splitDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data URL");
  return { mimeType: match[1], base64: match[2] };
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

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
    }

    const { mimeType, base64 } = splitDataUrl(imageDataUrl);

    const client = new OpenAI({ apiKey });

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

    // Use a vision-capable model. If this model name errors in your account,
    // check your OpenAI dashboard for the recommended vision model and swap it here.
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

    const text = response.output_text?.trim() || "";

    // Sometimes models wrap JSON in fences; strip defensively.
    const cleaned = text
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
