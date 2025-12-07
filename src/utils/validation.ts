import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

export const dateSchema = z.string().refine((date) => {
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}, 'Invalid date format');

// User registration schema
export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  phone: phoneSchema.optional(),
  dateOfBirth: dateSchema,
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

// Appointment booking schema
export const appointmentSchema = z.object({
  providerId: z.string().min(1, 'Please select a provider'),
  date: dateSchema,
  time: z.string().min(1, 'Please select a time'),
  type: z.enum(['in-person', 'video', 'phone']),
  reason: z.string().min(10, 'Please provide a reason (at least 10 characters)'),
  notes: z.string().optional(),
});

// Profile update schema
export const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: phoneSchema.optional(),
  dateOfBirth: dateSchema,
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  emergencyContact: z.object({
    name: z.string().min(2, 'Emergency contact name is required'),
    phone: phoneSchema,
    relationship: z.string().min(2, 'Relationship is required'),
  }).optional(),
});

// Message schema
export const messageSchema = z.object({
  recipientId: z.string().min(1, 'Please select a recipient'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').optional(),
  message: z.string().min(1, 'Message cannot be empty'),
  attachments: z.array(z.instanceof(File)).optional(),
});

// Prescription refill schema
export const prescriptionRefillSchema = z.object({
  prescriptionId: z.string().min(1, 'Prescription ID is required'),
  pharmacyId: z.string().min(1, 'Please select a pharmacy'),
  deliveryMethod: z.enum(['pickup', 'delivery']),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
});

// Health tracking schema
export const healthTrackingSchema = z.object({
  type: z.enum(['blood_pressure', 'blood_glucose', 'weight', 'temperature', 'heart_rate', 'oxygen_saturation']),
  value: z.number().positive('Value must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  notes: z.string().optional(),
  timestamp: dateSchema.optional(),
});

// Insurance claim schema
export const insuranceClaimSchema = z.object({
  policyNumber: z.string().min(1, 'Policy number is required'),
  claimType: z.enum(['medical', 'dental', 'vision', 'prescription']),
  serviceDate: dateSchema,
  providerId: z.string().min(1, 'Provider is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  attachments: z.array(z.instanceof(File)).optional(),
});

// Feedback schema
export const feedbackSchema = z.object({
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  category: z.enum(['service', 'provider', 'platform', 'other']),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  anonymous: z.boolean().optional(),
});

// Export types
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type AppointmentFormData = z.infer<typeof appointmentSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type MessageFormData = z.infer<typeof messageSchema>;
export type PrescriptionRefillFormData = z.infer<typeof prescriptionRefillSchema>;
export type HealthTrackingFormData = z.infer<typeof healthTrackingSchema>;
export type InsuranceClaimFormData = z.infer<typeof insuranceClaimSchema>;
export type FeedbackFormData = z.infer<typeof feedbackSchema>;
