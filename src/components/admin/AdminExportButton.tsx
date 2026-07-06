"use client";

import { Download } from "lucide-react";

type Row = Record<string, string | number | null | undefined>;

function toCsv(rows: Row[], columns: string[]): string {
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.join(",");
  const body = rows.map((r) => columns.map((c) => escape(r[c])).join(","));
  return [header, ...body].join("\n");
}

/** Client-side CSV export of the current result set. */
export function AdminExportButton({
  rows,
  columns,
  filename,
  label = "Export",
}: {
  rows: Row[];
  columns: string[];
  filename: string;
  label?: string;
}) {
  const handleExport = () => {
    if (typeof window === "undefined") return;
    const csv = toCsv(rows, columns);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      className="admin-btn-export inline-flex items-center gap-1.5"
      disabled={rows.length === 0}
    >
      <Download className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );
}
