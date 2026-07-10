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
    <div className="app workspace-shell">
      <header className="workspace-header">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            IC
          </span>
          <div>
            <p className="eyebrow">AI kitchen assistant</p>
            <h1>IntelliChef</h1>
          </div>
        </div>
        <button className="ghost-button" onClick={handleGoHome}>
          Reset
        </button>
      </header>

      <section className="workspace-banner">
        <div>
          <p className="workspace-kicker">Scan, refine, cook</p>
          <h2>Turn a single photo into a dinner plan.</h2>
          <p>
            Start with a fridge shot, clean up the ingredient list, then generate recipes that fit your pantry,
            diet, and portions.
          </p>
        </div>
        <div className="workspace-stats" aria-label="Current scan summary">
          <div className="stat-card">
            <strong>{hasIngredients ? ingredients.length : 0}</strong>
            <span>Ingredients</span>
          </div>
          <div className="stat-card">
            <strong>{preferences.length}</strong>
            <span>Preferences</span>
          </div>
          <div className="stat-card">
            <strong>{allergies.length}</strong>
            <span>Allergies</span>
          </div>
          <div className="stat-card">
            <strong>{servings}</strong>
            <span>Servings</span>
          </div>
        </div>
      </section>

      <div className="workspace-grid">
        <section className="panel panel-primary">
          <div className="panel-heading">
            <span className="panel-step">1</span>
            <div>
              <p className="panel-label">Capture</p>
              <h2>Start with a photo</h2>
            </div>
          </div>
          <ImageUpload onDetect={handleDetect} />
        </section>

        <section className="panel panel-secondary">
          <div className="panel-heading">
            <span className="panel-step">2</span>
            <div>
              <p className="panel-label">Refine</p>
              <h2>Adjust the ingredients and settings</h2>
            </div>
          </div>

          {hasIngredients ? (
            <>
              <IngredientList ingredients={ingredients} onChange={setIngredients} />
              <DietaryPreferences selected={preferences} onChange={setPreferences} />
              <Allergies selected={allergies} onChange={setAllergies} />
              <CuisinePreference selected={cuisine} onChange={setCuisine} />
              <PortionSize servings={servings} onChange={setServings} />
            </>
          ) : (
            <div className="empty-state">
              <p className="empty-title">Nothing scanned yet.</p>
              <p>Use the photo step to detect ingredients before customizing your meal.</p>
            </div>
          )}
        </section>

        <section className="panel panel-secondary">
          <div className="panel-heading">
            <span className="panel-step">3</span>
            <div>
              <p className="panel-label">Generate</p>
              <h2>Get recipes</h2>
            </div>
          </div>

          {hasIngredients ? (
            <>
              {recipesError && <p className="error">{recipesError}</p>}
              <div className="action-bar action-bar-inline">
                <button
                  className="primary-button action-button"
                  onClick={handleGenerateRecipes}
                  disabled={ingredients.length === 0 || recipesLoading}
                >
                  {recipesLoading ? 'Generating recipes...' : 'Generate recipes'}
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p className="empty-title">Ready when you are.</p>
              <p>Once ingredients are detected, this section will unlock recipe generation.</p>
            </div>
          )}
        </section>
      </div>

      {recipes && <RecipeList recipes={recipes} />}
    </div>
  );
}
