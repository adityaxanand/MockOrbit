import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80", // Added shadow
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80", // Added shadow
        outline: "text-foreground border-border", // Use border color from theme
        success: // Example custom variant (add HSL variables in globals.css if needed)
          "border-transparent bg-green-500 text-white shadow hover:bg-green-500/80 dark:bg-green-600 dark:hover:bg-green-600/80",
        warning:
            "border-transparent bg-yellow-500 text-black shadow hover:bg-yellow-500/80 dark:bg-yellow-600 dark:text-white dark:hover:bg-yellow-600/80",

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
