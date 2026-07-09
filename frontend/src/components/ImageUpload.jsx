import { useState } from 'react';

export default function ImageUpload({ onDetect }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setError(null);
  }

  async function handleSubmit() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      await onDetect(file);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="image-upload">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {previewUrl && <img src={previewUrl} alt="Preview" className="preview" />}
      <button className="primary-button" onClick={handleSubmit} disabled={!file || loading}>
        {loading ? 'Analyzing...' : 'Detect Ingredients'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
