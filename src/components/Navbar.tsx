
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PlusCircle, Home, Grid, Search, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthButtons from '@/components/AuthButtons';
import UserMenu from '@/components/UserMenu';

interface NavbarProps {
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ className }) => {
  const { isAdmin, user } = useAuth();
  const location = useLocation();
  
  return (
    <header className={cn('w-full border-b border-border/40 backdrop-blur-sm bg-background/95 sticky top-0 z-50', className)}>
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary h-8 w-8 flex items-center justify-center rounded-md">
              <span className="text-primary-foreground font-bold text-xl">B</span>
            </div>
            <span className="font-semibold text-lg">Bloqx Studio</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1",
              location.pathname === '/' && "text-primary"
            )}
          >
            <Home className="h-4 w-4" />
            <span>Início</span>
          </Link>
          <Link 
            to="/components" 
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1",
              location.pathname === '/components' && "text-primary"
            )}
          >
            <Grid className="h-4 w-4" />
            <span>Componentes</span>
          </Link>
          {isAdmin && (
            <Link 
              to="/admin" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1",
                location.pathname.startsWith('/admin') && "text-primary"
              )}
            >
              <Shield className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-auto mr-2 hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Buscar componentes..."
              className="h-9 w-[200px] md:w-[250px] rounded-md border border-input bg-transparent pl-8 pr-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          {user && (
            <Button asChild size="sm" className="hover-lift mr-2">
              <Link to="/components/new">
                <PlusCircle className="mr-1 h-4 w-4" />
                Novo
              </Link>
            </Button>
          )}
          {user ? <UserMenu /> : <AuthButtons />}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
