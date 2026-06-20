import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full border border-transparent text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/55 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-primary/40 bg-primary text-primary-foreground hover:border-primary/70 hover:bg-primary/90",
        destructive:
          "border-destructive/45 bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border-border/80 bg-transparent text-foreground hover:border-primary/40 hover:bg-command-raised hover:text-accent-foreground",
        secondary:
          "border-border/75 bg-secondary text-secondary-foreground hover:border-primary/30 hover:bg-secondary/80",
        ghost:
          "border-transparent hover:border-border/70 hover:bg-command-raised hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        soft: "border-border/75 bg-card text-foreground hover:border-primary/35 hover:bg-command-raised",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "size-10",
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
