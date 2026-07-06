type Props = {
  eyebrow?: string;
  quote: string;
  body: string;
  motto?: string;
};

export function PatsMissionBanner({
  eyebrow = "Mission / Purpose",
  quote,
  body,
  motto,
}: Props) {
  return (
    <div className="pats-mission">
      <p className="pats-eyebrow">{eyebrow}</p>
      <div className="pats-gold-rule pats-gold-rule--center" aria-hidden />
      <p className="pats-mission__quote">{quote}</p>
      <p className="pats-body pats-body--bright mx-auto mt-6 max-w-2xl">{body}</p>
      {motto && (
        <p className="pats-mission__motto mt-4 uppercase tracking-[0.14em] text-[var(--pats-gold)]">
          {motto}
        </p>
      )}
    </div>
  );
}
