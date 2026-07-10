import { useEffect, useRef, useState } from 'react';

export default function ImageUpload({ onDetect }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [mode, setMode] = useState('idle');
  const [cameraError, setCameraError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  async function startCamera() {
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Your browser does not support direct camera access.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
        },
        audio: false,
      });

      stopCamera();
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setMode('camera');
    } catch (err) {
      setCameraError(err.message || 'Could not start the camera.');
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  function resetSelection() {
    setFile(null);
    setError(null);
    setCameraError(null);
    setMode('idle');
    setPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl);
      return null;
    });
    stopCamera();
  }

  function setSelectedFile(selected) {
    setFile(selected);
    setPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl);
      return URL.createObjectURL(selected);
    });
    setError(null);
    setCameraError(null);
    setMode('idle');
    stopCamera();
  }

  function handleFileChange(e) {
    const selected = e.target.files[0];
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

  async function handleCapture() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError('Could not capture the photo. Please try again.');
        return;
      }

      const capturedFile = new File([blob], `intellichef-${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });

      setSelectedFile(capturedFile);
    }, 'image/jpeg', 0.92);
  }

  return (
    <div className="image-upload">
      <input
        ref={fileInputRef}
        id="fridge-library-photo"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="visually-hidden"
      />

      {mode === 'camera' ? (
        <div className="camera-panel">
          <video ref={videoRef} className="camera-preview" autoPlay playsInline muted />
          <canvas ref={canvasRef} className="visually-hidden" />
          <div className="camera-actions">
            <button type="button" className="secondary-button" onClick={resetSelection}>
              Cancel
            </button>
            <button type="button" className="primary-button" onClick={handleCapture}>
              Capture photo
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="upload-actions">
            <button type="button" className="primary-button" onClick={startCamera}>
              <span className="upload-icon" aria-hidden="true">
                📷
              </span>
              Use camera
            </button>
            <button
              type="button"
              className="secondary-button upload-secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              Upload from library
            </button>
          </div>
          <p className="upload-hint">Take a photo with your phone camera or choose one from your library.</p>
          {cameraError && <p className="error">{cameraError}</p>}
          {file && <span className="file-name">{file.name}</span>}
          {previewUrl && <img src={previewUrl} alt="Fridge photo preview" className="preview" />}
          {file && (
            <div className="upload-post-actions">
              <button type="button" className="secondary-button" onClick={resetSelection}>
                Pick another photo
              </button>
            </div>
          )}
        </>
      )}

      <button className="primary-button" onClick={handleSubmit} disabled={!file || loading}>
        {loading ? 'Scanning...' : 'Scan ingredients'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
