import type { EtsyListingData } from "../types";

export async function analyzeEtsyImage(imageDataUrl: string): Promise<EtsyListingData> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageDataUrl }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || "Server error");
  }

  return res.json();
}
