import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const receiptItemSchema = z.object({
  description: z.string().min(2, "Description is required"),
  quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
  unitPrice: z.coerce.number().nonnegative("Unit price cannot be negative")
});

export const createReceiptSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  paymentMethod: z.enum(["CASH", "TRANSFER", "POS"]),
  discount: z.coerce.number().nonnegative().default(0),
  notes: z.string().optional(),
  warrantyNotes: z.string().optional(),
  items: z.array(receiptItemSchema).min(1, "At least one item is required")
});

export const settingsSchema = z.object({
  businessName: z.string().min(2),
  motto: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
  footerText: z.string().min(3),
  defaultWarranty: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  contactPhoneAlt: z.string().optional(),
  socialHandle: z.string().optional(),
  address: z.string().optional()
});

export type CreateReceiptInput = z.infer<typeof createReceiptSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
