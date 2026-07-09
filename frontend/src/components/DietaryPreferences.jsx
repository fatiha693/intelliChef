const OPTIONS = [
  'Vegan',
  'Vegetarian',
  'Gluten-Free',
  'Keto',
  'Dairy-Free',
  'Paleo',
  'Nut-Free',
  'Low-Carb',
];

export default function DietaryPreferences({ selected, onChange }) {
  function toggle(option) {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  return (
    <div className="dietary-preferences">
      <h2>
        Dietary Preferences <span className="optional-tag">(optional)</span>
      </h2>
      <div className="preference-chips">
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            className={`preference-chip ${selected.includes(option) ? 'active' : ''}`}
            aria-pressed={selected.includes(option)}
            onClick={() => toggle(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
