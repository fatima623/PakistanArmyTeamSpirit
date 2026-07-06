import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

/** Persistent semantic grid matrix over cinematic video surfaces */
export function TacticalGridOverlay({ className }: Props) {
  return (
    <div
      className={cn("tac-semantic-grid bg-tac-semantic-grid", className)}
      aria-hidden
    />
  );
}
