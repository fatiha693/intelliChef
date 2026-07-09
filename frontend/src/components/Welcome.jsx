import { useEffect, useState } from 'react';

const TAGLINES = [
  'Snap a photo. Get dinner ideas.',
  'Built for one-thumb cooking.',
  'Turn leftovers into a plan.',
];

const STEPS = [
  {
    icon: '📸',
    title: 'Snap',
    description: 'Take a quick fridge or pantry photo.',
  },
  {
    icon: '✅',
    title: 'Confirm',
    description: 'Edit the ingredient list if anything is off.',
  },
  {
    icon: '🍽️',
    title: 'Cook',
    description: 'Get recipes that fit what you already have.',
  },
];

const DEMO_CHIPS = ['eggs', 'spinach', 'cheddar', 'milk', 'tomato'];

export default function Welcome({ onStart }) {
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [visibleChips, setVisibleChips] = useState(0);

  // Cycle the hero subtitle through a few phrases so the page feels alive.
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((i) => (i + 1) % TAGLINES.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  // Pops the demo ingredient chips in one at a time, then loops, to mimic
  // what the real detection flow feels like without calling the API here.
  useEffect(() => {
    if (visibleChips >= DEMO_CHIPS.length) {
      const resetTimer = setTimeout(() => setVisibleChips(0), 2200);
      return () => clearTimeout(resetTimer);
    }
    const timer = setTimeout(() => setVisibleChips((n) => n + 1), 500);
    return () => clearTimeout(timer);
  }, [visibleChips]);

  return (
    <div className="welcome">
      <section className="welcome-hero">
        <div className="floating-icons" aria-hidden="true">
          <span className="float-icon icon-1">🥕</span>
          <span className="float-icon icon-2">🧀</span>
          <span className="float-icon icon-3">🍅</span>
          <span className="float-icon icon-4">🥑</span>
          <span className="float-icon icon-5">🥦</span>
          <span className="float-icon icon-6">🍳</span>
        </div>

        <div className="welcome-content">
          <span className="welcome-badge">IntelliChef</span>
          <h1 className="welcome-title">IntelliChef</h1>
          <p className="welcome-tagline" key={taglineIndex}>
            {TAGLINES[taglineIndex]}
          </p>
          <button className="cta-button" onClick={onStart}>
            Get Started →
          </button>
        </div>

        <div className="scan-demo" aria-hidden="true">
          <div className="scan-demo-frame">
            <span className="scan-demo-emoji">🧊</span>
            <div className="scan-line" />
          </div>
          <div className="scan-chips">
            {DEMO_CHIPS.map((chip, i) => (
              <span key={chip} className={`scan-chip ${i < visibleChips ? 'visible' : ''}`}>
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How it works</h2>
        <div className="steps">
          {STEPS.map((step, i) => (
            <div className="step-card" key={step.title}>
              <span className="step-number">{i + 1}</span>
              <span className="step-icon" aria-hidden="true">
                {step.icon}
              </span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
