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
import { signInSchema, type SignInInput } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/client'

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  })


  const onSubmit = async (data: SignInInput) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (signInError) {
        throw new Error(signInError.message)
      }

      if (authData.user) {
        // Redirection vers le dashboard
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      console.error('Erreur de connexion:', err)
      if (err instanceof Error) {
        if (err.message.includes('Invalid login credentials')) {
          setError('Email ou mot de passe incorrect')
        } else if (err.message.includes('Email not confirmed')) {
          setError('Veuillez confirmer votre email avant de vous connecter')
        } else if (err.message.includes('Too many requests')) {
          setError('Trop de tentatives. Veuillez attendre quelques minutes')
        } else {
          setError('Erreur lors de la connexion. Veuillez réessayer.')
        }
      } else {
        setError('Erreur lors de la connexion. Veuillez réessayer.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-0 bg-card/95 backdrop-blur-sm shadow-xl">
      <CardHeader className="space-y-4 text-center pb-6">
        <div className="space-y-2">
          <CardTitle className="text-2xl font-bold">Bon retour !</CardTitle>
          <CardDescription className="text-muted-foreground">
            Connectez-vous à votre espace DocVault
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                Connexion...
              </>
            ) : (
              <>
                Se connecter
                <span className="ml-2">→</span>
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
              <span className="bg-card px-2 text-muted-foreground">Liens utiles</span>
            </div>
          </div>

          <div className="text-center space-y-3">
            <Link 
              href="/reset-password" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors group"
            >
              <span className="mr-1">🔑</span>
              Mot de passe oublié ?
              <span className="ml-1 group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <span>Nouveau sur DocVault ?</span>
              <Link 
                href="/signup" 
                className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 hover:underline-offset-2 transition-all"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 