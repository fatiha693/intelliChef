# IntelliChef

IntelliChef is a mobile-first web app that turns a fridge or pantry photo into dinner ideas in a few taps. It uses Claude Vision to detect ingredients, lets the user review and edit the detected list, applies dietary and allergy preferences, and then generates recipe suggestions with practical instructions, nutrition estimates, and follow-up recipe Q&A.

The app is designed to feel like a utility you would actually use on a phone: quick camera capture, large touch targets, concise steps, and a responsive layout that also works well on a laptop.

## What It Does

- Captures a fridge or pantry photo from a phone camera or image library.
- Detects ingredients from the image with Claude Vision.
- Lets the user edit, add, or remove ingredients before generating recipes.
- Supports dietary preferences, allergies, cuisine preferences, and serving size.
- Generates multiple recipe options with time estimates, steps, ingredient usage, and nutrition estimates.
- Adds recipe images when available and falls back to a visual icon when needed.
- Includes a recipe Q&A feature so users can ask follow-up questions about a specific recipe.

## Why This Project Is Strong For A Resume

- End-to-end AI workflow: image input, model inference, structured parsing, and UI rendering.
- Full-stack architecture with a React frontend and Express backend.
- Mobile-first UX with direct camera capture and responsive design.
- Practical product thinking: ingredient editing, dietary controls, and recipe clarification flow.
- Production-aware setup: environment-based API configuration and separate frontend/backend deployment support.

## Tech Stack

### Frontend

- React 18
- Vite
- Modern browser APIs for file upload and camera access
- CSS-based responsive layout and mobile-first UI

### Backend

- Node.js
- Express
- Anthropic SDK
- Multer for image upload handling
- CORS and environment-based configuration

### External Services

- Claude Vision / Anthropic API for ingredient detection and recipe generation
- Pexels API for recipe photos when available

## Architecture Overview

The project is split into two main parts:

- `frontend/` handles the user experience, photo capture, ingredient editing, and recipe display.
- `backend/` receives image uploads, calls the model APIs, parses structured JSON responses, and returns clean data to the frontend.
- `shared/` is reserved for any future shared helpers or constants.

### Data Flow

1. The user opens the app and takes a photo or uploads one from the library.
2. The frontend sends the image to the backend.
3. The backend forwards the image to Claude Vision and extracts ingredients.
4. The frontend displays the ingredient list for review and editing.
5. The user sets dietary preferences, allergies, cuisine, and servings.
6. The backend generates recipe suggestions.
7. The frontend renders the recipes with images, nutrition, and Q&A.

## Features

### Mobile-First Camera Flow

- Direct camera capture on supported phones.
- Library upload fallback for users who prefer selecting an existing photo.
- Preview before scanning.
- Large buttons and compact card-based layout for small screens.

### Ingredient Review

- Editable ingredient list after detection.
- Add/remove items before generating recipes.
- Helps correct imperfect AI detection before moving forward.

### Personalized Recipe Generation

- Dietary preferences such as vegan, vegetarian, gluten-free, keto, and more.
- Allergy filtering for safer recipe suggestions.
- Cuisine preference selection.
- Adjustable serving count.

### Recipe Output

- Recipe name and cuisine.
- Prep time, cook time, and total time.
- Used ingredients and additional ingredients.
- Step-by-step instructions.
- Estimated nutrition per serving.
- Recipe images when available.
- Fallback icons when no image is found.

### Recipe Q&A

- Ask follow-up questions about a specific recipe.
- Useful for substitutions, technique questions, or small adjustments.

## Repository Structure

```text
README.md
backend/
  package.json
  server.js
  anthropicClient.js
  pexelsClient.js
  routes/
    ingredients.js
    recipes.js
    recipeChat.js
  utils/
    extractJson.js
frontend/
  package.json
  vite.config.js
  vercel.json
  src/
    App.jsx
    api.js
    index.css
    main.jsx
    components/
      Allergies.jsx
      CuisinePreference.jsx
      DietaryPreferences.jsx
      ImageUpload.jsx
      IngredientList.jsx
      PortionSize.jsx
      RecipeCard.jsx
      RecipeList.jsx
      RecipeQA.jsx
      Welcome.jsx
    utils/
      recipeEmoji.js
shared/
```

## Local Development Setup

### 1. Install Dependencies

Open two terminals and run:

```bash
cd backend
npm install
```

```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Copy the example backend environment file and fill in your keys:

```bash
cd backend
copy .env.example .env
```

Set the following values in `backend/.env`:

- `ANTHROPIC_API_KEY` — required
- `ANTHROPIC_MODEL` — defaults to `claude-sonnet-5`
- `PEXELS_API_KEY` — optional, for recipe photos
- `FRONTEND_URL` — optional during local development

For the frontend, you can leave `VITE_API_BASE_URL` empty locally. If you want to set it explicitly, copy the example file:

```bash
cd frontend
copy .env.example .env
```

### 3. Start The Backend

```bash
cd backend
npm run dev
```

The backend runs on `http://localhost:3001`.

### 4. Start The Frontend

```bash
cd frontend
npm run dev
```

The frontend runs on `http://localhost:5173`.

## How To Use The App

1. Open the frontend in your browser.
2. Tap **Use camera** to take a new photo or **Upload from library** to choose an existing one.
3. Review the detected ingredients.
4. Edit the list if needed.
5. Choose dietary preferences, allergies, cuisine, and servings.
6. Generate recipes.
7. Open a recipe to review the ingredients, steps, nutrition, and Q&A.

## Environment Variables

### Backend

```env
ANTHROPIC_API_KEY=your_api_key_here
ANTHROPIC_MODEL=claude-sonnet-5
PEXELS_API_KEY=your_pexels_api_key_here
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### Frontend

```env
VITE_API_BASE_URL=
```

Leave `VITE_API_BASE_URL` blank for local development. Set it to your deployed backend URL when you are ready to go live.

## Deployment Notes

Deployment is intentionally left for later, but the codebase is already structured for it:

- Frontend can be deployed on Vercel.
- Backend can be deployed separately on Render, Railway, Fly.io, or a similar Node host.
- The frontend reads the backend URL from `VITE_API_BASE_URL`.
- The backend accepts allowed frontend origins through `FRONTEND_URL`.

## Validation

These checks have been used during development:

- Frontend production build with Vite
- Backend syntax checks with Node

## Resume Summary

If you need a short resume description, you could use:

> Built IntelliChef, a mobile-first full-stack web app that uses Claude Vision to detect fridge ingredients from a photo, supports dietary and allergy preferences, and generates personalized recipes with steps, nutrition estimates, and recipe Q&A.

## Future Improvements

- Persist user history and saved recipes.
- Add authentication and profile-based dietary preferences.
- Support multi-photo scans or pantry grouping.
- Expand recipe Q&A into a richer cooking assistant.
- Add deployment monitoring and analytics.

## License

No license has been added yet.