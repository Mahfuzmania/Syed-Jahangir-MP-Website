export function SectionTitle({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-red">{eyebrow}</p> : null}
      <h2 className="mt-2 text-3xl font-bold leading-tight text-brand-green md:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-base text-brand-ink/80 md:text-lg">{description}</p> : null}
    </div>
  );
}
