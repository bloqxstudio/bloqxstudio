
import { z } from 'zod';

export const formSchema = z.object({
  title: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres" }),
  description: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres" }),
  category: z.string().min(1, { message: "Selecione uma categoria" }),
  tags: z.string().optional(),
  jsonCode: z.string().min(10, { message: "O código JSON é obrigatório" }),
  visibility: z.enum(['public', 'private'], { 
    message: "A visibilidade deve ser 'público' ou 'privado'" 
  }).default('public')
});

export type FormValues = z.infer<typeof formSchema>;
