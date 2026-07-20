"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
} from "@/lib/constants";
import { apiErrorMessage } from "@/lib/i18n/api-error-i18n";
import { useI18n } from "@/lib/i18n/I18nProvider";

const CATEGORY_KEYS = Object.keys(TICKET_CATEGORY_LABELS);
const PRIORITY_KEYS = Object.keys(TICKET_PRIORITY_LABELS);

export function NewTicketForm({
  open: openProp,
  onOpenChange,
}: {
  /** Controlled open state. Omit for self-managed (uncontrolled) behaviour. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
} = {}) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const tk = t.tickets;
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (value: boolean) => {
    setOpenState(value);
    onOpenChange?.(value);
  };
  const [submitting, setSubmitting] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [priority, setPriority] = useState("NORMAL");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reset = () => {
    setSubject("");
    setCategory("GENERAL");
    setPriority("NORMAL");
    setMessage("");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category, priority, message }),
      });
      if (res.ok) {
        const { ticket } = await res.json();
        toast.success(tk.form.toastRaised);
        reset();
        setOpen(false);
        router.push(`/event/tickets/${ticket.id}`);
        return;
      }
      const body = await res.json();
      if (body.errors) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(
          body.errors as Record<string, string[]>
        )) {
          flat[k] = v[0];
        }
        setErrors(flat);
      } else {
        toast.error(apiErrorMessage(body, locale, t.common.toasts.genericError));
      }
    } catch {
      toast.error(t.common.toasts.genericError);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="portal-form-card mx-auto w-full max-w-xl space-y-5 !rounded-2xl"
    >
      <h2 className="portal-section-title border-b border-brand-line pb-3">
        {tk.form.title}
      </h2>

      <FormField label={tk.form.subject} required error={errors.subject}>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={tk.form.subjectPlaceholder}
          maxLength={150}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label={tk.form.category} error={errors.category}>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_KEYS.map((value) => (
                <SelectItem key={value} value={value}>
                  {tk.categories[value as keyof typeof tk.categories]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label={tk.form.priority} error={errors.priority}>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_KEYS.map((value) => (
                <SelectItem key={value} value={value}>
                  {tk.priorities[value as keyof typeof tk.priorities]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <FormField label={tk.form.help} required error={errors.message}>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder={tk.form.helpPlaceholder}
          maxLength={5000}
        />
      </FormField>

      <div className="flex justify-end gap-3 border-t border-brand-line pt-5">
        <Button
          type="button"
          variant="outline"
          className="!rounded-lg border-slate-300 text-slate-600 hover:bg-slate-50"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          disabled={submitting}
        >
          {tk.form.cancel}
        </Button>
        <Button
          type="submit"
          className="cp-btn-primary !rounded-lg px-6"
          disabled={submitting}
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {tk.form.submit}
        </Button>
      </div>
    </form>
  );
}
