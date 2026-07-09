import RecipeCard from './RecipeCard.jsx';

export default function RecipeList({ recipes }) {
  if (recipes.length === 0) {
    return <p>No recipes came back — try adjusting your ingredient list.</p>;
  }

  return (
    <div className="recipe-list">
      <h2>Recipe Ideas</h2>
      {recipes.map((recipe, i) => (
        <RecipeCard key={i} recipe={recipe} />
      ))}
    </div>
  );
}
