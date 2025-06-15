
import React from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import Navbar from '@/components/Navbar';
import { AppSidebar } from './AppSidebar';

interface FullscreenPageWrapperProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

const FullscreenPageWrapper: React.FC<FullscreenPageWrapperProps> = ({ 
  children, 
  showSidebar = true 
}) => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <SidebarProvider>
        <div className="flex h-screen w-full">
          {showSidebar && <AppSidebar />}
          <SidebarInset className="flex flex-col flex-1 min-w-0">
            <Navbar />
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
