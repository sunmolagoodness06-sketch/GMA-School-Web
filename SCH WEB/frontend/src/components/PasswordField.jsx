import React, { useState } from 'react';
import SVGIcon from './icons/SVGIcon';

// Wraps a password <input> with a show/hide toggle. Set `icon={false}` for
// plain form-group fields (e.g. Profile's change-password form); leave the
// default on for auth pages that use the .input-with-icon (lock icon) style.
const PasswordField = ({ icon = true, className = '', ...inputProps }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`password-field ${icon ? 'input-with-icon' : ''}`}>
      {icon && <SVGIcon name="lock" size="20" />}
      <input
        type={visible ? 'text' : 'password'}
        className={className}
        style={{ paddingRight: '48px' }}
        {...inputProps}
      />
      <button
        type="button"
        className="password-toggle-btn"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        <SVGIcon name={visible ? 'eye-off' : 'eye'} size="18" />
      </button>
    </div>
  );
};

export default PasswordField;
