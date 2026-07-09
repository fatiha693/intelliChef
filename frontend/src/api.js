// Small wrapper around the backend call so components don't deal with
// fetch/FormData details directly.
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export async function detectIngredients(imageFile) {
  const formData = new FormData();
  formData.append('image', imageFile);

  const res = await fetch(apiUrl('/api/detect-ingredients'), {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to detect ingredients');
  }

  return res.json(); // { ingredients: string[], raw: string }
}

export async function generateRecipes(
  ingredients,
  { preferences = [], allergies = [], cuisine = null, servings = 2 } = {}
) {
  const res = await fetch(apiUrl('/api/generate-recipes'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients, preferences, allergies, cuisine, servings }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to generate recipes');
  }

  return res.json(); // { recipes: Recipe[] }
}

export async function askAboutRecipe(recipe, question, history = []) {
  const res = await fetch(apiUrl('/api/recipe-chat'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipe, question, history }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to get an answer');
  }

  return res.json(); // { answer: string }
}
