type Props = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
};

/** Participant page title band — participant-panel.css (.pp) design system. */
export function PatsPortalHeader({ title, subtitle, eyebrow }: Props) {
  return (
    <header className="pp-page-header">
      <p className="pp-eyebrow">{eyebrow ?? "Participant portal"}</p>
      <h1 className="pp-page-title">{title}</h1>
      {subtitle ? <p className="pp-page-sub">{subtitle}</p> : null}
    </header>
  );
}
