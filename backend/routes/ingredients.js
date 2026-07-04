import { Router } from 'express';
import multer from 'multer';
import { anthropic, CLAUDE_MODEL } from '../anthropicClient.js';

const router = Router();

// Keep uploaded images in memory (not written to disk) since we only
// need them briefly to forward as base64 to Claude.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

const PROMPT = `You are looking at a photo of the inside of a fridge or pantry.
List every distinct food item or ingredient you can identify.
Respond with ONLY a JSON array of strings (no markdown, no extra text), e.g.:
["eggs", "milk", "cheddar cheese", "spinach"]`;

router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded (expected field name "image").' });
  }

  try {
    const base64Image = req.file.buffer.toString('base64');

    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: req.file.mimetype,
                data: base64Image,
              },
            },
            { type: 'text', text: PROMPT },
          ],
        },
      ],
    });

    const rawText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    res.json({ ingredients: parseIngredientsFromText(rawText), raw: rawText });
  } catch (err) {
    console.error('Claude request failed:', err);
    res.status(502).json({ error: 'Failed to analyze image with Claude API.' });
  }
});

// Claude usually returns clean JSON, but this pulls the array out even if
// it's wrapped in extra prose, so a slightly off-format reply doesn't 500.
function parseIngredientsFromText(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        // fall through to empty list below
      }
    }
    return [];
  }
}

export default router;
