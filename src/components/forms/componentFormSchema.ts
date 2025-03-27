
import { z } from 'zod';

// Define the element type as an enum for type safety
export const ElementType = z.enum(['image', 'heading', 'button', 'list', 'video']);
export type ElementType = z.infer<typeof ElementType>;

export const formSchema = z.object({
  title: z.string().min(3, { message: 'Título é obrigatório' }),
  tags: z.string().optional(),
  jsonCode: z.string().min(10, { message: 'Código é obrigatório' }),
  visibility: z.enum(['public', 'private'], { message: 'Visibilidade deve ser pública ou privada' }),
  alignment: z.enum(['left', 'center', 'right', 'full']).optional(),
  columns: z.enum(['1', '2', '3+']).optional(),
  elements: z.array(ElementType).optional()
});

export type FormValues = z.infer<typeof formSchema>;
