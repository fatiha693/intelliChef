import { useState } from 'react';

export default function IngredientList({ ingredients, onChange }) {
  const [newItem, setNewItem] = useState('');

  function updateItem(index, value) {
    const next = [...ingredients];
    next[index] = value;
    onChange(next);
  }

  function removeItem(index) {
    onChange(ingredients.filter((_, i) => i !== index));
  }

  function addItem() {
    if (!newItem.trim()) return;
    onChange([...ingredients, newItem.trim()]);
    setNewItem('');
  }

  return (
    <div className="ingredient-list">
      <h2>Detected Ingredients</h2>
      <ul>
        {ingredients.map((item, i) => (
          <li key={i}>
            <input value={item} onChange={(e) => updateItem(i, e.target.value)} />
            <button className="secondary-button" onClick={() => removeItem(i)}>
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="add-item">
        <input
          value={newItem}
          placeholder="Add ingredient"
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <button className="primary-button" onClick={addItem}>
          Add
        </button>
      </div>
    </div>
  );
}
