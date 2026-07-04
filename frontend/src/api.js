// Small wrapper around the backend call so components don't deal with
// fetch/FormData details directly.
export async function detectIngredients(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  const res = await fetch('/api/detect-ingredients', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to detect ingredients');
  }

  return res.json(); // { ingredients: string[], raw: string }
}
