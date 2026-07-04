import { useState } from 'react';
import ImageUpload from './components/ImageUpload.jsx';
import IngredientList from './components/IngredientList.jsx';
import { detectIngredients } from './api.js';

export default function App() {
  const [ingredients, setIngredients] = useState(null);

  async function handleDetect(file) {
    const { ingredients: detected } = await detectIngredients(file);
    setIngredients(detected);
  }

  return (
    <div className="app">
      <h1>Fridge to Recipe</h1>
      <ImageUpload onDetect={handleDetect} />
      {ingredients && (
        <>
          <IngredientList ingredients={ingredients} onChange={setIngredients} />
          {/* Recipe generation isn't built yet — this is where it will hook in. */}
          <button disabled title="Coming soon">
            Generate Recipes
          </button>
        </>
      )}
    </div>
  );
}
