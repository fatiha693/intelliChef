const MIN_SERVINGS = 1;
const MAX_SERVINGS = 10;

export default function PortionSize({ servings, onChange }) {
  function adjust(delta) {
    onChange(Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, servings + delta)));
  }

  return (
    <div className="portion-size">
      <h2>Servings</h2>
      <div className="portion-stepper">
        <button
          type="button"
          className="secondary-button"
          onClick={() => adjust(-1)}
          disabled={servings <= MIN_SERVINGS}
          aria-label="Decrease servings"
        >
          −
        </button>
        <span className="portion-value">{servings}</span>
        <button
          type="button"
          className="secondary-button"
          onClick={() => adjust(1)}
          disabled={servings >= MAX_SERVINGS}
          aria-label="Increase servings"
        >
          +
        </button>
      </div>
    </div>
  );
}
