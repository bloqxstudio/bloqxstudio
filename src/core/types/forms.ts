
import { z } from 'zod';

// Element types for components
export const ElementType = z.enum(['image', 'heading', 'button', 'list', 'video']);
export type ElementType = z.infer<typeof ElementType>;

// Component form schema
export const componentFormSchema = z.object({
  title: z.string().min(3, { message: 'Title is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  tags: z.array(z.string()).optional().default([]),
  jsonCode: z.string().min(10, { message: 'Code is required' }),
  visibility: z.enum(['public', 'private'], { message: 'Visibility must be public or private' }),
  alignment: z.enum(['left', 'center', 'right', 'full']).optional(),
  columns: z.enum(['1', '2', '3+']).optional(),
  elements: z.array(ElementType).optional()
});

export type ComponentFormValues = z.infer<typeof componentFormSchema>;

// User profile form schema
export const userProfileFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
});

export type UserProfileFormValues = z.infer<typeof userProfileFormSchema>;
