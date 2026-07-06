"use client";

import { useState } from "react";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { FormFieldAdmin } from "@/components/admin/FormFieldAdmin";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminInput, adminTextarea } from "@/lib/admin-ui";
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ label: "", value: "", sortOrder: 0 });
  const [addForm, setAddForm] = useState({
    label: "",
    value: "",
    sortOrder: nextSortOrder(initialKeyDates),
  });
  const [saving, setSaving] = useState(false);

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
        body: JSON.stringify(editForm),
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
        body: JSON.stringify(addForm),
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

  return (
    <div className="admin-key-dates-page">
      <section className="admin-key-dates-panel">
        <header className="admin-key-dates-header">
          <h2>Configured dates ({keyDates.length})</h2>
          <p>
            These entries appear on the public key dates page. Visitors see the
            label and value you enter below.
          </p>
        </header>

        <div className="admin-key-dates-table-shell">
          <table className="admin-key-dates-table">
            <colgroup>
              <col className="admin-key-dates-col-label" />
              <col className="admin-key-dates-col-value" />
              <col className="admin-key-dates-col-order" />
              <col className="admin-key-dates-col-actions" />
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
                  <td colSpan={4} className="admin-key-dates-empty">
                    No key dates yet. Add your first entry using the form below.
                  </td>
                </tr>
              ) : (
                keyDates.map((kd) => (
                  <tr key={kd.id}>
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
                            className="admin-key-dates-row-actions"
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
                        <td className="admin-key-dates-cell-label">{kd.label}</td>
                        <td className="admin-key-dates-cell-value">{kd.value}</td>
                        <td className="admin-key-dates-cell-order">{kd.sortOrder}</td>
                        <td>
                          <div
                            className="admin-key-dates-row-actions"
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-key-dates-add-card" aria-labelledby="add-key-date-heading">
        <h3 id="add-key-date-heading">Add a new key date</h3>
        <p className="admin-key-dates-add-intro">
          Give each entry a short <strong>label</strong> (shown in the left column on
          the public page) and a <strong>value</strong> (the date or description
          shown beside it). Use <strong>display order</strong> to control sort
          position — lower numbers appear first.
        </p>

        <div className="admin-key-dates-add-fields">
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

          <FormFieldAdmin
            label="Display order"
            
            className="admin-key-dates-order-field"
          >
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
        </div>

        <div className="admin-key-dates-add-actions">
          <Button
            onClick={addKeyDate}
            disabled={saving || !canAdd}
            variant="adminPrimary"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add key date
          </Button>
          <p className="admin-key-dates-add-hint-footer">
            Required: label and value. The new entry will appear in the table above
            after you save.
          </p>
        </div>
      </section>
    </div>
  );
}
