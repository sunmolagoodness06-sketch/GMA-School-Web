import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import Icon from '../components/Icon';

const DialogContext = createContext();

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

// Replaces window.confirm/window.alert with a styled modal matching the rest
// of the admin console, since native browser dialogs look/feel inconsistent
// and can't be restyled. confirmDialog resolves true/false; alertDialog
// resolves once dismissed.
export const DialogProvider = ({ children }) => {
  const [dialog, setDialog] = useState(null);
  const resolveRef = useRef(null);

  const confirmDialog = useCallback((message, { title = 'Are you sure?', confirmLabel = 'Confirm', danger = true } = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialog({ type: 'confirm', title, message, confirmLabel, danger });
    });
  }, []);

  const alertDialog = useCallback((message, { title = 'Notice' } = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialog({ type: 'alert', title, message });
    });
  }, []);

  const handleClose = (result) => {
    setDialog(null);
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
  };

  return (
    <DialogContext.Provider value={{ confirmDialog, alertDialog }}>
      {children}

      {dialog && (
        <div className="modal-backdrop" onClick={() => handleClose(dialog.type === 'confirm' ? false : undefined)}>
          <div className="modal-panel dialog-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{dialog.title}</h2>
              <button className="modal-close-btn" onClick={() => handleClose(dialog.type === 'confirm' ? false : undefined)}>
                <Icon name="close" size={22} />
              </button>
            </div>
            <p style={{ marginBottom: 'var(--space-6)' }}>{dialog.message}</p>
            <div className="dialog-actions">
              {dialog.type === 'confirm' && (
                <button className="btn btn-outline" onClick={() => handleClose(false)}>Cancel</button>
              )}
              <button
                className={dialog.type === 'confirm' && dialog.danger ? 'btn btn-danger' : 'btn btn-primary'}
                onClick={() => handleClose(dialog.type === 'confirm' ? true : undefined)}
              >
                {dialog.type === 'confirm' ? dialog.confirmLabel : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};
