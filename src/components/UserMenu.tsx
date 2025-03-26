
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile } from '@/lib/api';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui';
import { User, Settings, LogOut, Database, Shield, ChevronDown, UserCircle } from 'lucide-react';

const UserMenu = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          const data = await getUserProfile(user.id);
          setProfileData(data);
        } catch (error) {
          console.error("Erro ao carregar perfil:", error);
        }
      }
    };

    loadProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso!');
    navigate('/');
  };

  if (!user) return null;

  // Get first letter of email for avatar fallback
  const emailInitial = user.email ? user.email[0].toUpperCase() : 'U';
  
  // Display name (from profile if available, otherwise email)
  const displayName = profileData?.first_name 
    ? `${profileData.first_name} ${profileData.last_name || ''}`
    : user.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
        <Avatar className="h-8 w-8">
          <AvatarImage src={profileData?.avatar_url} alt={displayName || "Avatar do usuário"} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {emailInitial}
          </AvatarFallback>
        </Avatar>
        <span className="text-sm hidden md:inline-block">{displayName}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile" className="cursor-pointer flex w-full items-center">
            <UserCircle className="mr-2 h-4 w-4" />
            <span>Meu Perfil</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/components" className="cursor-pointer flex w-full items-center">
            <Database className="mr-2 h-4 w-4" />
            <span>Meus Componentes</span>
          </Link>
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Administração</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link to="/admin" className="cursor-pointer flex w-full items-center">
                <Shield className="mr-2 h-4 w-4" />
                <span>Painel Admin</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/users" className="cursor-pointer flex w-full items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Gerenciar Usuários</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
