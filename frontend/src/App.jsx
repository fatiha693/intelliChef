import { useState } from 'react';
import Welcome from './components/Welcome.jsx';
import ImageUpload from './components/ImageUpload.jsx';
import IngredientList from './components/IngredientList.jsx';
import RecipeList from './components/RecipeList.jsx';
import { detectIngredients, generateRecipes } from './api.js';

export default function App() {
  const [started, setStarted] = useState(false);
  const [ingredients, setIngredients] = useState(null);
  const [recipes, setRecipes] = useState(null);
  const [recipesLoading, setRecipesLoading] = useState(false);
  const [recipesError, setRecipesError] = useState(null);

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
      const { recipes: generated } = await generateRecipes(ingredients);
      setRecipes(generated);
    } catch (err) {
      setRecipesError(err.message);
    } finally {
      setRecipesLoading(false);
    }
  }

  if (!started) {
    return <Welcome onStart={() => setStarted(true)} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>IntelliChef</h1>
        <button className="link-button" onClick={() => setStarted(false)}>
          ← Home
        </button>
      </header>
      <ImageUpload onDetect={handleDetect} />
      {ingredients && (
        <>
          <IngredientList ingredients={ingredients} onChange={setIngredients} />
          <button
            className="primary-button"
            onClick={handleGenerateRecipes}
            disabled={ingredients.length === 0 || recipesLoading}
          >
            {recipesLoading ? 'Generating Recipes...' : 'Generate Recipes'}
          </button>
          {recipesError && <p className="error">{recipesError}</p>}
        </>
      )}
      {recipes && <RecipeList recipes={recipes} />}
    </div>
  );
}
