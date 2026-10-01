"use client";

import { Fragment, useState } from "react";
import { ArrowLeft, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { FormFieldAdmin } from "@/components/admin/FormFieldAdmin";
import {
  // TranslationFields, // translations UI hidden per request (do not delete)
  useTranslationDraft,
} from "@/components/admin/TranslationFields";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminInput, adminTableActionsCenter, adminTextarea } from "@/lib/admin-ui";
import { TOAST } from "@/lib/toast";

type Faq = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  published: boolean;
};

function nextSortOrder(faqs: Faq[]) {
  if (faqs.length === 0) return 0;
  return Math.max(...faqs.map((f) => f.sortOrder)) + 1;
}

const emptyForm = (sortOrder: number) => ({
  question: "",
  answer: "",
  sortOrder,
  published: true,
});

export function FaqsManager({ initialFaqs }: { initialFaqs: Faq[] }) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    question: "",
    answer: "",
    sortOrder: 0,
    published: true,
  });
  const [addForm, setAddForm] = useState(() => emptyForm(nextSortOrder(initialFaqs)));
  const [saving, setSaving] = useState(false);
  // Two drafts, because both editors can be on screen at once: the add form
  // stays mounted (so it needs an explicit reset), while the inline edit draft
  // reloads whenever a different row is opened.
  const addTranslations = useTranslationDraft();
  const editTranslations = useTranslationDraft({
    url: editingId ? `/api/admin/faqs/${editingId}` : null,
  });

  const startEdit = (faq: Faq) => {
    setEditingId(faq.id);
    setEditForm({
      question: faq.question,
      answer: faq.answer,
      sortOrder: faq.sortOrder,
      published: faq.published,
    });
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          translations: editTranslations.payload(),
        }),
      });
      if (res.ok) {
        const { faq } = await res.json();
        setFaqs((prev) =>
          prev
            .map((f) => (f.id === id ? faq : f))
            .sort((a, b) => a.sortOrder - b.sortOrder)
        );
        setEditingId(null);
        toast.success(TOAST.SAVE_SUCCESS);
      } else {
        toast.error(TOAST.GENERIC_ERROR);
      }
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setSaving(false);
    }
  };

  const deleteFaq = async (id: string) => {
    const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
    if (res.ok) {
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      toast.success(TOAST.DELETE_SUCCESS);
    } else {
      toast.error(TOAST.GENERIC_ERROR);
    }
  };

  const addFaq = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addForm,
          translations: addTranslations.payload(),
        }),
      });
      if (res.ok) {
        const { faq } = await res.json();
        const updated = [...faqs, faq].sort((a, b) => a.sortOrder - b.sortOrder);
        setFaqs(updated);
        setAddForm(emptyForm(nextSortOrder(updated)));
        addTranslations.reset();
        setShowAddForm(false);
        toast.success(TOAST.SAVE_SUCCESS);
      } else {
        toast.error(TOAST.GENERIC_ERROR);
      }
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setSaving(false);
    }
  };

  const canAdd =
    addForm.question.trim().length > 0 && addForm.answer.trim().length > 0;

  // Adding an FAQ takes over the whole view with a centered, form-only layout
  // (matching /admin/key-dates) — the list of existing entries is hidden while
  // you fill in a new one.
  if (showAddForm) {
    return (
      <div className="mx-auto flex w-full max-w-[52rem] flex-col gap-[0.85rem] pb-8">
        <header className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 rounded-[14px] border border-brand-line/60 bg-white px-5 py-4 shadow-[0_1px_3px_rgba(20,30,24,0.05)]">
          <div className="min-w-0 flex-[1_1_16rem]">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="mb-1.5 inline-flex items-center text-[0.78rem] font-medium text-muted-foreground no-underline transition-colors hover:text-green-800"
            >
              <ArrowLeft className="mr-1 inline h-3.5 w-3.5" aria-hidden />
              Back to FAQs
            </button>
            <h1 className="m-0 text-[1.375rem] font-extrabold leading-[1.2] tracking-[-0.02em] text-brand-ink">
              Add a new FAQ
            </h1>
            <p className="mt-1 text-[0.8rem] leading-[1.4] text-muted-foreground">
              Participants see these in the “Queries / FAQs” view, above the
              query list. Keep each answer short and to the point.
            </p>
          </div>
        </header>

        <section className="rounded-[14px] border border-brand-line/60 bg-white shadow-[0_1px_3px_rgba(20,30,24,0.05)]">
          <div className="rounded-t-[14px] border-b border-brand-line/60 bg-muted/40 px-[1.1rem] py-[0.7rem]">
            <h3 className="m-0 text-sm font-bold tracking-[-0.01em] text-brand-ink">
              FAQ entry
            </h3>
          </div>
          <div className="flex flex-col gap-5 px-[1.1rem] pb-4 pt-[0.9rem]">
            <FormFieldAdmin
              label="Question"
              required
              hint="The question as a participant would ask it."
            >
              <Textarea
                value={addForm.question}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, question: e.target.value }))
                }
                className={adminTextarea}
                rows={2}
                placeholder="e.g. How do I get an account for the PATS portal?"
              />
            </FormFieldAdmin>

            <FormFieldAdmin
              label="Answer"
              required
              hint="The answer shown when the question is expanded."
            >
              <Textarea
                value={addForm.answer}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, answer: e.target.value }))
                }
                className={adminTextarea}
                rows={5}
                placeholder="Write the answer participants will read."
              />
            </FormFieldAdmin>

            <div className="flex flex-wrap items-end gap-6">
              <FormFieldAdmin label="Display order" className="max-w-32">
                <Input
                  type="number"
                  min={0}
                  value={addForm.sortOrder}
                  onChange={(e) =>
                    setAddForm((f) => ({
                      ...f,
                      sortOrder: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className={adminInput}
                />
              </FormFieldAdmin>

              <label className="flex items-center gap-2 pb-2 text-[0.85rem] font-medium text-brand-ink">
                <input
                  type="checkbox"
                  checked={addForm.published}
                  onChange={(e) =>
                    setAddForm((f) => ({ ...f, published: e.target.checked }))
                  }
                  className="h-4 w-4 accent-green-700"
                />
                Published (visible to participants)
              </label>
            </div>

            {/* Translations UI hidden per request (do not delete)
            <TranslationFields
              model="Faq"
              draft={addTranslations}
              idPrefix="faq-t-new"
            />
            */}
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="adminOutline"
            onClick={() => setShowAddForm(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={addFaq}
            disabled={saving || !canAdd}
            variant="adminPrimary"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add FAQ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <section className="admin-surface p-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="[&>p]:mt-1.5 [&>p]:max-w-[40rem] [&>p]:text-sm [&>p]:leading-normal [&>p]:text-muted-foreground">
            <h2 className="text-[1.75rem] font-bold tracking-[-0.01em] text-brand-ink">
              Frequently asked questions ({faqs.length})
            </h2>
            <p>
              These entries appear in the participant “Queries / FAQs” view.
              Changes go live immediately.
            </p>
          </div>
          <Button variant="adminPrimary" onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            Add FAQ
          </Button>
        </header>

        <div className="overflow-x-auto rounded-[10px] border border-black/[0.06]">
          <table className="admin-data-table">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[44%]" />
              <col className="w-[8%]" />
              <col className="w-[8%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Question</th>
                <th scope="col">Answer</th>
                <th scope="col">Order</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-muted-foreground"
                  >
                    No FAQs yet. Click “Add FAQ” to create your first entry.
                  </td>
                </tr>
              ) : (
                faqs.map((faq) => (
                  <Fragment key={faq.id}>
                    <tr>
                      {editingId === faq.id ? (
                        <>
                          <td>
                            <Textarea
                              value={editForm.question}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  question: e.target.value,
                                }))
                              }
                              rows={2}
                              className={adminTextarea}
                              aria-label="Edit question"
                            />
                          </td>
                          <td>
                            <Textarea
                              value={editForm.answer}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  answer: e.target.value,
                                }))
                              }
                              rows={4}
                              className={adminTextarea}
                              aria-label="Edit answer"
                            />
                          </td>
                          <td>
                            <Input
                              type="number"
                              value={editForm.sortOrder}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  sortOrder: parseInt(e.target.value, 10) || 0,
                                }))
                              }
                              className={`${adminInput} max-w-[5rem]`}
                              aria-label="Edit display order"
                            />
                          </td>
                          <td>
                            <label className="flex items-center justify-center gap-1.5 text-[0.75rem] font-medium text-brand-ink">
                              <input
                                type="checkbox"
                                checked={editForm.published}
                                onChange={(e) =>
                                  setEditForm((f) => ({
                                    ...f,
                                    published: e.target.checked,
                                  }))
                                }
                                className="h-4 w-4 accent-green-700"
                                aria-label="Edit published"
                              />
                              Live
                            </label>
                          </td>
                          <td>
                            <div
                              className={adminTableActionsCenter}
                              role="group"
                              aria-label="Save or cancel edit"
                            >
                              <Button
                                size="sm"
                                variant="adminPrimary"
                                onClick={() => saveEdit(faq.id)}
                                disabled={saving}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="adminOutline"
                                onClick={() => setEditingId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="font-semibold text-brand-ink">
                            {faq.question}
                          </td>
                          <td className="leading-[1.45] text-muted-foreground">
                            {faq.answer}
                          </td>
                          <td className="tabular-nums text-muted-foreground">
                            {faq.sortOrder}
                          </td>
                          <td className="text-center">
                            {faq.published ? (
                              <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-[0.7rem] font-semibold text-green-800">
                                Live
                              </span>
                            ) : (
                              <span className="inline-block rounded-full bg-black/[0.06] px-2 py-0.5 text-[0.7rem] font-semibold text-muted-foreground">
                                Hidden
                              </span>
                            )}
                          </td>
                          <td>
                            <div
                              className={adminTableActionsCenter}
                              role="group"
                              aria-label="Row actions"
                            >
                              <Button
                                size="sm"
                                variant="adminOutline"
                                className="portal-table-action-btn portal-table-action-btn--view portal-table-action-btn--icon"
                                onClick={() => startEdit(faq)}
                                aria-label="Edit FAQ"
                                title="Edit FAQ"
                              >
                                <Pencil className="h-4 w-4" aria-hidden />
                              </Button>
                              <ConfirmDialog
                                trigger={
                                  <Button
                                    size="sm"
                                    variant="adminDestructive"
                                    className="portal-table-action-btn portal-table-action-btn--danger portal-table-action-btn--icon"
                                    aria-label="Delete FAQ"
                                    title="Delete FAQ"
                                  >
                                    <Trash2 className="h-4 w-4" aria-hidden />
                                  </Button>
                                }
                                title="Delete FAQ?"
                                description="This cannot be undone."
                                confirmLabel="Delete"
                                onConfirm={() => deleteFaq(faq.id)}
                              />
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                    {/* Translations edit row hidden per request (do not delete)
                    {editingId === faq.id ? (
                      <tr>
                        <td colSpan={5} className="bg-brand-parchment/20">
                          <TranslationFields
                            model="Faq"
                            draft={editTranslations}
                            idPrefix={`faq-t-${faq.id}`}
                          />
                        </td>
                      </tr>
                    ) : null}
                    */}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
