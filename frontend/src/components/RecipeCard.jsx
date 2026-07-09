export default function RecipeCard({ recipe }) {
  return (
    <div className="recipe-card">
      <h3>{recipe.name}</h3>

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
  );
}
