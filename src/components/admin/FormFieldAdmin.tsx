import * as React from "react";

import { cn } from "@/lib/utils";

export interface FormFieldAdminProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormFieldAdmin({
  label,
  required,
  hint,
  error,
  children,
  className,
}: FormFieldAdminProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="admin-label block text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-cp-ink-muted">{hint}</p>}
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
