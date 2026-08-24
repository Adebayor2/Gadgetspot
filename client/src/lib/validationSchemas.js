import { z } from 'zod'


export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})


export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Full name must be at least 2 characters'),

    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),

    phone: z
      .string()
      .optional()
      .refine((val) => !val || val.trim().length >= 10, {
        message: 'Phone number must be at least 10 digits',
      }),

    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),

    confirmPassword: z.string().min(1, 'Please confirm your password'),

    agreeToTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'You must agree to the Terms and Conditions',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })


export const contactSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  subject: z
    .string()
    .min(1, 'Subject is required')
    .min(3, 'Subject must be at least 3 characters'),

  message: z
    .string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters'),
})


export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),

    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const trackOrderSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(1, 'New password is required')
    .min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || val.trim().length >= 10, {
      message: 'Phone number must be at least 10 digits',
    }),
  address: z.string().optional(),
})

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters'),
  customerEmail: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  customerPhone: z
    .string()
    .min(1, 'Phone number is required')
    .min(10, 'Phone number must be at least 10 digits'),
  shippingAddress: z
    .string()
    .min(1, 'Shipping address is required')
    .min(5, 'Shipping address must be at least 5 characters'),
  state: z.string().min(1, 'Select your state'),
  lga: z.string().min(1, 'Select your LGA'),
})

