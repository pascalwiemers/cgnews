import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50",
  {
    variants: {
      variant: {
        default:
          "border-primary/35 bg-primary/10 text-primary hover:border-primary/55 hover:bg-primary/15",
        secondary:
          "border-border/75 bg-secondary text-secondary-foreground hover:border-primary/30 hover:bg-secondary/80",
        destructive:
          "border-destructive/40 bg-destructive/15 text-destructive-foreground hover:bg-destructive/20",
        outline: "border-border/75 text-muted-foreground hover:text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
