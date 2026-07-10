import { Router } from 'express';
import { anthropic, CLAUDE_MODEL } from '../anthropicClient.js';
import { extractJson } from '../utils/extractJson.js';
import { fetchRecipeImage } from '../pexelsClient.js';

const router = Router();

const MIN_SERVINGS = 1;
const MAX_SERVINGS = 10;
const DEFAULT_SERVINGS = 2;

function sanitizeStringArray(value) {
  return Array.isArray(value) ? value.filter((v) => typeof v === 'string' && v.trim().length > 0) : [];
}

function parseServings(rawServings) {
  const parsed = Number(rawServings);
  if (!Number.isFinite(parsed)) return DEFAULT_SERVINGS;
  return Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, Math.round(parsed)));
}

function getClaudeErrorMessage(err, fallbackMessage) {
  if (typeof err?.message === 'string' && err.message.trim().length > 0) {
    return err.message;
  }

  if (typeof err?.error?.message === 'string' && err.error.message.trim().length > 0) {
    return err.error.message;
  }

  return fallbackMessage;
}

function buildPrompt(ingredients, dietaryPreferences, allergies, cuisine, servings) {
  const dietaryBlock = dietaryPreferences.length > 0
    ? `\nDietary requirements the recipes MUST follow: ${dietaryPreferences.join(', ')}.
Every recipe must comply with ALL of these — do not suggest anything that violates them.
If a listed ingredient conflicts with a requirement (e.g. cheese when "vegan" is required), leave it out rather than breaking the requirement.`
    : '';

  const allergyBlock = allergies.length > 0
    ? `\nSTRICT ALLERGY SAFETY (non-negotiable): the recipes MUST NOT contain any of the following
allergens, in any form or hidden derivative: ${allergies.join(', ')}. This is a safety constraint,
not a preference — never include these under any circumstances, even if it means leaving out
one of the available ingredients.`
    : '';

  const cuisineBlock = cuisine
    ? `\nPreferred cuisine style: ${cuisine}. Lean the recipes toward this cuisine where realistic
given the available ingredients.`
    : '';

  return `Here is a list of ingredients someone currently has available:
${JSON.stringify(ingredients)}
${dietaryBlock}${allergyBlock}${cuisineBlock}

Assume every recipe is being cooked for exactly ${servings} serving(s). Scale ingredient
quantities accordingly and write them with realistic amounts and units (e.g. "2 large eggs",
"1/2 cup milk", "200g chicken breast") rather than bare ingredient names.

Suggest 3-4 recipes they could realistically make.
Respond with ONLY a JSON array — no markdown, no commentary before or after it — in exactly
this shape:
[
  {
    "name": "Recipe name",
    "cuisine": "Best-fitting cuisine style for this specific recipe, e.g. Italian, Mexican",
    "prepTimeMinutes": 10,
    "cookTimeMinutes": 20,
    "usedIngredients": ["quantified items from the list above that this recipe uses, e.g. '2 eggs'"],
    "additionalIngredients": ["quantified items NOT in the list above that are still needed"],
    "allergens": ["allergens actually present in this recipe, e.g. Dairy, Gluten — [] if none"],
    "steps": ["detailed step 1, including cook time/temperature where relevant", "step 2", "..."],
    "nutrition": {
      "calories": 420,
      "proteinGrams": 28,
      "carbsGrams": 35,
      "fatGrams": 18,
      "fiberGrams": 4
    }
  }
]

Rules:
- "usedIngredients" must only reference items from the provided list (reuse their wording, prefixed with a quantity).
- "additionalIngredients" must only contain items that are NOT in the provided list.
- Quantities in both lists must reflect ${servings} serving(s).
- "steps" should be detailed enough for a home cook to follow without guessing (6-10 steps per recipe), including approximate times and temperatures where relevant.
- "prepTimeMinutes" and "cookTimeMinutes" must be realistic integers in minutes.
- "nutrition" values are per serving, realistic best-effort integer estimates.
- "allergens" must accurately reflect what's actually in the recipe, independent of any allergy list above.
- Output ONLY the JSON array described above — no explanation, no markdown fences, nothing outside the array.`;
}

async function requestRecipesFromClaude(prompt) {
  const message = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  return message.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');
}

async function repairRecipeJson(rawText) {
  const repairPrompt = `Convert the following text into ONLY a valid JSON array of recipe objects matching this shape:
[
  {
    "name": "Recipe name",
    "cuisine": "Cuisine",
    "prepTimeMinutes": 10,
    "cookTimeMinutes": 20,
    "usedIngredients": ["item"],
    "additionalIngredients": ["item"],
    "allergens": ["Dairy"],
    "steps": ["step 1", "step 2"],
    "nutrition": {
      "calories": 420,
      "proteinGrams": 28,
      "carbsGrams": 35,
      "fatGrams": 18,
      "fiberGrams": 4
    }
  }
]

Return JSON only. No markdown. No explanation.

Text to repair:
${rawText}`;

  return requestRecipesFromClaude(repairPrompt);
}

router.post('/', async (req, res) => {
  const { ingredients, preferences, allergies, cuisine, servings: rawServings } = req.body;
  const dietaryPreferences = sanitizeStringArray(preferences);
  const strictAllergies = sanitizeStringArray(allergies);
  const cuisinePreference = typeof cuisine === 'string' && cuisine.trim().length > 0 ? cuisine.trim() : null;
  const servings = parseServings(rawServings);

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: 'Expected a non-empty "ingredients" array.' });
  }

  try {
    const rawText = await requestRecipesFromClaude(
      buildPrompt(ingredients, dietaryPreferences, strictAllergies, cuisinePreference, servings)
    );

    const recipes = extractJson(rawText, null);

    // A malformed/truncated response used to silently become an empty list,
    // which read to users as "no recipes" instead of "something went wrong."
    // Surface it as a retryable error instead.
    if (!Array.isArray(recipes) || recipes.length === 0) {
      const repairedText = await repairRecipeJson(rawText.slice(0, 5000));
      const repairedRecipes = extractJson(repairedText, null);

      if (!Array.isArray(repairedRecipes) || repairedRecipes.length === 0) {
        console.error('Could not parse a recipe list from Claude response:', rawText.slice(0, 800));
        console.error('Repair attempt also failed:', repairedText.slice(0, 800));
        return res.status(502).json({ error: 'Claude returned an unexpected response — please try again.' });
      }

      const repairedRecipesWithImages = await Promise.all(
        repairedRecipes.map(async (recipe) => ({
          ...recipe,
          servings,
          imageUrl: recipe?.name ? await fetchRecipeImage(`${recipe.name} food`) : null,
        }))
      );

      return res.json({ recipes: repairedRecipesWithImages });
    }

    const recipesWithImages = await Promise.all(
      recipes.map(async (recipe) => ({
        ...recipe,
        servings,
        imageUrl: recipe?.name ? await fetchRecipeImage(`${recipe.name} food`) : null,
      }))
    );

    res.json({ recipes: recipesWithImages });
  } catch (err) {
    console.error('Claude request failed:', err);
    res.status(502).json({
      error: getClaudeErrorMessage(err, 'Failed to generate recipes with Claude API.'),
    });
  }
});

export default router;
