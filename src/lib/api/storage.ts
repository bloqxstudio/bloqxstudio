
import { supabase } from '@/integrations/supabase/client';

// Upload preview image
export const uploadComponentImage = async (file: File, path: string) => {
  console.log('Enviando imagem:', file.name, 'para o caminho:', path);
  
  const { data, error } = await supabase.storage
    .from('component-images')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Erro ao enviar imagem:', error);
    throw error;
  }
  
  console.log('Envio bem-sucedido:', data);
  
  const { data: { publicUrl } } = supabase.storage
    .from('component-images')
    .getPublicUrl(path);
  
  console.log('URL pública:', publicUrl);  
  return publicUrl;
};
