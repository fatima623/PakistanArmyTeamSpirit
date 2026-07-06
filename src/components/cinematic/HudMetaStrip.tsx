import { cn } from "@/lib/utils";

export type MetaItem = { label: string; value: string };

type Props = {
  items: MetaItem[];
  className?: string;
};

export function HudMetaStrip({ items, className }: Props) {
  return (
    <div className={cn("tac-meta-strip", className)} role="list">
      {items.map((item) => (
        <span key={item.label} role="listitem">
          {item.label}{" "}
          <span className="tac-meta-value">{item.value}</span>
        </span>
      ))}
    </div>
  );
}
