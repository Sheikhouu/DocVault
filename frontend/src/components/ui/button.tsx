import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] hover-lift",
  {
    variants: {
      variant: {
        // Primary - Bleu DocVault principal
        default: "bg-primary text-primary-foreground shadow-md hover:bg-primary-hover hover:shadow-lg transform-gpu",
        primary: "bg-primary text-primary-foreground shadow-md hover:bg-primary-hover hover:shadow-lg transform-gpu",
        
        // Secondary - Gris élégant
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary-hover hover:shadow-md border border-border/50",
        
        // Outline - Bordure avec effet hover
        outline: "border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground hover:shadow-md transition-all duration-200",
        
        // Ghost - Minimal avec hover subtil
        ghost: "text-foreground hover:bg-primary-soft hover:text-primary-soft transition-all duration-200",
        
        // Accent - Violet vibrant
        accent: "bg-accent text-accent-foreground shadow-md hover:bg-accent/90 hover:shadow-lg",
        
        // Link - Style texte
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-hover font-normal",
        
        // États de statut avec nouvelles couleurs
        destructive: "bg-destructive text-destructive-foreground shadow-md hover:bg-red-600 hover:shadow-lg",
        success: "bg-success text-success-foreground shadow-md hover:bg-green-600 hover:shadow-lg",
        warning: "bg-warning text-warning-foreground shadow-md hover:bg-orange-600 hover:shadow-lg",
        
        // Gradients DocVault
        gradient: "bg-gradient-brand text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transform-gpu",
        "gradient-accent": "bg-gradient-accent text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transform-gpu",
        "gradient-subtle": "bg-gradient-subtle text-foreground border border-border hover:shadow-md",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-md",
        "icon-lg": "h-12 w-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants } 