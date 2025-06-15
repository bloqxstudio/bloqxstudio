
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/features/auth';
import { useSelectedComponents } from '@/shared/contexts/SelectedComponentsContext';
import UserMenu from './UserMenu';
import AuthButtons from './AuthButtons';

// Safe sidebar trigger that only renders if within SidebarProvider
const SafeSidebarTrigger = () => {
  try {
    // Dynamic import to avoid the error if not in provider context
    const { SidebarTrigger, useSidebar } = require('@/components/ui/sidebar');
    
    // Try to use the hook - if it fails, we're not in a provider
    const sidebarContext = useSidebar();
    
    return <SidebarTrigger className="md:hidden" />;
  } catch (error) {
    // If we're not in a SidebarProvider context, don't render anything
    return null;
  }
};

const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const { selectedComponents } = useSelectedComponents();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full">
      <div className="flex justify-between h-16 px-4">
        <div className="flex items-center space-x-4">
          <SafeSidebarTrigger />
          
          <Link to="/components" className="flex items-center">
            <span className="text-xl font-bold text-primary">Superelements</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant={isActive('/components') ? 'default' : 'ghost'} 
              asChild 
              size="sm"
            >
              <Link to="/components">Biblioteca</Link>
            </Button>
            
            {isAdmin && (
              <>
                <Button 
                  variant={isActive('/wordpress') ? 'default' : 'ghost'} 
                  asChild 
                  size="sm"
                >
                  <Link to="/wordpress">WordPress</Link>
                </Button>
                
                <Button variant={isActive('/admin') ? 'default' : 'ghost'} asChild size="sm">
                  <Link to="/admin">Admin</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {selectedComponents.length > 0 && (
            <Badge variant="secondary" className="hidden sm:flex">
              {selectedComponents.length} selecionado{selectedComponents.length !== 1 ? 's' : ''}
            </Badge>
          )}
          
          {user ? <UserMenu /> : <AuthButtons />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
