import { PatsLogo } from "@/components/pats/PatsLogo";

type Props = {
  title: string;
  subtitle?: string;
};

/** Dashboard page title band — DESIGN_SPEC typography */
export function PatsPortalHeader({ title, subtitle }: Props) {
  return (
    <header className="pats-portal-header">
      <div className="mb-4 flex items-center gap-3">
        <PatsLogo size={44} variant="nav" />
        <p className="pats-eyebrow !mb-0">Participant portal</p>
      </div>
      <div className="pats-gold-rule" aria-hidden />
      <h1>{title}</h1>
      {subtitle && <p className="pats-body mt-2">{subtitle}</p>}
    </header>
  );
}
