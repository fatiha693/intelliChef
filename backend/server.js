import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import ingredientsRouter from './routes/ingredients.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use('/api/detect-ingredients', ingredientsRouter);

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
