import { useState } from 'react';
import Welcome from './components/Welcome.jsx';
import ImageUpload from './components/ImageUpload.jsx';
import IngredientList from './components/IngredientList.jsx';
import DietaryPreferences from './components/DietaryPreferences.jsx';
import Allergies from './components/Allergies.jsx';
import CuisinePreference from './components/CuisinePreference.jsx';
import PortionSize from './components/PortionSize.jsx';
import RecipeList from './components/RecipeList.jsx';
import { detectIngredients, generateRecipes } from './api.js';

const DEFAULT_SERVINGS = 2;

export default function App() {
  const [started, setStarted] = useState(false);
  const [ingredients, setIngredients] = useState(null);
  const [preferences, setPreferences] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [cuisine, setCuisine] = useState(null);
  const [servings, setServings] = useState(DEFAULT_SERVINGS);
  const [recipes, setRecipes] = useState(null);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [recipesError, setRecipesError] = useState(null);
  const hasIngredients = Array.isArray(ingredients) && ingredients.length > 0;

  async function handleDetect(file) {
    const { ingredients: detected } = await detectIngredients(file);
    setIngredients(detected);
    setRecipes(null);
    setRecipesError(null);
  }

  async function handleGenerateRecipes() {
    setRecipesLoading(true);
    setRecipesError(null);
    try {
      const { recipes: generated } = await generateRecipes(ingredients, {
        preferences,
        allergies,
        cuisine,
        servings,
      });
      setRecipes(generated);
    } catch (err) {
      setRecipesError(err.message);
    } finally {
      setRecipesLoading(false);
    }
  }

  function handleGoHome() {
    setStarted(false);
    setIngredients(null);
    setPreferences([]);
    setAllergies([]);
    setCuisine(null);
    setServings(DEFAULT_SERVINGS);
    setRecipes(null);
    setRecipesError(null);
    setRecipesLoading(false);
  }

  if (!started) {
    return <Welcome onStart={() => setStarted(true)} />;
  }

  return (
    <div className="app mobile-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">IntelliChef</p>
          <h1>IntelliChef</h1>
          <p className="app-subtitle">
            Snap a fridge photo, confirm what the AI sees, and get recipes that fit your kitchen.
          </p>
        </div>
        <button className="link-button" onClick={handleGoHome}>
          Start over
        </button>
      </header>
      <ImageUpload onDetect={handleDetect} />
      {hasIngredients && (
        <div className="scan-summary" aria-label="Current scan summary">
          <span className="summary-chip">{ingredients.length} ingredients</span>
          <span className="summary-chip">{preferences.length} preferences</span>
          <span className="summary-chip">{allergies.length} allergies</span>
          <span className="summary-chip">Serves {servings}</span>
        </div>
      )}
      {hasIngredients && (
        <>
          <IngredientList ingredients={ingredients} onChange={setIngredients} />
          <DietaryPreferences selected={preferences} onChange={setPreferences} />
          <Allergies selected={allergies} onChange={setAllergies} />
          <CuisinePreference selected={cuisine} onChange={setCuisine} />
          <PortionSize servings={servings} onChange={setServings} />
          {recipesError && <p className="error">{recipesError}</p>}
        </>
      )}
      {hasIngredients && (
        <div className="action-bar">
          <button
            className="primary-button action-button"
            onClick={handleGenerateRecipes}
            disabled={ingredients.length === 0 || recipesLoading}
          >
            {recipesLoading ? 'Generating recipes...' : 'Generate recipes'}
          </button>
        </div>
      )}
      {recipes && <RecipeList recipes={recipes} />}
    </div>
  );
}
