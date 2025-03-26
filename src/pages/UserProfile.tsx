
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, updateUserProfile } from '@/lib/api';
import Navbar from '@/components/Navbar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  Input,
  Alert,
  AlertDescription,
  AlertTitle,
  Separator
} from '@/components/ui';
import { User, KeyRound, Save, ImageIcon, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Schema para validação dos dados do perfil
const profileSchema = z.object({
  first_name: z.string().min(2, 'O nome precisa ter pelo menos 2 caracteres').max(50).optional(),
  last_name: z.string().min(2, 'O sobrenome precisa ter pelo menos 2 caracteres').max(50).optional(),
  avatar_url: z.string().optional()
});

// Schema para validação da troca de senha
const passwordSchema = z.object({
  newPassword: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirme a nova senha')
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form para dados do perfil
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      avatar_url: ''
    }
  });

  // Form para troca de senha
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: ''
    }
  });

  // Carregar dados do perfil
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const profileData = await getUserProfile(user.id);
        setProfileData(profileData);

        if (profileData) {
          form.reset({
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            avatar_url: profileData.avatar_url || ''
          });

          if (profileData.avatar_url) {
            setAvatarPreview(profileData.avatar_url);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        toast.error('Não foi possível carregar seus dados de perfil');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate, form]);

  // Manipular upload de avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const fileUrl = URL.createObjectURL(file);
      setAvatarPreview(fileUrl);
    }
  };

  // Função para fazer upload do avatar
  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;
    
    setUploadingAvatar(true);
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const filePath = `avatars/${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      toast.error('Falha ao fazer upload da imagem');
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Salvar dados do perfil
  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      // Upload do avatar se necessário
      let avatarUrl = data.avatar_url;
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar();
        if (uploadedUrl) avatarUrl = uploadedUrl;
      }

      // Atualizar perfil
      const updateData = {
        first_name: data.first_name,
        last_name: data.last_name,
        avatar_url: avatarUrl
      };

      await updateUserProfile(user.id, updateData);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Não foi possível atualizar seu perfil');
    } finally {
      setIsUpdating(false);
    }
  };

  // Alterar senha
  const handlePasswordChange = async (data: PasswordFormValues) => {
    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) throw error;
      
      toast.success('Senha alterada com sucesso!');
      passwordForm.reset();
    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      toast.error(error.message || 'Falha ao alterar senha');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Carregando seu perfil...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold tracking-tighter mb-6">Perfil do Usuário</h1>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardContent className="p-6 flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border mb-4">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="font-medium">
                      {profileData?.first_name ? `${profileData.first_name} ${profileData.last_name || ''}` : 'Usuário'}
                    </h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="mt-2 w-full">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="flex items-center justify-center p-2 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Alterar foto</span>
                      </div>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    Atualize suas informações de perfil
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="first_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome</FormLabel>
                              <FormControl>
                                <Input placeholder="Seu nome" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="last_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sobrenome</FormLabel>
                              <FormControl>
                                <Input placeholder="Seu sobrenome" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm text-muted-foreground">{user?.email} (não pode ser alterado)</span>
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          className="w-full sm:w-auto"
                          disabled={isUpdating || uploadingAvatar}
                        >
                          {(isUpdating || uploadingAvatar) ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Salvando...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Salvar alterações
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Segurança</CardTitle>
                  <CardDescription>
                    Altere sua senha para manter a conta segura
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                      <Alert className="bg-amber-50 text-amber-800 border-amber-200">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Importante</AlertTitle>
                        <AlertDescription>
                          Ao alterar sua senha, você será desconectado de todas as sessões ativas.
                        </AlertDescription>
                      </Alert>
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nova senha</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Digite a nova senha" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmar nova senha</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirme a nova senha" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          variant="outline"
                          className="w-full sm:w-auto"
                          disabled={isChangingPassword}
                        >
                          {isChangingPassword ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Alterando...
                            </>
                          ) : (
                            <>
                              <KeyRound className="mr-2 h-4 w-4" />
                              Alterar senha
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
