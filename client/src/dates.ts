export function todayLocal(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export const dateOnly = (iso: string) => iso.slice(0, 10);

export function formatDate(iso: string): string {
  const [y, m, d] = dateOnly(iso).split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export type DueTone = "today" | "overdue" | "normal";

export function dueInfo(dueDate: string | null, done: boolean): { label: string; tone: DueTone } | null {
  if (!dueDate) return null;
  const due = dateOnly(dueDate);
  const today = todayLocal();
  if (done) return { label: `Due ${formatDate(dueDate)}`, tone: "normal" };
  if (due === today) return { label: "Due today", tone: "today" };
  if (due < today) return { label: `Overdue, was due ${formatDate(dueDate)}`, tone: "overdue" };
  return { label: `Due ${formatDate(dueDate)}`, tone: "normal" };
}
