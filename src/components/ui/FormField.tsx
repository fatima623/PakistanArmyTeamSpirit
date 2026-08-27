import * as React from "react"

import { cn } from "@/lib/utils"

export interface FormFieldProps {
  label: string
  /**
   * The form field this block wraps. Rendered as `data-field`, which is how a
   * failed submit finds the first invalid block to scroll to and focus — the
   * control inside may be a Radix trigger or a combobox with no ref of its own,
   * so react-hook-form cannot reach it.
   */
  name?: string
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
  name,
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
      <div
        data-field={name}
        className={cn("flex min-w-0 flex-col gap-1.5", className)}
      >
        <label className="pats-form-label">
          {label}
          {required && (
            <strong className="ml-1 text-red-500" aria-hidden>
              *
            </strong>
          )}
        </label>
        <div className="flex flex-col gap-1">{body}</div>
      </div>
    )
  }

  return (
    <div data-field={name} className={cn("contents", className)}>
      <label className="pats-form-label pt-2">
        {label}
        {required && <span className="ml-1 text-brand-red">*</span>}
      </label>
      <div className="flex flex-col gap-1">{body}</div>
    </div>
  )
}
