import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const SelectedChildContext = createContext();

export const useSelectedChild = () => {
  const context = useContext(SelectedChildContext);
  if (!context) {
    throw new Error('useSelectedChild must be used within a SelectedChildProvider');
  }
  return context;
};

// Gives every portal page a shared idea of "which child are we looking at" —
// a single child for students, or whichever one a parent has picked from
// their list of children (relevant once a parent has more than one).
export const SelectedChildProvider = ({ children }) => {
  const { user } = useAuth();
  const childOptions = user?.role === 'parent' ? (user.children || []) : (user?.student ? [user.student] : []);
  const [selectedChildId, setSelectedChildId] = useState(childOptions[0]?.id || null);

  useEffect(() => {
    if (childOptions.length && !childOptions.some((c) => c.id === selectedChildId)) {
      setSelectedChildId(childOptions[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <SelectedChildContext.Provider value={{ selectedChildId, setSelectedChildId, childOptions }}>
      {children}
    </SelectedChildContext.Provider>
  );
};
