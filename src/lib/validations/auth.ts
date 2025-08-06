import { z } from 'zod'

export const signUpSchema = z.object({
  email: z
    .string()
    .email('Veuillez entrer une adresse email valide')
    .min(1, 'L\'email est requis'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string(),
  fullName: z
    .string()
    .min(2, 'Le nom complet doit contenir au moins 2 caractères')
    .max(50, 'Le nom complet ne peut pas dépasser 50 caractères')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

export const signInSchema = z.object({
  email: z
    .string()
    .email('Veuillez entrer une adresse email valide')
    .min(1, 'L\'email est requis'),
  password: z
    .string()
    .min(1, 'Le mot de passe est requis')
})

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .email('Veuillez entrer une adresse email valide')
    .min(1, 'L\'email est requis')
})

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema> 