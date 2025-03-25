
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User } from 'lucide-react';
import { toast } from 'sonner';

const AuthButtons = () => {
  const { user, signOut, isAdmin } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso!');
  };

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/login">Entrar</Link>
        </Button>
        <Button asChild size="sm">
          <Link to="/register">Registrar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm mr-2 hidden md:block">
        <span className="text-muted-foreground">
          {user.email} {isAdmin && <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-md text-xs ml-1">Admin</span>}
        </span>
      </div>
      <Button variant="ghost" size="sm" onClick={handleSignOut}>
        <LogOut className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Sair</span>
      </Button>
    </div>
  );
};

export default AuthButtons;
