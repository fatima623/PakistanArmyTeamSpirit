type Props = {
  title: string;
  subtitle?: string;
};

/** Participant page title band — participant-panel.css (.pp) design system. */
export function PatsPortalHeader({ title, subtitle }: Props) {
  return (
    <header className="pp-page-header">
      <p className="pp-eyebrow">Participant portal</p>
      <h1 className="pp-page-title">{title}</h1>
      {subtitle ? <p className="pp-page-sub">{subtitle}</p> : null}
    </header>
  );
}
