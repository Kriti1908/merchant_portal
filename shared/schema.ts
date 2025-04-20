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
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
  email: z.string().email(),
  phone_no: z
    .string()
    .regex(/^[0-9]{10}$/, { message: "Phone number must be a valid 10-digit number" }),
  password: z.string(),
  resetToken: z.string().optional(),
  resetTokenExpiry: z.date().optional(),
  createdAt: z.date(),
});

export const registerUserSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Username can only contain letters, numbers, and underscores" }),
  email: z.string().email(),
  phone_no: z
    .string()
    .regex(/^[0-9]{10}$/, { message: "Phone number must be a valid 10-digit number" }),
  password: passwordSchema,
  confirmPassword: z.string(),
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
  utterances: z.array(z.string()),
  responses: z.array(z.string()),
  specification: z.string(),
  order: z.number().optional()
});

// Payment schema
export const paymentSchema = z.object({
  paymentId: z.string().optional(),
  orderId: z.string().optional(),
  status: z.enum(['pending', 'completed', 'failed']).optional(),
  date: z.date().optional(),
  amount: z.number().optional(),
  currency: z.string().optional(),
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
  plan_type: z.enum(['Basic', 'Pro', 'Ultimate']).default('Basic'), // New field
  plan_expiry: z.date().nullable().optional(), // New field
  total_api_calls: z.number().default(200), // New field
  bot_link: z.string().nullable().optional(), // New field
  isActive: z.boolean().optional(),
  createdAt: z.date(),
  lastUpdated: z.date().optional(),
  payment: paymentSchema.optional()
});

export const insertProjectSchema = projectSchema.omit({ 
  _id: true, 
  userId: true, 
  apiKey: true, 
  documents: true,
  createdAt: true,
  lastUpdated: true,
  isActive: true,
  plan_expiry: true, // Omit plan_expiry for insertion
  bot_link: true, // Omit bot_link for insertion
  payment: true
});

export type Project = z.infer<typeof projectSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export const reviewSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  projectId: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string(),
  createdAt: z.date(),
});

export const insertReviewSchema = reviewSchema.omit({
  _id: true,
  createdAt: true,
});

export type Review = z.infer<typeof reviewSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;