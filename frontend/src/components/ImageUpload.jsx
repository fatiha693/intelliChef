import { useEffect, useRef, useState } from 'react';

export default function ImageUpload({ onDetect }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cameraInputRef = useRef(null);
  const libraryInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function resetSelection() {
    setFile(null);
    setError(null);
    setPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl);
      return null;
    });
  }

  function setSelectedFile(selected) {
    setFile(selected);
    setPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl);
      return URL.createObjectURL(selected);
    });
    setError(null);
  }

  function handleFileChange(e) {
    const selected = e.target.files[0];
    e.target.value = '';
    if (!selected) return;
    setSelectedFile(selected);
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
      {/* Two plain file inputs, each backed by the browser/OS's own native
          camera or photo picker — far more reliable across phones than a
          hand-rolled getUserMedia video preview, which iOS Safari silently
          breaks in some conditions (e.g. Private Browsing). */}
      <input
        ref={cameraInputRef}
        id="fridge-camera-photo"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="visually-hidden"
      />
      <input
        ref={libraryInputRef}
        id="fridge-library-photo"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="visually-hidden"
      />

      <div className="upload-actions">
        <button
          type="button"
          className="primary-button"
          onClick={() => cameraInputRef.current?.click()}
        >
          <span className="upload-icon" aria-hidden="true">
            📷
          </span>
          Use camera
        </button>
        <button
          type="button"
          className="secondary-button upload-secondary"
          onClick={() => libraryInputRef.current?.click()}
        >
          Upload from library
        </button>
      </div>
      <p className="upload-hint">Take a photo with your phone camera or choose one from your library.</p>
      {file && <span className="file-name">{file.name}</span>}
      {previewUrl && <img src={previewUrl} alt="Fridge photo preview" className="preview" />}
      {file && (
        <div className="upload-post-actions">
          <button type="button" className="secondary-button" onClick={resetSelection}>
            Pick another photo
          </button>
        </div>
      )}

      <button className="primary-button" onClick={handleSubmit} disabled={!file || loading}>
        {loading ? 'Scanning...' : 'Scan ingredients'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
