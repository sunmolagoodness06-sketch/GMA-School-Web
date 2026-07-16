import React, { useState } from 'react';
import Icon from './Icon';

const PasswordField = (inputProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-field">
      <input type={visible ? 'text' : 'password'} style={{ paddingRight: '40px' }} {...inputProps} />
      <button
        type="button"
        className="password-toggle-btn"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        <Icon name={visible ? 'eyeOff' : 'eye'} size={18} />
      </button>
    </div>
  );
};

export default PasswordField;
