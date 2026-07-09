import { recipeEmoji } from '../utils/recipeEmoji.js';

const NUTRITION_FIELDS = [
  { key: 'calories', label: 'Calories', unit: '' },
  { key: 'proteinGrams', label: 'Protein', unit: 'g' },
  { key: 'carbsGrams', label: 'Carbs', unit: 'g' },
  { key: 'fatGrams', label: 'Fat', unit: 'g' },
  { key: 'fiberGrams', label: 'Fiber', unit: 'g' },
];

export default function RecipeCard({ recipe }) {
  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

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
        <div className="recipe-card-header">
          <h3>{recipe.name}</h3>
          {recipe.cuisine && <span className="cuisine-badge">{recipe.cuisine}</span>}
        </div>
        {recipe.servings && <p className="recipe-servings">Serves {recipe.servings}</p>}

        {(recipe.prepTimeMinutes || recipe.cookTimeMinutes) && (
          <div className="recipe-meta">
            {recipe.prepTimeMinutes != null && (
              <span className="meta-badge">⏱️ Prep {recipe.prepTimeMinutes} min</span>
            )}
            {recipe.cookTimeMinutes != null && (
              <span className="meta-badge">🔥 Cook {recipe.cookTimeMinutes} min</span>
            )}
            {totalTime > 0 && <span className="meta-badge">⏳ Total {totalTime} min</span>}
          </div>
        )}

        {recipe.allergens?.length > 0 && (
          <p className="allergen-warning">⚠ Contains: {recipe.allergens.join(', ')}</p>
        )}

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

        {recipe.nutrition && (
          <div className="recipe-section nutrition-section">
            <strong>
              Nutrition <span className="optional-tag">(estimated per serving)</span>
            </strong>
            <div className="nutrition-grid">
              {NUTRITION_FIELDS.map(({ key, label, unit }) =>
                recipe.nutrition[key] != null ? (
                  <div className="nutrition-tile" key={key}>
                    <span className="nutrition-value">
                      {recipe.nutrition[key]}
                      {unit}
                    </span>
                    <span className="nutrition-label">{label}</span>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
