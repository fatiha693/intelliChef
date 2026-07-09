import { useEffect, useState } from 'react';

export default function ImageUpload({ onDetect }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(e) {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl);
      return URL.createObjectURL(selected);
    });
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
      <input
        id="fridge-photo"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="visually-hidden"
      />
      <label htmlFor="fridge-photo" className="upload-label">
        <span className="upload-icon" aria-hidden="true">
          📷
        </span>
        {file ? 'Change photo' : 'Choose a photo'}
      </label>
      <p className="upload-hint">Use your camera or pick a photo from your library.</p>
      {file && <span className="file-name">{file.name}</span>}
      {previewUrl && <img src={previewUrl} alt="Fridge photo preview" className="preview" />}
      <button className="primary-button" onClick={handleSubmit} disabled={!file || loading}>
        {loading ? 'Scanning...' : 'Scan ingredients'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
