import { EtsyListingData } from '../types';

export async function analyzeEtsyImage(imageDataUrl: string): Promise<EtsyListingData> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      imageDataUrl, // اسم فیلد باید دقیقاً همین باشه
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API Error ${response.status}: ${text}`);
  }

  return response.json();
}
