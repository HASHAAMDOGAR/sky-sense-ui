import { z } from 'zod';

export const alertSettingsSchema = z.object({
  email: z.string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  phone: z.string()
    .trim()
    .max(20, { message: "Phone number must be less than 20 characters" })
    .optional()
    .or(z.literal('')),
  push_enabled: z.boolean(),
  email_enabled: z.boolean(),
  sms_enabled: z.boolean(),
  threshold: z.number()
    .int()
    .min(0, { message: "Threshold must be at least 0" })
    .max(500, { message: "Threshold must be at most 500" })
});

export type AlertSettingsFormData = z.infer<typeof alertSettingsSchema>;
