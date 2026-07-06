import { cn } from "@/lib/utils";

export function SectionTitle({
  as: Tag = "h2",
  children,
  className,
}: {
  as?: "h1" | "h2" | "h3";
  children: React.ReactNode;
  className?: string;
}) {
  const base = Tag === "h1" ? "cp-h1" : "cp-h2";
  return <Tag className={cn(base, className)}>{children}</Tag>;
}
