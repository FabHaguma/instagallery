import { createContext, useContext, useState } from 'react';

const ViewContext = createContext(null);

export function ViewProvider({ children }) {
  const [viewMode, setViewMode] = useState('grid');
  const [gridCols, setGridCols] = useState(5);

  return (
    <ViewContext.Provider value={{ viewMode, setViewMode, gridCols, setGridCols }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  return useContext(ViewContext);
}
