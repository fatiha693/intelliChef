export default function Welcome({ onStart }) {
  return (
    <div className="welcome welcome-refresh">
      <section className="welcome-hero welcome-hero-new">
        <div className="welcome-copy">
          <span className="welcome-badge">AI kitchen assistant</span>
          <h1 className="welcome-title">IntelliChef</h1>
          <p className="welcome-tagline">
            A cleaner way to turn fridge photos into meals, with ingredient review, diet filters, and recipe Q&A.
          </p>
          <div className="welcome-points">
            <div className="welcome-point">Photo scan</div>
            <div className="welcome-point">Edit ingredients</div>
            <div className="welcome-point">Generate recipes</div>
          </div>
          <button className="cta-button" onClick={onStart}>
            Enter the app
          </button>
        </div>

        <div className="welcome-preview" aria-hidden="true">
          <div className="preview-panel preview-panel-top">
            <span>Tonight’s plan</span>
            <strong>Quick dinner ideas</strong>
          </div>
          <div className="preview-panel preview-panel-middle">
            <span>Detected ingredients</span>
            <div className="preview-stack">
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="preview-panel preview-panel-bottom">
            <span>Recipes ready</span>
            <strong>3 suggestions</strong>
          </div>
        </div>
      </section>

      <section className="how-it-works how-it-works-new">
        <div className="steps">
          <div className="step-card">
            <span className="step-number">1</span>
            <h3>Capture</h3>
            <p>Take a photo or use the phone camera picker.</p>
          </div>
          <div className="step-card">
            <span className="step-number">2</span>
            <h3>Refine</h3>
            <p>Adjust ingredients, allergies, cuisine, and portions.</p>
          </div>
          <div className="step-card">
            <span className="step-number">3</span>
            <h3>Cook</h3>
            <p>Generate recipes and ask follow-up questions.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
