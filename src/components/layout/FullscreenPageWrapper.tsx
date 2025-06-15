
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import Navbar from '@/components/Navbar';
import { AppSidebar } from './AppSidebar';

interface FullscreenPageWrapperProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showFilters?: boolean;
  filtersContent?: React.ReactNode;
}

const FullscreenPageWrapper: React.FC<FullscreenPageWrapperProps> = ({ 
  children, 
  showSidebar = true,
  showFilters = false,
  filtersContent
}) => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <SidebarProvider>
        {/* Navbar 100% width - outside sidebar layout */}
        <div className="w-full">
          <Navbar />
        </div>
        
        {/* Filters area - 100% width, fixed below navbar */}
        {showFilters && filtersContent && (
          <div className="w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-40">
            <div className="p-4">
              {filtersContent}
            </div>
          </div>
        )}
        
        {/* Main content with sidebar */}
        <div className="flex flex-1 w-full">
          {showSidebar && <AppSidebar />}
          <SidebarInset className="flex flex-col flex-1 min-w-0">
            <main className="flex-1 overflow-hidden">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default FullscreenPageWrapper;
