import { recipeEmoji } from '../utils/recipeEmoji.js';

export default function RecipeCard({ recipe }) {
  return (
    <div className="recipe-card">
      <div className="recipe-image">
        {recipe.imageUrl ? (
          <img src={recipe.imageUrl} alt={recipe.name} loading="lazy" />
        ) : (
          <span className="recipe-image-fallback" aria-hidden="true">
            {recipeEmoji(recipe.name)}
          </span>
        )}
      </div>

      <div className="recipe-card-body">
        <h3>{recipe.name}</h3>
        {recipe.servings && <p className="recipe-servings">Serves {recipe.servings}</p>}

        <div className="recipe-section">
          <strong>Uses:</strong>
          <ul>
            {recipe.usedIngredients?.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        {recipe.additionalIngredients?.length > 0 && (
          <div className="recipe-section">
            <strong>You'll also need:</strong>
            <ul>
              {recipe.additionalIngredients.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="recipe-section">
          <strong>Steps:</strong>
          <ol>
            {recipe.steps?.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
