import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const opsVariants = [
  "adminPrimary",
  "adminApprove",
  "adminOutline",
  "adminDestructive",
  "adminWarning",
  "tacticalPrimary",
  "tacticalSecondary",
  "tacticalDanger",
] as const

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "rounded-md bg-primary text-sm font-medium text-primary-foreground shadow transition-colors duration-100 hover:bg-primary/90 active:scale-[0.98] active:duration-75 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 touch-manipulation",
        destructive:
          "rounded-md bg-destructive text-sm font-medium text-destructive-foreground shadow-sm transition-colors duration-100 hover:bg-destructive/90 active:scale-[0.98] active:duration-75 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 touch-manipulation",
        outline:
          "rounded-md border border-input bg-background text-sm font-medium shadow-sm transition-colors duration-100 hover:bg-accent hover:text-accent-foreground active:scale-[0.98] active:duration-75 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 touch-manipulation",
        secondary:
          "rounded-md bg-secondary text-sm font-medium text-secondary-foreground shadow-sm transition-colors duration-100 hover:bg-secondary/80 active:scale-[0.98] active:duration-75 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 touch-manipulation",
        ghost:
          "rounded-md text-sm font-medium transition-colors duration-100 hover:bg-accent hover:text-accent-foreground active:scale-[0.98] active:duration-75 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 touch-manipulation",
        link: "text-sm font-medium text-primary underline-offset-4 transition-colors duration-100 hover:underline touch-manipulation",
        adminPrimary: "ops-btn ops-btn-primary",
        adminApprove: "ops-btn ops-btn-approve",
        /** Compact approve for tables and dashboard lists — not full ops-btn height */
        adminApproveCompact: "admin-approve-btn",
        adminOutline: "ops-btn ops-btn-secondary",
        adminDestructive: "ops-btn ops-btn-danger",
        adminWarning: "ops-btn ops-btn-warning",
        tacticalPrimary: "ops-btn ops-btn-primary",
        tacticalSecondary: "ops-btn ops-btn-secondary",
        tacticalDanger: "ops-btn ops-btn-danger",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    compoundVariants: [
      {
        variant: [...opsVariants],
        size: "default",
        class: "ops-btn-md !h-auto !min-h-[2.75rem] !px-5 !py-2.5 !text-sm",
      },
      {
        variant: [...opsVariants],
        size: "sm",
        class: "ops-btn-sm !h-auto !min-h-[2.5rem] !px-4 !py-2 !text-[0.8125rem]",
      },
      {
        variant: [...opsVariants],
        size: "lg",
        class: "ops-btn-lg !h-auto !min-h-[3rem] !px-6 !py-3 !text-[0.9375rem]",
      },
      {
        variant: [...opsVariants],
        size: "icon",
        class: "!min-h-[2.75rem] !w-[2.75rem] !p-0",
      },
    ],
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
