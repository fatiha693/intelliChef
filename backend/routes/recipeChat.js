import { Router } from 'express';
import { anthropic, CLAUDE_MODEL } from '../anthropicClient.js';

const router = Router();

const MAX_HISTORY = 5;

function getClaudeErrorMessage(err, fallbackMessage) {
  if (typeof err?.message === 'string' && err.message.trim().length > 0) {
    return err.message;
  }

  if (typeof err?.error?.message === 'string' && err.error.message.trim().length > 0) {
    return err.error.message;
  }

  return fallbackMessage;
}

function buildPrompt(recipe, question, history) {
  const recipeContext = `Recipe: ${recipe.name || 'Untitled recipe'}
Cuisine: ${recipe.cuisine || 'n/a'}
Servings: ${recipe.servings || 'n/a'}
Ingredients used: ${(recipe.usedIngredients || []).join(', ') || 'n/a'}
Additional ingredients needed: ${(recipe.additionalIngredients || []).join(', ') || 'none'}
Steps:
${(recipe.steps || []).map((step, i) => `${i + 1}. ${step}`).join('\n') || 'n/a'}`;

  const historyBlock = history.length > 0
    ? `\nEarlier questions about this recipe in this conversation:\n${history
        .map((h) => `Q: ${h.question}\nA: ${h.answer}`)
        .join('\n\n')}\n`
    : '';

  return `You are a helpful cooking assistant answering a question about one specific recipe.
${recipeContext}
${historyBlock}
The user's new question: "${question}"

Answer concisely and practically in 2-5 sentences, plain text only (no markdown). If the question
is about substituting or modifying an ingredient or step, say clearly whether it works, any
adjustments needed (amounts, technique, timing), and how it might change the result. If the
question isn't really about this recipe, answer briefly anyway if you reasonably can, or say so.`;
}

router.post('/', async (req, res) => {
  const { recipe, question, history } = req.body;

  if (!recipe || typeof recipe !== 'object') {
    return res.status(400).json({ error: 'Expected a "recipe" object.' });
  }
  if (typeof question !== 'string' || question.trim().length === 0) {
    return res.status(400).json({ error: 'Expected a non-empty "question" string.' });
  }

  const safeHistory = Array.isArray(history)
    ? history
        .filter((h) => h && typeof h.question === 'string' && typeof h.answer === 'string')
        .slice(-MAX_HISTORY)
    : [];

  try {
    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 512,
      messages: [{ role: 'user', content: buildPrompt(recipe, question.trim(), safeHistory) }],
    });

    const answer = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')
      .trim();

    res.json({ answer });
  } catch (err) {
    console.error('Claude request failed:', err);
    res.status(502).json({ error: getClaudeErrorMessage(err, 'Failed to get an answer from Claude.') });
  }
});

export default router;
