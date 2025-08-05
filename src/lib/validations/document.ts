import { z } from 'zod'

export const documentSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(100, 'Le titre ne peut pas dépasser 100 caractères'),
  description: z.string().max(500, 'La description ne peut pas dépasser 500 caractères').optional(),
  category: z.string().max(50, 'La catégorie ne peut pas dépasser 50 caractères').optional(),
  expiry_date: z.string().optional(),
  tags: z.array(z.string().max(20)).max(10, 'Maximum 10 tags').optional(),
})

export const documentUploadSchema = z.object({
  file: z.instanceof(File).refine((file) => file.size <= 10 * 1024 * 1024, 'Le fichier ne peut pas dépasser 10MB'),
  ...documentSchema.shape,
})

export type DocumentFormData = z.infer<typeof documentSchema>
export type DocumentUploadData = z.infer<typeof documentUploadSchema> 