
import { z } from 'zod';

// Element types for components
export const ElementType = z.enum(['image', 'heading', 'button', 'list', 'video']);
export type ElementType = z.infer<typeof ElementType>;

// Component form schema
export const componentFormSchema = z.object({
  title: z.string().min(3, { message: 'Título é obrigatório' }),
  description: z.string().min(1, { message: 'Descrição é obrigatória' }),
  category: z.string().min(1, { message: 'Categoria é obrigatória' }),
  tags: z.array(z.string()).optional().default([]),
  jsonCode: z.string().min(10, { message: 'Código é obrigatório' }),
  visibility: z.enum(['public', 'private'], { message: 'Visibilidade deve ser pública ou privada' }),
  alignment: z.enum(['left', 'center', 'right', 'full']).optional(),
  columns: z.enum(['1', '2', '3+']).optional(),
  elements: z.array(ElementType).optional()
});

export type ComponentFormValues = z.infer<typeof componentFormSchema>;

// User profile form schema
export const userProfileFormSchema = z.object({
  first_name: z.string().min(1, 'Nome é obrigatório'),
  last_name: z.string().min(1, 'Sobrenome é obrigatório'),
  email: z.string().email('Email inválido'),
});

export type UserProfileFormValues = z.infer<typeof userProfileFormSchema>;
