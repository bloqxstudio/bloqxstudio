
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Component } from '@/core/types/database';

type SelectedComponentsContextType = {
  selectedComponents: Component[];
  isComponentSelected: (id: string) => boolean;
  addComponent: (component: Component) => void;
  removeComponent: (id: string) => void;
  clearComponents: () => void;
  moveComponent: (fromIndex: number, toIndex: number) => void;
  totalSelected: number;
};

const SelectedComponentsContext = createContext<SelectedComponentsContextType | undefined>(undefined);

export const SelectedComponentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedComponents, setSelectedComponents] = useState<Component[]>([]);

  const isComponentSelected = (id: string) => {
    return selectedComponents.some(component => component.id === id);
  };

  const addComponent = (component: Component) => {
    if (!isComponentSelected(component.id)) {
      setSelectedComponents(prev => [...prev, component]);
    }
  };

  const removeComponent = (id: string) => {
    setSelectedComponents(prev => prev.filter(component => component.id !== id));
  };

  const clearComponents = () => {
    setSelectedComponents([]);
  };

  const moveComponent = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex < 0 || 
      toIndex < 0 || 
      fromIndex >= selectedComponents.length || 
      toIndex >= selectedComponents.length
    ) {
      return;
    }

    const updatedComponents = [...selectedComponents];
    const [movedItem] = updatedComponents.splice(fromIndex, 1);
    updatedComponents.splice(toIndex, 0, movedItem);
    setSelectedComponents(updatedComponents);
  };

  return (
    <SelectedComponentsContext.Provider
      value={{
        selectedComponents,
        isComponentSelected,
        addComponent,
        removeComponent,
        clearComponents,
        moveComponent,
        totalSelected: selectedComponents.length
      }}
    >
      {children}
    </SelectedComponentsContext.Provider>
  );
};

export const useSelectedComponents = (): SelectedComponentsContextType => {
  const context = useContext(SelectedComponentsContext);
  if (context === undefined) {
    throw new Error('useSelectedComponents must be used within a SelectedComponentsProvider');
  }
  return context;
};
