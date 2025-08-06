'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { updatePasswordSchema, type UpdatePasswordInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'

export function UpdatePasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isValidSession, setIsValidSession] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
  })

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Vérifier si l'utilisateur est connecté et autorisé à changer son mot de passe
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          setError('Session invalide ou expirée. Veuillez demander un nouveau lien de réinitialisation.')
          setIsValidSession(false)
        } else {
          setIsValidSession(true)
        }
      } catch (err) {
        console.error('Erreur vérification session:', err)
        setError('Erreur lors de la vérification de la session.')
        setIsValidSession(false)
      } finally {
        setIsCheckingSession(false)
      }
    }

    checkSession()
  }, [supabase.auth])

  const onSubmit = async (data: UpdatePasswordInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password
      })

      if (updateError) {
        throw updateError
      }

      setSuccess(true)
    } catch (err) {
      console.error('Erreur mise à jour mot de passe:', err)
      if (err instanceof Error) {
        if (err.message.includes('Password should be at least')) {
          setError('Le mot de passe doit contenir au moins 6 caractères')
        } else if (err.message.includes('same as the old password')) {
          setError('Le nouveau mot de passe doit être différent de l\'ancien')
        } else {
          setError('Erreur lors de la mise à jour du mot de passe. Veuillez réessayer.')
        }
      } else {
        setError('Erreur lors de la mise à jour du mot de passe. Veuillez réessayer.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingSession) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-muted-foreground">Vérification...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isValidSession) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-destructive">Session invalide</CardTitle>
          <CardDescription className="text-center">
            Le lien de réinitialisation a expiré ou est invalide
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="text-6xl">⚠️</div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Le lien de réinitialisation que vous avez utilisé n'est plus valide.
              </p>
              <p className="text-sm text-muted-foreground">
                Veuillez demander un nouveau lien de réinitialisation.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/reset-password">
                Demander un nouveau lien
              </Link>
            </Button>
          </div>
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded mt-4">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (success) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-green-600">Mot de passe mis à jour !</CardTitle>
          <CardDescription className="text-center">
            Votre mot de passe a été modifié avec succès
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="text-6xl">✅</div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Votre mot de passe a été mis à jour avec succès.
              </p>
              <p className="text-sm text-muted-foreground">
                Vous pouvez maintenant utiliser votre nouveau mot de passe pour vous connecter.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href="/dashboard">
                Accéder au tableau de bord
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Nouveau mot de passe</CardTitle>
        <CardDescription className="text-center">
          Choisissez un nouveau mot de passe sécurisé
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
            <strong>Mot de passe sécurisé :</strong>
            <ul className="mt-1 space-y-1">
              <li>• Au moins 8 caractères</li>
              <li>• Une majuscule et une minuscule</li>
              <li>• Au moins un chiffre</li>
            </ul>
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            <Link href="/signin" className="text-primary hover:underline">
              Retour à la connexion
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 