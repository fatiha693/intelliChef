import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import ingredientsRouter from './routes/ingredients.js';
import recipesRouter from './routes/recipes.js';
import recipeChatRouter from './routes/recipeChat.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api/detect-ingredients', ingredientsRouter);
app.use('/api/generate-recipes', recipesRouter);
app.use('/api/recipe-chat', recipeChatRouter);

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
