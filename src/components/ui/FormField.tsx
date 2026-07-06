import * as React from "react"

import { cn } from "@/lib/utils"

export interface FormFieldProps {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
  className?: string
  /**
   * Self-contained "label above input" block instead of the default
   * `display: contents` label-left layout. Use inside a responsive multi-column
   * grid so each field occupies a single grid cell (e.g. the registration form).
   */
  stacked?: boolean
}

export function FormField({
  label,
  required,
  hint,
  error,
  children,
  className,
  stacked,
}: FormFieldProps) {
  const body = (
    <>
      {children}
      {hint && <p className="pats-form-hint">{hint}</p>}
      {error && (
        <p className="pats-form-error" role="alert">
          {error}
        </p>
      )}
    </>
  )

  if (stacked) {
    return (
      <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
        <label className="pats-form-label">
          {label}
          {required && <span className="ml-1 text-cp-alert">*</span>}
        </label>
        <div className="flex flex-col gap-1">{body}</div>
      </div>
    )
  }

  return (
    <div className={cn("contents", className)}>
      <label className="pats-form-label pt-2">
        {label}
        {required && <span className="ml-1 text-cp-alert">*</span>}
      </label>
      <div className="flex flex-col gap-1">{body}</div>
    </div>
  )
}
