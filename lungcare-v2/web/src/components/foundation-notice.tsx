type FoundationNoticeProps = {
  eyebrow: string;
  title: string;
  description: string;
  nextStep: string;
};

export function FoundationNotice({ eyebrow, title, description, nextStep }: FoundationNoticeProps) {
  return (
    <main className="shell">
      <section className="notice" aria-labelledby="page-title">
        <p className="eyebrow">{eyebrow}</p>
        <h1 id="page-title">{title}</h1>
        <p className="description">{description}</p>
        <div className="status" role="status">
          <span aria-hidden="true" />
          Foundation only — not connected to clinical data
        </div>
        <dl>
          <div>
            <dt>Current checkpoint</dt>
            <dd>Typed domain contracts and guarded workflow transitions</dd>
          </div>
          <div>
            <dt>Next implementation</dt>
            <dd>{nextStep}</dd>
          </div>
        </dl>
        <p className="safety">Synthetic development environment. Do not enter real patient information.</p>
      </section>
    </main>
  );
}
