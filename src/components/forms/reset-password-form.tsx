'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'

export function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        data.email,
        {
          redirectTo: `${window.location.origin}/update-password`,
        }
      )

      if (resetError) {
        throw resetError
      }

      setSuccess(true)
    } catch (err) {
      console.error('Erreur réinitialisation:', err)
      if (err instanceof Error) {
        if (err.message.includes('Email not found')) {
          setError('Aucun compte trouvé avec cette adresse email')
        } else if (err.message.includes('Email rate limit exceeded')) {
          setError('Trop de demandes. Veuillez attendre avant de réessayer')
        } else {
          setError('Erreur lors de l\'envoi de l\'email. Veuillez réessayer.')
        }
      } else {
        setError('Erreur lors de l\'envoi de l\'email. Veuillez réessayer.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-green-600">Email envoyé !</CardTitle>
          <CardDescription className="text-center">
            Vérifiez votre boîte de réception
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="text-6xl">📧</div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Un email avec les instructions de réinitialisation a été envoyé.
              </p>
              <p className="text-sm text-muted-foreground">
                Cliquez sur le lien dans l'email pour définir un nouveau mot de passe.
              </p>
              <p className="text-xs text-muted-foreground">
                Si vous ne recevez pas l'email, vérifiez vos spams.
              </p>
            </div>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/signin">
                  Retour à la connexion
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSuccess(false)
                  setError(null)
                }}
              >
                Renvoyer un email
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Mot de passe oublié</CardTitle>
        <CardDescription className="text-center">
          Entrez votre email pour recevoir un lien de réinitialisation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="exemple@email.com"
              disabled={isLoading}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Vous vous souvenez de votre mot de passe ?{' '}
            <Link href="/signin" className="text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 