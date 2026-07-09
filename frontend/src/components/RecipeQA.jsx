import { useState } from 'react';
import { askAboutRecipe } from '../api.js';

export default function RecipeQA({ recipe }) {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleAsk() {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);
    try {
      const { answer } = await askAboutRecipe(recipe, trimmed, history);
      setHistory((prev) => [...prev, { question: trimmed, answer }]);
      setQuestion('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="recipe-qa">
      <strong>Ask about this recipe</strong>

      {history.length > 0 && (
        <ul className="qa-thread">
          {history.map((exchange, i) => (
            <li className="qa-exchange" key={i}>
              <p className="qa-question">You asked: {exchange.question}</p>
              <p className="qa-answer">{exchange.answer}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="qa-input-row">
        <input
          value={question}
          placeholder='e.g. "Can I replace oil with butter?"'
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          disabled={loading}
        />
        <button
          type="button"
          className="secondary-button"
          onClick={handleAsk}
          disabled={loading || !question.trim()}
        >
          {loading ? 'Asking…' : 'Ask'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
    </div>
  );
}
