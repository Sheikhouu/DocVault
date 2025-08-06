import { z } from 'zod'

export const documentCategories = [
  'identity',
  'education', 
  'employment',
  'housing',
  'financial',
  'health',
  'legal',
  'other'
] as const

export const documentSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  description: z
    .string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional(),
  category: z
    .enum(documentCategories, {
      errorMap: () => ({ message: 'Veuillez sélectionner une catégorie valide' })
    }),
  expiryDate: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate >= today
    }, 'La date d\'expiration ne peut pas être dans le passé'),
  tags: z
    .array(z.string())
    .max(10, 'Vous ne pouvez pas avoir plus de 10 tags')
    .optional()
})

export const fileUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size > 0, 'Le fichier ne peut pas être vide')
    .refine(
      (file) => file.size <= 10 * 1024 * 1024, // 10MB
      'Le fichier ne peut pas dépasser 10MB'
    )
    .refine(
      (file) => {
        const allowedTypes = [
          'application/pdf',
          'image/jpeg',
          'image/jpg', 
          'image/png',
          'image/webp'
        ]
        return allowedTypes.includes(file.type)
      },
      'Seuls les fichiers PDF et images (JPEG, PNG, WebP) sont autorisés'
    )
})

export const documentUpdateSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(100, 'Le titre ne peut pas dépasser 100 caractères')
    .optional(),
  description: z
    .string()
    .max(500, 'La description ne peut pas dépasser 500 caractères')
    .optional(),
  category: z
    .enum(documentCategories)
    .optional(),
  expiryDate: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true
      const selectedDate = new Date(date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return selectedDate >= today
    }, 'La date d\'expiration ne peut pas être dans le passé'),
  tags: z
    .array(z.string())
    .max(10, 'Vous ne pouvez pas avoir plus de 10 tags')
    .optional()
})

export type DocumentInput = z.infer<typeof documentSchema>
export type FileUploadInput = z.infer<typeof fileUploadSchema>
export type DocumentUpdateInput = z.infer<typeof documentUpdateSchema> 