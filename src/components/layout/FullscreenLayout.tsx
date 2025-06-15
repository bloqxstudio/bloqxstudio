
import React from 'react';
import { MainSidebar } from './MainSidebar';
import { ResourcePanel } from './ResourcePanel';

interface FullscreenLayoutProps {
  children: React.ReactNode;
  showResourcePanel?: boolean;
  selectedComponent?: any;
}

export const FullscreenLayout: React.FC<FullscreenLayoutProps> = ({
  children,
  showResourcePanel = false,
  selectedComponent = null
}) => {
  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Fixed Left Sidebar */}
      <MainSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
      
      {/* Right Resource Panel */}
      {showResourcePanel && (
        <ResourcePanel component={selectedComponent} />
      )}
    </div>
  );
};
