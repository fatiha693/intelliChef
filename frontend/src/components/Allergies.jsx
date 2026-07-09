const ALLERGENS = [
  'Peanuts',
  'Tree Nuts',
  'Dairy',
  'Eggs',
  'Gluten',
  'Soy',
  'Shellfish',
  'Fish',
  'Sesame',
];

export default function Allergies({ selected, onChange }) {
  function toggle(option) {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  }

  return (
    <div className="allergies">
      <h2>
        Allergies <span className="optional-tag">(optional — recipes will avoid these entirely)</span>
      </h2>
      <div className="preference-chips">
        {ALLERGENS.map((option) => (
          <button
            key={option}
            type="button"
            className={`preference-chip allergy-chip ${selected.includes(option) ? 'active' : ''}`}
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
