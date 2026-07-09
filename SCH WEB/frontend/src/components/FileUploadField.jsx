import React, { useEffect, useState } from 'react';
import SVGIcon from './icons/SVGIcon';
import './FileUploadField.css';

const FileUploadField = ({ label, name, required, accept, hint, file, onChange }) => {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [file]);

  return (
    <div className="form-group">
      <label className="form-label">
        {label}
        {required && ' *'}
      </label>

      {!file ? (
        <input
          type="file"
          name={name}
          onChange={(e) => onChange(e.target.files[0] || null)}
          className="form-input"
          accept={accept}
          required={required}
        />
      ) : (
        <div className="file-preview">
          {previewUrl ? (
            <img src={previewUrl} alt={file.name} className="file-preview-thumb" />
          ) : (
            <div className="file-preview-icon">
              <SVGIcon name="file-text" size={22} />
            </div>
          )}
          <span className="file-preview-name">{file.name}</span>
          <button
            type="button"
            className="file-preview-remove"
            onClick={() => onChange(null)}
            aria-label={`Remove ${label}`}
          >
            <SVGIcon name="close" size={16} />
          </button>
        </div>
      )}

      {hint && <small className="form-help">{hint}</small>}
    </div>
  );
};

export default FileUploadField;