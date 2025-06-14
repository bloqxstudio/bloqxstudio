
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Component {
  id: string;
  title: string;
  description?: string;
  category: string;
  code: string;
  json_code?: string;
  preview_image?: string;
  tags?: string[];
  type?: string;
  visibility: 'public' | 'private';
  created_at: string;
  updated_at: string;
  created_by: string;
  alignment?: string;
  columns?: string;
  elements?: string[];
}

export interface SelectedComponentsContextType {
  selectedComponents: Component[];
  addComponent: (component: Component) => void;
  removeComponent: (componentId: string) => void;
  clearAllComponents: () => void;
  isComponentVisible: (componentId: string) => boolean;
  setComponentVisibility: (componentId: string, visible: boolean) => void;
}

const SelectedComponentsContext = createContext<SelectedComponentsContextType | undefined>(undefined);

interface SelectedComponentsProviderProps {
  children: ReactNode;
}

export const SelectedComponentsProvider: React.FC<SelectedComponentsProviderProps> = ({ children }) => {
  const [selectedComponents, setSelectedComponents] = useState<Component[]>([]);
  const [componentVisibility, setComponentVisibilityState] = useState<Record<string, boolean>>({});

  const addComponent = (component: Component) => {
    setSelectedComponents(prev => {
      const exists = prev.find(c => c.id === component.id);
      if (exists) return prev;
      return [...prev, component];
    });
  };

  const removeComponent = (componentId: string) => {
    setSelectedComponents(prev => prev.filter(c => c.id !== componentId));
  };

  const clearAllComponents = () => {
    setSelectedComponents([]);
    setComponentVisibilityState({});
  };

  const isComponentVisible = (componentId: string) => {
    return componentVisibility[componentId] ?? true;
  };

  const setComponentVisibility = (componentId: string, visible: boolean) => {
    setComponentVisibilityState(prev => ({
      ...prev,
      [componentId]: visible
    }));
  };

  const value: SelectedComponentsContextType = {
    selectedComponents,
    addComponent,
    removeComponent,
    clearAllComponents,
    isComponentVisible,
    setComponentVisibility
  };

  return (
    <SelectedComponentsContext.Provider value={value}>
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
