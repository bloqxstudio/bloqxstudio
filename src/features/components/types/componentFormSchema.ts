
import { z } from 'zod';

export const formSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  tags: z.string().optional(),
  jsonCode: z.string().min(1, 'Código JSON é obrigatório'),
  visibility: z.enum(['public', 'private']).default('public'),
  alignment: z.enum(['left', 'center', 'right', 'full']).optional(),
  columns: z.enum(['1', '2', '3+']).optional(),
  elements: z.array(z.enum(['image', 'heading', 'button', 'list', 'video'])).default([])
});

export type FormValues = z.infer<typeof formSchema>;
