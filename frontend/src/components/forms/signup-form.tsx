'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { signUpSchema, type SignUpInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'
import { createUserProfile } from '@/lib/utils/profile'

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Inscription de l'utilisateur avec Supabase
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          }
        }
      })

      if (signUpError) {
        throw new Error(signUpError.message)
      }

      if (authData.user) {
        // Créer le profil utilisateur avec la fonction utilitaire
        const profileResult = await createUserProfile(
          authData.user.id,
          data.email,
          data.fullName
        )

        if (!profileResult.success) {
          console.warn('Erreur création profil:', profileResult.error)
          // On ne bloque pas l'inscription, le profil peut être créé plus tard
        }

        setSuccess(true)
      }
    } catch (err) {
      console.error('Erreur d\'inscription:', err)
      if (err instanceof Error) {
        if (err.message.includes('User already registered')) {
          setError('Un compte existe déjà avec cette adresse email')
        } else if (err.message.includes('Password should be at least')) {
          setError('Le mot de passe doit contenir au moins 6 caractères')
        } else if (err.message.includes('Signup is disabled')) {
          setError('Les inscriptions sont temporairement désactivées')
        } else if (err.message.includes('Invalid email')) {
          setError('L\'adresse email n\'est pas valide')
        } else {
          setError('Erreur lors de la création du compte. Veuillez réessayer.')
        }
      } else {
        setError('Erreur lors de la création du compte. Veuillez réessayer.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="border-0 bg-card/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
              <span className="text-3xl">✅</span>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-success">Compte créé !</CardTitle>
              <CardDescription className="text-muted-foreground">
                Vérifiez votre email pour confirmer votre compte
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-3 border border-border/50">
              <div className="text-4xl">📧</div>
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  Email de confirmation envoyé
                </p>
                <p className="text-sm text-muted-foreground">
                  Cliquez sur le lien dans l'email pour activer votre compte DocVault.
                </p>
                <p className="text-xs text-muted-foreground bg-warning/10 p-2 rounded border border-warning/20">
                  💡 Pensez à vérifier vos spams si vous ne recevez pas l'email.
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button asChild variant="gradient" className="w-full h-11">
                <Link href="/signin">
                  <span className="mr-2">←</span>
                  Retour à la connexion
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  Retour à l'accueil
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 bg-card/95 backdrop-blur-sm shadow-xl">
      <CardHeader className="space-y-4 text-center pb-6">
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription className="text-muted-foreground">
            Rejoignez DocVault et sécurisez vos documents
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Nom complet
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Jean Dupont"
              disabled={isLoading}
              className="h-11 focus-visible-ring"
              {...register('fullName')}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <span className="w-4 h-4">⚠️</span>
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Adresse email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              disabled={isLoading}
              className="h-11 focus-visible-ring"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <span className="w-4 h-4">⚠️</span>
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••••"
                disabled={isLoading}
                className="h-11 focus-visible-ring"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <span className="w-4 h-4">⚠️</span>
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmer
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••••"
                disabled={isLoading}
                className="h-11 focus-visible-ring"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <span className="w-4 h-4">⚠️</span>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-r from-success/10 to-primary/10 p-4 rounded-lg border border-success/20">
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">🎁</span>
              <div className="space-y-2">
                <p className="text-sm font-medium text-success">Compte gratuit inclus :</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
                    5 documents gratuits
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
                    Stockage sécurisé chiffré
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
                    Rappels automatiques
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
              <span className="w-5 h-5 flex-shrink-0 mt-0.5">🚨</span>
              <span>{error}</span>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-11 font-medium" 
            variant="gradient"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Création...
              </>
            ) : (
              <>
                <span className="mr-2">🚀</span>
                Créer mon compte gratuit
              </>
            )}
          </Button>
        </form>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Déjà inscrit ?</span>
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <span>Vous avez déjà un compte ?</span>
              <Link 
                href="/signin" 
                className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 hover:underline-offset-2 transition-all"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 