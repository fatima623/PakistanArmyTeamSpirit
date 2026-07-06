"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export interface ConfirmDialogProps {
  trigger: React.ReactNode
  title: string
  description: string
  onConfirm: () => void | Promise<void>
  confirmLabel?: string
  confirmClassName?: string
  cancelLabel?: string
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  onConfirm,
  confirmLabel = "Confirm",
  confirmClassName,
  cancelLabel = "Cancel",
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="border-cp-border bg-white text-cp-ink shadow-[0_8px_30px_rgba(28,33,25,0.12)]">
        <AlertDialogHeader>
          <AlertDialogTitle className="uppercase tracking-wide text-cp-ink">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-cp-ink-muted">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="admin-dialog-cancel">
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => void onConfirm()}
            className={confirmClassName ?? "admin-dialog-confirm"}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
