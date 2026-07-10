const PEXELS_API_KEY = process.env.PEXELS_API_KEY;

if (!PEXELS_API_KEY) {
  console.warn('PEXELS_API_KEY is not set — recipe cards will render without photos.');
}

// Looks up one representative photo for a recipe name. Returns null (rather
// than throwing) on any failure so a Pexels outage never breaks recipe
// generation — the frontend just falls back to an illustrated icon.
export async function fetchRecipeImage(query) {
  if (!PEXELS_API_KEY) return null;

  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
      { headers: { Authorization: PEXELS_API_KEY } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const src = data.photos?.[0]?.src;
    // "medium" (350px wide) looks blurry once stretched to fill a full-width
    // card, so prefer the larger variants and only fall back if missing.
    return src?.large2x ?? src?.large ?? src?.medium ?? null;
  } catch (err) {
    console.error('Pexels request failed:', err);
    return null;
  }
}
