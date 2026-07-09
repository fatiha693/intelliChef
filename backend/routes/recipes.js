import { Router } from 'express';
import { anthropic, CLAUDE_MODEL } from '../anthropicClient.js';
import { extractJson } from '../utils/extractJson.js';
import { fetchRecipeImage } from '../pexelsClient.js';

const router = Router();

const MIN_SERVINGS = 1;
const MAX_SERVINGS = 12;
const DEFAULT_SERVINGS = 2;

function buildPrompt(ingredients, dietaryPreferences, servings) {
  const dietaryBlock = dietaryPreferences.length > 0
    ? `\nDietary requirements the recipes MUST follow: ${dietaryPreferences.join(', ')}.
Every recipe must comply with ALL of these — do not suggest anything that violates them.
If a listed ingredient conflicts with a requirement (e.g. cheese when "vegan" is required), leave it out rather than breaking the requirement.\n`
    : '';

  return `Here is a list of ingredients someone currently has available:
${JSON.stringify(ingredients)}
${dietaryBlock}
Assume every recipe is being cooked for exactly ${servings} serving(s). Scale ingredient
quantities accordingly and write them with realistic amounts and units (e.g. "2 large eggs",
"1/2 cup milk", "200g chicken breast") rather than bare ingredient names.

Suggest 3-4 recipes they could realistically make.
Respond with ONLY a JSON array (no markdown, no extra text) in exactly this shape:
[
  {
    "name": "Recipe name",
    "usedIngredients": ["quantified items from the list above that this recipe uses, e.g. '2 eggs'"],
    "additionalIngredients": ["quantified items NOT in the list above that are still needed"],
    "steps": ["detailed step 1, including cook time/temperature where relevant", "step 2", "..."]
  }
]

Rules:
- "usedIngredients" must only reference items from the provided list (reuse their wording, prefixed with a quantity).
- "additionalIngredients" must only contain items that are NOT in the provided list.
- Quantities in both lists must reflect ${servings} serving(s).
- "steps" should be detailed enough for a home cook to follow without guessing (6-10 steps per recipe), including approximate times and temperatures where relevant.`;
}

function parseServings(rawServings) {
  const parsed = Number(rawServings);
  if (!Number.isFinite(parsed)) return DEFAULT_SERVINGS;
  return Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, Math.round(parsed)));
}

router.post('/', async (req, res) => {
  const { ingredients, preferences, servings: rawServings } = req.body;
  const dietaryPreferences = Array.isArray(preferences)
    ? preferences.filter((p) => typeof p === 'string' && p.trim().length > 0)
    : [];
  const servings = parseServings(rawServings);

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: 'Expected a non-empty "ingredients" array.' });
  }

  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 3072,
      messages: [{ role: 'user', content: buildPrompt(ingredients, dietaryPreferences, servings) }],
    });

    const rawText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    const recipes = extractJson(rawText, []);

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
    res.status(502).json({ error: 'Failed to generate recipes with Claude API.' });
  }
});

export default router;
