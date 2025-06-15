
import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Component } from '@/core/types';

interface SelectedComponentsContextType {
  selectedComponents: Component[];
  addComponent: (component: Component) => void;
  removeComponent: (componentId: string) => void;
  toggleComponent: (component: Component) => void;
  clearSelectedComponents: () => void;
  isComponentSelected: (componentId: string) => boolean;
}

const SelectedComponentsContext = createContext<SelectedComponentsContextType | undefined>(undefined);

export const useSelectedComponents = () => {
  const context = useContext(SelectedComponentsContext);
  if (!context) {
    throw new Error('useSelectedComponents must be used within a SelectedComponentsProvider');
  }
  return context;
};

interface SelectedComponentsProviderProps {
  children: ReactNode;
}

export const SelectedComponentsProvider: React.FC<SelectedComponentsProviderProps> = ({ children }) => {
  const [selectedComponents, setSelectedComponents] = useState<Component[]>([]);

  const addComponent = (component: Component) => {
    setSelectedComponents(prev => {
      const exists = prev.some(c => c.id === component.id);
      if (exists) return prev;
      return [...prev, component];
    });
  };

  const removeComponent = (componentId: string) => {
    setSelectedComponents(prev => prev.filter(c => c.id !== componentId));
  };

  const toggleComponent = (component: Component) => {
    setSelectedComponents(prev => {
      const exists = prev.some(c => c.id === component.id);
      if (exists) {
        return prev.filter(c => c.id !== component.id);
      } else {
        return [...prev, component];
      }
    });
  };

  const clearSelectedComponents = () => {
    setSelectedComponents([]);
  };

  const isComponentSelected = (componentId: string) => {
    return selectedComponents.some(c => c.id === componentId);
  };

  const value: SelectedComponentsContextType = {
    selectedComponents,
    addComponent,
    removeComponent,
    toggleComponent,
    clearSelectedComponents,
    isComponentSelected,
  };

  return (
    <SelectedComponentsContext.Provider value={value}>
      {children}
    </SelectedComponentsContext.Provider>
  );
};
