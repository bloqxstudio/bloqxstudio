
import { z } from 'zod';

export const formSchema = z.object({
  title: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres" }),
  description: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  jsonCode: z.string().min(10, { message: "O código JSON é obrigatório" }),
  visibility: z.enum(['public', 'private'], { 
    message: "A visibilidade deve ser 'público' ou 'privado'" 
  }).default('public'),
  previewImage: z.string().optional()
});

export type FormValues = z.infer<typeof formSchema>;
