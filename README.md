# IntelliChef 🍳

An AI-powered web app that turns a photo of your fridge or pantry into ready-to-cook recipe suggestions — complete with nutrition estimates, dietary filtering, cuisine preferences, and a built-in AI chat assistant for each recipe.

## Overview

Most recipe apps require you to manually search or type in ingredients one by one. IntelliChef removes that friction entirely — snap a photo of your fridge, and Claude's multimodal vision capability identifies the food items automatically. From there, you get a fully editable ingredient list, tailored recipe suggestions based on your dietary needs and cuisine preferences, and an AI chatbox for each recipe so you can ask follow-up questions, request substitutions, or get clarification while cooking.

This project was built to explore multimodal AI integration in a full-stack web application — specifically, how to combine image understanding, structured reasoning, and conversational AI into a single, practical, user-facing tool rather than treating them as separate demos.

## Features

- **Photo-based ingredient detection** — upload any fridge/pantry photo and get an automatically generated list of detected food items
- **Editable ingredient list** — add, remove, or correct any detected item before generating recipes, since AI vision detection isn't always perfect
- **Dietary restriction filtering** — specify restrictions (e.g., vegetarian, vegan, gluten-free, dairy-free) and recipe suggestions are generated to respect them
- **Cuisine selection** — choose a preferred cuisine style (e.g., Italian, Bengali, Mexican, Asian) to steer recipe generation toward a specific culinary direction
- **Nutrition and calorie estimation** — each generated recipe includes an approximate calorie count and nutritional breakdown
- **Cooking time approximation** — each recipe includes an estimated prep/cook time, so users can filter for something that fits their schedule
- **AI-generated recipe suggestions** — recipe ideas built around available ingredients, dietary restrictions, and cuisine preference simultaneously, including what additional ingredients (if any) are needed
- **Per-recipe AI chatbox** — a conversational assistant scoped to each individual recipe, letting users ask questions like "can I substitute butter for oil?" or "how do I know when this is done?" without leaving the recipe view
- **Secure API key handling** — the Anthropic API key lives only on the backend server; it's never exposed to the browser or the client-side code

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
| **dotenv** | Loads the Anthropic API key from a local `.env` file into the server's environment at runtime, keeping secrets out of source code |
| **CORS handling** | Configured so the frontend (running on a different port during development) can make requests to the backend without being blocked by the browser |

Key backend files:
- `server.js` — the Express app entry point; sets up middleware and mounts the API routes
- `anthropicClient.js` — a small wrapper around the Anthropic SDK client, initialized once with the API key, and reused across all routes
- `routes/` — contains the core endpoints:
  - **Ingredient detection route** — accepts an uploaded image, encodes it, and sends it to Claude with a prompt asking it to identify visible food items, then returns a structured list
  - **Recipe generation route** — accepts the confirmed ingredient list plus dietary restrictions and cuisine preference, and sends it to Claude with a prompt asking for tailored recipe suggestions, then returns structured recipe data (name, ingredients used, ingredients needed, instructions, estimated calories/nutrition, estimated cooking time)
  - **Recipe chat route** — accepts a specific recipe's context plus the user's message and conversation history, and sends it to Claude to generate a contextual, recipe-scoped response

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

This is a good example of using an LLM for constrained generation — rather than filtering a fixed recipe database, Claude generates recipes from scratch that are shaped by multiple simultaneous constraints (ingredients on hand, dietary restriction, cuisine style) in one coherent reasoning pass.

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
Edit `.env` and set `ANTHROPIC_API_KEY` to your real key, then:
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

## Design Decisions

- **Metadata over file storage** — the app doesn't persist uploaded photos; each image is analyzed once per request and discarded
- **Editable AI output** — Claude's ingredient detection is treated as a *starting point* the user can correct, not a final answer
- **Constraint-based generation** — rather than filtering a fixed recipe database, recipes are generated fresh, shaped simultaneously by available ingredients, dietary restrictions, and cuisine preference
- **Recipe-scoped conversation state** — each recipe's chatbox maintains independent context, so follow-up questions stay grounded in the specific recipe rather than a generic cooking Q&A
- **No component library or CSS framework** — deliberately kept the frontend dependency-light, prioritizing understanding every line of styling and markup over speed of assembly

## Possible Extensions

- Persist saved recipes, chat history, or ingredient history per user (would require adding authentication and a database)
- Shopping list generation for missing ingredients across multiple selected recipes
- Mobile camera capture support for a more native "point and shoot" experience
- Voice input for the recipe chatbox for hands-free use while cooking

## Author

**fatiha693**

## License

This project is for educational and portfolio purposes.
