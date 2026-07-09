# IntelliChef

Upload a photo of your fridge/pantry, Claude's vision API detects the food
items, and you get an editable ingredient list before generating recipes.

## Structure

- `backend/` — Express server. Receives the uploaded image and calls the
  Claude API (this is the only place the Anthropic API key lives).
- `frontend/` — React (Vite) app. Image upload UI + editable ingredient list.
- `shared/` — Optional shared code, types, or assets used by both sides.

The front end and back end are already split into separate top-level folders,
so future changes can stay isolated and easier to commit in smaller pieces.

## Setup

1. **Backend**
   ```
   cd backend
   npm install
   copy .env.example .env
   ```
   Edit `.env` and set `ANTHROPIC_API_KEY` to your real key.
   ```
   npm run dev
   ```
   Runs on http://localhost:3001

2. **Frontend** (in a second terminal)
   ```
   cd frontend
   npm install
   npm run dev
   ```
   Runs on http://localhost:5173 and proxies `/api/*` requests to the backend.

3. Open http://localhost:5173, upload a fridge photo, and click
   "Detect Ingredients".
