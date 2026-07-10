# IntelliChef 🍳

An AI-powered web app that turns a photo of your fridge or pantry into ready-to-cook recipe suggestions — complete with nutrition estimates, dietary filtering, cuisine preferences, and a built-in AI chat assistant for each recipe.

## Overview

Most recipe apps require you to manually search or type in ingredients one by one. IntelliChef removes that friction entirely — snap a photo of your fridge, and Claude's multimodal vision capability identifies the food items automatically. From there, you get a fully editable ingredient list, tailored recipe suggestions based on your dietary needs and cuisine preferences, and an AI chatbox for each recipe so you can ask follow-up questions, request substitutions, or get clarification while cooking.

This project was built to explore multimodal AI integration in a full-stack web application — specifically, how to combine image understanding, structured reasoning, and conversational AI into a single, practical, user-facing tool rather than treating them as separate demos.

## Features

- **Photo-based ingredient detection** — upload any fridge/pantry photo and get an automatically generated list of detected food items
- **Editable ingredient list** — add, remove, or correct any detected item before generating recipes, since AI vision detection isn't always perfect
- **Dietary restriction filtering** — specify restrictions (e.g., vegetarian, vegan, gluten-free, dairy-free) and recipe suggestions are generated to respect them
- **Allergy-safe filtering** — flag allergens (e.g., peanuts, shellfish, dairy) as a hard constraint; recipes are generated to exclude them entirely rather than just deprioritize them
- **Cuisine selection** — choose a preferred cuisine style (e.g., Italian, Bengali, Mexican, Asian) to steer recipe generation toward a specific culinary direction
- **Nutrition and calorie estimation** — each generated recipe includes an approximate calorie count and nutritional breakdown
- **Cooking time approximation** — each recipe includes an estimated prep/cook time, so users can filter for something that fits their schedule
- **AI-generated recipe suggestions** — recipe ideas built around available ingredients, dietary restrictions, allergies, and cuisine preference simultaneously, including what additional ingredients (if any) are needed
- **Recipe photos** — each recipe is paired with a representative photo (via the Pexels API) so results are visual, not just a wall of text; falls back to a themed icon if no photo is found or no Pexels key is configured
- **Native camera capture** — on phones, ingredients can be photographed directly through the browser's camera instead of only picking an existing file
- **Per-recipe AI chatbox** — a conversational assistant scoped to each individual recipe, letting users ask questions like "can I substitute butter for oil?" or "how do I know when this is done?" without leaving the recipe view
- **Secure API key handling** — the Anthropic and Pexels API keys live only on the backend server; they're never exposed to the browser or the client-side code

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React** | Core UI library — manages component state and re-renders the interface as ingredients are detected, edited, recipes are generated, and chat conversations progress |
| **Vite** | Development server and build tool. Chosen over Create React App for its near-instant hot module reload during development and significantly faster build times |
| **Plain CSS** | Handles all styling — no CSS framework or component library, keeping the bundle size small and giving full control over the visual design |
| **Fetch API** | Used (via a small wrapper module, `api.js`) to communicate with the backend — no external HTTP client library needed for a project this size |

Key frontend components:
- `App.jsx` — top-level state management; holds the uploaded image, detected ingredients, user preferences (diet, cuisine), generated recipes, and coordinates data flow between child components
- `ImageUpload.jsx` — handles file selection/drag-and-drop, image preview, and triggers the detection request
- `IngredientList.jsx` — renders the editable ingredient list with add/remove functionality
- **Preference selectors** — dietary restriction and cuisine selection inputs that feed into the recipe generation request
- **Recipe cards** — display each generated recipe's name, ingredients used/needed, instructions, estimated calories/nutrition, and cooking time
- **Recipe chatbox** — a per-recipe conversational component that maintains its own message history and lets the user ask follow-up questions about that specific recipe

### Backend

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime for the server |
| **Express** | Minimal web framework used to define the core API routes (ingredient detection, recipe generation, and per-recipe chat) and handle incoming requests/responses |
| **Anthropic SDK (`@anthropic-ai/sdk`)** | Official Node.js SDK used to communicate with Claude's API — handles authentication, request formatting, and response parsing |
| **Multer** | Parses multipart file uploads (the fridge/pantry photo) into memory for forwarding to Claude, without writing to disk |
| **Pexels API** | Looked up per recipe name to attach a representative photo to each recipe card; optional — the app degrades gracefully to an icon if no key is set |
| **dotenv** | Loads the Anthropic/Pexels API keys from a local `.env` file into the server's environment at runtime, keeping secrets out of source code |
| **CORS handling** | Configured so the frontend (running on a different origin) can make requests to the backend without being blocked by the browser |

Key backend files:
- `server.js` — the Express app entry point; sets up middleware and mounts the API routes
- `anthropicClient.js` — a small wrapper around the Anthropic SDK client, initialized once with the API key, and reused across all routes
- `pexelsClient.js` — looks up one recipe photo per name via the Pexels API; returns `null` on any failure (missing key, no match, network error) so a Pexels outage never breaks recipe generation
- `routes/` — contains the core endpoints:
  - **Ingredient detection route** — accepts an uploaded image, encodes it, and sends it to Claude with a prompt asking it to identify visible food items, then returns a structured list
  - **Recipe generation route** — accepts the confirmed ingredient list plus dietary restrictions, allergies, cuisine preference, and serving size, and sends it to Claude with a prompt asking for tailored recipe suggestions, then returns structured recipe data (name, cuisine, prep/cook time, ingredients used, ingredients needed, allergens present, instructions, estimated nutrition) with a photo attached to each
  - **Recipe chat route** — accepts a specific recipe's context plus the user's question and conversation history, and sends it to Claude to generate a contextual, recipe-scoped response

## How Claude Was Used

Claude powers every AI capability in the app, called from the backend via the Anthropic API:

**1. Vision — Ingredient Detection**
When a user uploads a photo, the backend sends the image directly to Claude as base64-encoded image data, alongside a text prompt instructing it to identify and list all visible food items. Claude's multimodal capability — processing both images and text in a single request — means no separate computer vision model or object detection pipeline was needed.

**2. Structured Reasoning — Recipe Generation**
Once the user confirms their ingredient list and selects dietary restrictions and a cuisine preference, all of this is sent to Claude in a single prompt asking it to generate recipe suggestions that satisfy every constraint simultaneously. Claude reasons over the ingredient list, dietary rules, and cuisine style together to:
- Suggest recipes that make sense given what's available and permitted
- Distinguish between ingredients the user already has versus ones they'd need to buy
- Estimate calorie count and nutritional breakdown per recipe
- Estimate cooking time
- Generate concise, step-by-step instructions


**3. Conversational AI — Per-Recipe Chatbox**
Each recipe has its own scoped chat interface. When a user sends a message, the backend passes Claude the specific recipe's details (ingredients, instructions) alongside the conversation history and the new message, so responses stay relevant to that recipe specifically — e.g., asking "what can I use instead of heavy cream?" gets an answer grounded in the actual recipe being viewed, not a generic culinary answer. This required maintaining conversation state per recipe rather than a single global chat.

**Why detection and recipe generation are separate calls, but preferences and generation are combined:** Ingredient detection is intentionally isolated as its own step so the user has a checkpoint to correct any misread ingredients before that data is used further — an error here would otherwise silently propagate into every recipe. Dietary restrictions and cuisine preference, on the other hand, are combined into the same call as recipe generation itself, since they're constraints on the *same* generation task rather than a separate concern to isolate.

**Security consideration:** All Claude API calls happen exclusively on the backend server. The API key required to authenticate with Claude is stored in a server-side `.env` file and is never sent to or accessible from the browser — the frontend only ever communicates with the app's own backend, which then relays requests to Claude on its behalf.

## Architecture

### How it works, end to end

1. **Upload** — the user selects or drags a photo of their fridge/pantry
2. **Detection request** — the frontend sends the image to the backend, which forwards it to Claude for vision analysis
3. **Editable review** — detected ingredients are shown in an editable list
4. **Preferences** — the user sets dietary restrictions and a cuisine preference
5. **Recipe generation** — the confirmed ingredients plus preferences are sent to Claude, which returns tailored recipes with nutrition estimates and cooking times
6. **Recipe interaction** — for any recipe, the user can open its chatbox and ask follow-up questions, with Claude responding using that recipe's specific context

## Getting Started

### Prerequisites
- Node.js (v18+)
- An Anthropic API key with available credits ([console](https://console.anthropic.com))

### 1. Backend setup
```bash
cd backend
npm install
copy .env.example .env
```
Edit `.env` and set `ANTHROPIC_API_KEY` to your real key. Optionally set `PEXELS_API_KEY`
(free at [pexels.com/api](https://www.pexels.com/api/)) so recipe cards show a real photo
instead of an icon. Then:
```bash
npm run dev
```
Runs on `http://localhost:3001`

### 2. Frontend setup (in a second terminal)
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173` and proxies `/api/*` requests to the backend.

### 3. Use it
Open `http://localhost:5173`, upload a fridge/pantry photo, detect ingredients, set your dietary restrictions and cuisine preference, generate recipes, and open any recipe's chatbox to ask questions.

## Deployment (Free Tier)

The frontend and backend deploy separately, since Claude's recipe generation calls can take
15–30 seconds — longer than Vercel's free serverless function limit — while the backend
needs to run as a normal long-lived Node server.

**Backend → [Render](https://render.com), free plan**
1. New → Blueprint → connect this repo. Render picks up `render.yaml` at the repo root
   (root dir `backend`, `npm install` / `npm start`).
2. Add environment variables in the Render dashboard: `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`,
   and optionally `PEXELS_API_KEY`.
3. Deploy, then copy the resulting URL (e.g. `https://intellichef-backend.onrender.com`).

**Frontend → [Vercel](https://vercel.com), free plan**
1. New Project → import the same repo → set **Root Directory** to `frontend` (it picks up
   `frontend/vercel.json` and auto-detects Vite).
2. Add environment variable `VITE_API_BASE_URL` = the Render URL from above.
3. Deploy, then copy the resulting Vercel URL.

**Close the loop:** back in Render, set `FRONTEND_URL` to the Vercel URL so the backend's
CORS config accepts requests from it, and redeploy.

Note: Render's free tier spins the backend down after 15 minutes of inactivity, so the first
request after it's been idle takes ~30–50s to wake back up.

## Possible Extensions

- Persist saved recipes, chat history, or ingredient history per user (would require adding authentication and a database)
- Shopping list generation for missing ingredients across multiple selected recipes
- Voice input for the recipe chatbox for hands-free use while cooking

## Author

**fatiha693**

## License

This project is for educational and portfolio purposes.
