"use client";

import { useState } from "react";
import { Building2, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { FormFieldAdmin } from "@/components/admin/FormFieldAdmin";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { adminInput, adminTableActionsCenter, adminTextarea } from "@/lib/admin-ui";
import { formatDateShort } from "@/lib/utils";
import { TOAST } from "@/lib/toast";

export type HostFormationRow = {
  id: string;
  name: string;
  notes: string | null;
  createdAt: string;
  hostUser: { email: string; firstName: string; lastName: string } | null;
  _count: { members: number };
};

type AddForm = {
  name: string;
  notes: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const EMPTY_ADD: AddForm = {
  name: "",
  notes: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

export function HostFormationsManager({
  initialFormations,
}: {
  initialFormations: HostFormationRow[];
}) {
  const [formations, setFormations] = useState(initialFormations);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<AddForm>(EMPTY_ADD);
  const [errors, setErrors] = useState<Partial<Record<keyof AddForm, string>>>({});
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", notes: "" });

  const startEdit = (f: HostFormationRow) => {
    setEditingId(f.id);
    setEditForm({ name: f.name, notes: f.notes ?? "" });
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/host-formations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const { formation } = await res.json();
        setFormations((prev) => prev.map((f) => (f.id === id ? formation : f)));
        setEditingId(null);
        toast.success(TOAST.SAVE_SUCCESS);
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? TOAST.GENERIC_ERROR);
      }
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setSaving(false);
    }
  };

  const deleteFormation = async (id: string) => {
    const res = await fetch(`/api/admin/host-formations/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setFormations((prev) => prev.filter((f) => f.id !== id));
      toast.success(TOAST.DELETE_SUCCESS);
    } else {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? TOAST.GENERIC_ERROR);
    }
  };

  const addFormation = async () => {
    setSaving(true);
    setErrors({});
    try {
      const res = await fetch("/api/admin/host-formations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      if (res.ok) {
        const { formation } = await res.json();
        setFormations((prev) => [formation, ...prev]);
        setAddForm(EMPTY_ADD);
        setShowAddForm(false);
        toast.success("Host formation created");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (data.errors) {
        const flat: Partial<Record<keyof AddForm, string>> = {};
        for (const [k, v] of Object.entries(
          data.errors as Record<string, string[]>
        )) {
          flat[k as keyof AddForm] = v[0];
        }
        setErrors(flat);
        toast.error(TOAST.VALIDATION_ERROR);
      } else {
        toast.error(data.error ?? TOAST.GENERIC_ERROR);
      }
    } catch {
      toast.error(TOAST.GENERIC_ERROR);
    } finally {
      setSaving(false);
    }
  };

  const canAdd =
    addForm.name.trim().length > 0 &&
    addForm.firstName.trim().length > 0 &&
    addForm.lastName.trim().length > 0 &&
    addForm.email.trim().length > 0 &&
    addForm.password.length > 0;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <section className="admin-surface p-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="[&>p]:mt-1.5 [&>p]:max-w-[42rem] [&>p]:text-sm [&>p]:leading-normal [&>p]:text-muted-foreground">
            <h2 className="flex items-center gap-2 text-[1.75rem] font-bold tracking-[-0.01em] text-brand-ink">
              <Building2 className="h-6 w-6 text-green-700" aria-hidden />
              Host Formations ({formations.length})
            </h2>
            <p>
              Create the hosting organization (e.g. &ldquo;HQ 37 Div&rdquo;) that
              organizes the exercise. Each formation gets one read-only login;
              finalized teams are allotted to it from each team&rsquo;s detail
              page.
            </p>
          </div>
          <Button
            variant="adminPrimary"
            onClick={() => setShowAddForm((v) => !v)}
            aria-expanded={showAddForm}
          >
            {showAddForm ? (
              <>
                <X className="mr-2 h-4 w-4" aria-hidden />
                Close
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" aria-hidden />
                Add host formation
              </>
            )}
          </Button>
        </header>

        <div className="overflow-x-auto rounded-[10px] border border-black/[0.06]">
          <table className="admin-data-table">
            <colgroup>
              <col className="w-[26%]" />
              <col className="w-[34%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[16%]" />
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Formation</th>
                <th scope="col">Host login</th>
                <th scope="col">Teams</th>
                <th scope="col">Created</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {formations.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-muted-foreground"
                  >
                    No host formations yet. Click &ldquo;Add host formation&rdquo;
                    to create the hosting organization.
                  </td>
                </tr>
              ) : (
                formations.map((f) => (
                  <tr key={f.id}>
                    {editingId === f.id ? (
                      <>
                        <td>
                          <Input
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm((s) => ({ ...s, name: e.target.value }))
                            }
                            className={adminInput}
                            aria-label="Edit formation name"
                          />
                        </td>
                        <td colSpan={2}>
                          <Textarea
                            value={editForm.notes}
                            onChange={(e) =>
                              setEditForm((s) => ({ ...s, notes: e.target.value }))
                            }
                            rows={2}
                            className={adminTextarea}
                            aria-label="Edit notes"
                            placeholder="Notes (optional)"
                          />
                        </td>
                        <td className="tabular-nums text-muted-foreground">
                          {formatDateShort(f.createdAt)}
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
                              onClick={() => saveEdit(f.id)}
                              disabled={saving || editForm.name.trim().length === 0}
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
                        <td>
                          <div className="font-semibold text-brand-ink">
                            {f.name}
                          </div>
                          {f.notes ? (
                            <div className="mt-0.5 text-[0.8125rem] leading-snug text-muted-foreground">
                              {f.notes}
                            </div>
                          ) : null}
                        </td>
                        <td className="text-muted-foreground">
                          <div className="font-medium text-brand-ink">
                            {f.hostUser?.email ?? "—"}
                          </div>
                          {f.hostUser ? (
                            <div className="text-[0.8125rem]">
                              {f.hostUser.firstName} {f.hostUser.lastName}
                            </div>
                          ) : null}
                        </td>
                        <td className="tabular-nums text-muted-foreground">
                          {f._count.members}
                        </td>
                        <td className="tabular-nums text-muted-foreground">
                          {formatDateShort(f.createdAt)}
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
                              onClick={() => startEdit(f)}
                              aria-label="Edit host formation"
                              title="Edit host formation"
                            >
                              <Pencil className="h-4 w-4" aria-hidden />
                            </Button>
                            <ConfirmDialog
                              trigger={
                                <Button
                                  size="sm"
                                  variant="adminDestructive"
                                  className="portal-table-action-btn portal-table-action-btn--danger portal-table-action-btn--icon"
                                  aria-label="Delete host formation"
                                  title="Delete host formation"
                                >
                                  <Trash2 className="h-4 w-4" aria-hidden />
                                </Button>
                              }
                              title="Delete host formation?"
                              description="This deletes the formation and its login account. Assigned teams are detached (they remain approved). This cannot be undone."
                              confirmLabel="Delete"
                              onConfirm={() => deleteFormation(f.id)}
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

      {showAddForm ? (
        <section
          className="admin-surface p-8"
          aria-labelledby="add-host-formation-heading"
        >
          <h3
            id="add-host-formation-heading"
            className="mb-1.5 text-lg font-bold text-brand-ink"
          >
            Add a host formation
          </h3>
          <p className="mb-6 max-w-[42rem] text-sm leading-[1.55] text-muted-foreground">
            Provide the formation name and the login credentials for the account
            that will access its read-only dashboard. Share the temporary
            password securely — the account owner can change it later.
          </p>

          <div className="grid max-w-[46rem] grid-cols-1 gap-5 sm:grid-cols-2">
            <FormFieldAdmin
              label="Formation name"
              required
              error={errors.name}
              className="sm:col-span-2"
              hint='e.g. "HQ 37 Div"'
            >
              <Input
                value={addForm.name}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, name: e.target.value }))
                }
                className={adminInput}
                placeholder="HQ 37 Div"
              />
            </FormFieldAdmin>

            <FormFieldAdmin
              label="Contact first name"
              required
              error={errors.firstName}
            >
              <Input
                value={addForm.firstName}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, firstName: e.target.value }))
                }
                className={adminInput}
              />
            </FormFieldAdmin>

            <FormFieldAdmin
              label="Contact last name"
              required
              error={errors.lastName}
            >
              <Input
                value={addForm.lastName}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, lastName: e.target.value }))
                }
                className={adminInput}
              />
            </FormFieldAdmin>

            <FormFieldAdmin
              label="Login email"
              required
              error={errors.email}
            >
              <Input
                type="email"
                value={addForm.email}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, email: e.target.value }))
                }
                className={adminInput}
                placeholder="host@example.mil"
              />
            </FormFieldAdmin>

            <FormFieldAdmin
              label="Temporary password"
              required
              error={errors.password}
              hint="Min 8 chars incl. upper, lower, number & special."
            >
              <Input
                type="password"
                value={addForm.password}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, password: e.target.value }))
                }
                className={adminInput}
                autoComplete="new-password"
              />
            </FormFieldAdmin>

            <FormFieldAdmin
              label="Notes"
              error={errors.notes}
              className="sm:col-span-2"
              hint="Optional — visible to admins only."
            >
              <Textarea
                value={addForm.notes}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, notes: e.target.value }))
                }
                className={adminTextarea}
                rows={2}
              />
            </FormFieldAdmin>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-black/[0.06] pt-6">
            <Button
              onClick={addFormation}
              disabled={saving || !canAdd}
              variant="adminPrimary"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create host formation
            </Button>
            <Button
              type="button"
              variant="adminOutline"
              onClick={() => setShowAddForm(false)}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
