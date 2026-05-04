import { z } from 'zod';

export const emailSchema = z.string().email('Email invalide');

export const passwordSchema = z.string().min(8, 'Minimum 8 caractères');

export const userSchema = z.object({
  email: emailSchema,
  name: z.string().min(2, 'Minimum 2 caractères'),
  password: passwordSchema,
});

export const integrationSchema = z.object({
  type: z.enum(['shopify', 'amazon', 'ebay']),
  apiKey: z.string().min(1, 'API key requis'),
  storeUrl: z.string().url('URL invalide').optional(),
});

export const automationSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  type: z.enum(['price_adjustment', 'stock_alert', 'description_update']),
  condition: z.record(z.unknown()),
  action: z.record(z.unknown()),
  frequency: z.enum(['daily', 'real-time', 'on_order']),
  enabled: z.boolean().default(true),
});

export type UserInput = z.infer<typeof userSchema>;
export type IntegrationInput = z.infer<typeof integrationSchema>;
export type AutomationInput = z.infer<typeof automationSchema>;
