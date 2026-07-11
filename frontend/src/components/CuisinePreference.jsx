const CUISINES = [
  'Italian',
  'Mexican',
  'Indian',
  'Bangladeshi',
  'Chinese',
  'Japanese',
  'Thai',
  'Mediterranean',
  'American',
  'French',
  'Middle Eastern',
];

export default function CuisinePreference({ selected, onChange }) {
  function toggle(option) {
    onChange(selected === option ? null : option);
  }

  return (
    <div className="cuisine-preference">
      <h2>
        Cuisine <span className="optional-tag">(optional)</span>
      </h2>
      <div className="preference-chips">
        {CUISINES.map((option) => (
          <button
            key={option}
            type="button"
            className={`preference-chip ${selected === option ? 'active' : ''}`}
            aria-pressed={selected === option}
            onClick={() => toggle(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
