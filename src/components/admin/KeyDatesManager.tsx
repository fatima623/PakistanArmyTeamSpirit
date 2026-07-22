"use client";

import { Fragment, useState } from "react";
import { ArrowLeft, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { FormFieldAdmin } from "@/components/admin/FormFieldAdmin";
import {
  TranslationFields,
  useTranslationDraft,
} from "@/components/admin/TranslationFields";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminInput, adminTableActionsCenter, adminTextarea } from "@/lib/admin-ui";
import { TOAST } from "@/lib/toast";

type KeyDate = {
  id: string;
  label: string;
  value: string;
  sortOrder: number;
};

function nextSortOrder(dates: KeyDate[]) {
  if (dates.length === 0) return 0;
  return Math.max(...dates.map((k) => k.sortOrder)) + 1;
}

export function KeyDatesManager({
  initialKeyDates,
}: {
  initialKeyDates: KeyDate[];
}) {
  const [keyDates, setKeyDates] = useState(initialKeyDates);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ label: "", value: "", sortOrder: 0 });
  const [addForm, setAddForm] = useState({
    label: "",
    value: "",
    sortOrder: nextSortOrder(initialKeyDates),
  });
  const [saving, setSaving] = useState(false);
  // Two drafts, because both editors can be on screen at once: the add form
  // stays mounted (so it needs an explicit reset), while the inline edit draft
  // reloads whenever a different row is opened.
  const addTranslations = useTranslationDraft();
  const editTranslations = useTranslationDraft({
    url: editingId ? `/api/admin/key-dates/${editingId}` : null,
  });

  const startEdit = (kd: KeyDate) => {
    setEditingId(kd.id);
    setEditForm({
      label: kd.label,
      value: kd.value,
      sortOrder: kd.sortOrder,
    });
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/key-dates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editForm,
          translations: editTranslations.payload(),
        }),
      });
      if (res.ok) {
        const { keyDate } = await res.json();
        setKeyDates((prev) =>
          prev
            .map((k) => (k.id === id ? keyDate : k))
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

  const deleteKeyDate = async (id: string) => {
    const res = await fetch(`/api/admin/key-dates/${id}`, { method: "DELETE" });
    if (res.ok) {
      setKeyDates((prev) => prev.filter((k) => k.id !== id));
      toast.success(TOAST.DELETE_SUCCESS);
    } else {
      toast.error(TOAST.GENERIC_ERROR);
    }
  };

  const addKeyDate = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/key-dates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addForm,
          translations: addTranslations.payload(),
        }),
      });
      if (res.ok) {
        const { keyDate } = await res.json();
        const updated = [...keyDates, keyDate].sort(
          (a, b) => a.sortOrder - b.sortOrder
        );
        setKeyDates(updated);
        setAddForm({
          label: "",
          value: "",
          sortOrder: nextSortOrder(updated),
        });
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

  const canAdd = addForm.label.trim().length > 0 && addForm.value.trim().length > 0;

  // Adding a key date takes over the whole view with a centered, form-only
  // layout (matching /admin/ticker/new) — the list of existing dates is hidden
  // while you fill in a new one.
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
              Back to key dates
            </button>
            <h1 className="m-0 text-[1.375rem] font-extrabold leading-[1.2] tracking-[-0.02em] text-brand-ink">
              Add a new key date
            </h1>
            <p className="mt-1 text-[0.8rem] leading-[1.4] text-muted-foreground">
              Give each entry a short label (shown in the left column on the
              public page) and a value (the date or description shown beside it).
            </p>
          </div>
        </header>

        <section className="rounded-[14px] border border-brand-line/60 bg-white shadow-[0_1px_3px_rgba(20,30,24,0.05)]">
          <div className="rounded-t-[14px] border-b border-brand-line/60 bg-muted/40 px-[1.1rem] py-[0.7rem]">
            <h3 className="m-0 text-sm font-bold tracking-[-0.01em] text-brand-ink">
              Key date
            </h3>
          </div>
          <div className="flex flex-col gap-5 px-[1.1rem] pb-4 pt-[0.9rem]">
            <FormFieldAdmin
              label="Label"
              required
              hint='Short heading, e.g. "JLs" or "Refunds".'
            >
              <Input
                value={addForm.label}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, label: e.target.value }))
                }
                className={adminInput}
                placeholder="e.g. Junior Leaders Seminar"
              />
            </FormFieldAdmin>

            <FormFieldAdmin
              label="Value"
              required
              hint="The date or text visitors will read next to the label."
            >
              <Textarea
                value={addForm.value}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, value: e.target.value }))
                }
                className={adminTextarea}
                rows={4}
                placeholder="e.g. 31 July 2026"
              />
            </FormFieldAdmin>

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

            <TranslationFields
              model="KeyDate"
              draft={addTranslations}
              idPrefix="kd-t-new"
            />
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
            onClick={addKeyDate}
            disabled={saving || !canAdd}
            variant="adminPrimary"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add key date
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
            <h2 className="text-[1.75rem] font-bold tracking-[-0.01em] text-brand-ink">Configured dates ({keyDates.length})</h2>
            <p>
              These entries appear on the public key dates page. Visitors see the
              label and value you enter.
            </p>
          </div>
          <Button variant="adminPrimary" onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            Add key date
          </Button>
        </header>

        <div className="overflow-x-auto rounded-[10px] border border-black/[0.06]">
          <table className="admin-data-table">
            <colgroup>
              <col className="w-[18%]" />
              <col className="w-[52%]" />
              <col className="w-[10%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Label</th>
                <th scope="col">Value</th>
                <th scope="col">Order</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keyDates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                    No key dates yet. Click “Add key date” to create your first entry.
                  </td>
                </tr>
              ) : (
                keyDates.map((kd) => (
                  <Fragment key={kd.id}>
                  <tr>
                    {editingId === kd.id ? (
                      <>
                        <td>
                          <Input
                            value={editForm.label}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                label: e.target.value,
                              }))
                            }
                            className={adminInput}
                            aria-label="Edit label"
                          />
                        </td>
                        <td>
                          <Textarea
                            value={editForm.value}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                value: e.target.value,
                              }))
                            }
                            rows={3}
                            className={adminTextarea}
                            aria-label="Edit value"
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
                          <div
                            className={adminTableActionsCenter}
                            role="group"
                            aria-label="Save or cancel edit"
                          >
                            <Button
                              size="sm"
                              variant="adminPrimary"
                              onClick={() => saveEdit(kd.id)}
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
                        <td className="font-semibold text-brand-ink">{kd.label}</td>
                        <td className="leading-[1.45] text-muted-foreground">{kd.value}</td>
                        <td className="tabular-nums text-muted-foreground">{kd.sortOrder}</td>
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
                              onClick={() => startEdit(kd)}
                              aria-label="Edit key date"
                              title="Edit key date"
                            >
                              <Pencil className="h-4 w-4" aria-hidden />
                            </Button>
                            <ConfirmDialog
                              trigger={
                                <Button
                                  size="sm"
                                  variant="adminDestructive"
                                  className="portal-table-action-btn portal-table-action-btn--danger portal-table-action-btn--icon"
                                  aria-label="Delete key date"
                                  title="Delete key date"
                                >
                                  <Trash2 className="h-4 w-4" aria-hidden />
                                </Button>
                              }
                              title="Delete key date?"
                              description="This cannot be undone."
                              confirmLabel="Delete"
                              onConfirm={() => deleteKeyDate(kd.id)}
                            />
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                  {editingId === kd.id ? (
                    // Full-width row: four narrow table cells cannot hold a
                    // four-language editor legibly.
                    <tr>
                      <td colSpan={4} className="bg-brand-parchment/20">
                        <TranslationFields
                          model="KeyDate"
                          draft={editTranslations}
                          idPrefix={`kd-t-${kd.id}`}
                        />
                      </td>
                    </tr>
                  ) : null}
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
