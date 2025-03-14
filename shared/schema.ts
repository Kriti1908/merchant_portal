import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .refine(password => /[a-z]/.test(password), {
    message: "Password must contain at least 1 lowercase character"
  })
  .refine(password => /[A-Z]/.test(password), {
    message: "Password must contain at least 1 uppercase character"
  })
  .refine(password => /[0-9]/.test(password), {
    message: "Password must contain at least 1 number"
  })
  .refine(password => /[^a-zA-Z0-9]/.test(password), {
    message: "Password must contain at least 1 special character"
  });

export const userSchema = z.object({
  _id: z.string(),
  email: z.string().email(),
  password: z.string(),
  resetToken: z.string().optional(),
  resetTokenExpiry: z.date().optional(),
  createdAt: z.date()
});

export const registerUserSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const insertUserSchema = userSchema.omit({ 
  _id: true, 
  createdAt: true, 
  resetToken: true, 
  resetTokenExpiry: true 
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;

export type LoginData = {
  email: string;
  password: string;
};

export const documentSchema = z.object({
  originalName: z.string(),
  fileName: z.string(),
  path: z.string(),
  type: z.enum(['companyInfo', 'faq', 'products']),
  uploadedAt: z.date()
});

export const stateSchema = z.object({
  name: z.string(),
  specification: z.string(),
  order: z.number().optional()
});

export const projectSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  name: z.string(),
  botName: z.string(),
  serviceType: z.enum([
    'Customer Support',
    'Sales',
    'Product Information',
    'Technical Support'
  ]),
  documents: z.array(documentSchema).optional(),
  states: z.array(stateSchema),
  apiKey: z.string(),
  isActive: z.boolean().optional(),
  createdAt: z.date(),
  lastUpdated: z.date().optional()
});

export const insertProjectSchema = projectSchema.omit({ 
  _id: true, 
  userId: true, 
  apiKey: true, 
  documents: true,
  createdAt: true,
  lastUpdated: true,
  isActive: true
});

export type Project = z.infer<typeof projectSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;