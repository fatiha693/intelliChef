import { Router } from 'express';
import { anthropic, CLAUDE_MODEL } from '../anthropicClient.js';
import { extractJson } from '../utils/extractJson.js';

const router = Router();

function buildPrompt(ingredients) {
  return `Here is a list of ingredients someone currently has available:
${JSON.stringify(ingredients)}

Suggest 3-4 recipes they could realistically make.
Respond with ONLY a JSON array (no markdown, no extra text) in exactly this shape:
[
  {
    "name": "Recipe name",
    "usedIngredients": ["items from the list above that this recipe uses"],
    "additionalIngredients": ["items NOT in the list above that are still needed"],
    "steps": ["step 1", "step 2", "..."]
  }
]

Rules:
- "usedIngredients" must only contain items from the provided list (reuse their exact wording).
- "additionalIngredients" must only contain items that are NOT in the provided list.
- Keep "steps" concise: 4-8 short steps per recipe.`;
}

router.post('/', async (req, res) => {
  const { ingredients } = req.body;

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: 'Expected a non-empty "ingredients" array.' });
  }

  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      messages: [{ role: 'user', content: buildPrompt(ingredients) }],
    });

    const rawText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    res.json({ recipes: extractJson(rawText, []) });
  } catch (err) {
    console.error('Claude request failed:', err);
    res.status(502).json({ error: 'Failed to generate recipes with Claude API.' });
  }
});

export default router;
