import Link from "next/link";

const roles = [
  { href: "/patient/today", label: "Patient", detail: "Cancer Companion" },
  { href: "/nurse/queue", label: "Nurse", detail: "Care Command Center" },
  { href: "/doctor/review/demo", label: "Doctor", detail: "Clinical Command Center" },
] as const;

export default function Home() {
  return (
    <main className="shell">
      <section className="notice" aria-labelledby="page-title">
        <p className="eyebrow">LungCare V3</p>
        <h1 id="page-title">A safer connected-care foundation</h1>
        <p className="description">
          The typed workflow foundation is in place. Persistence, authentication, and clinical use are not connected yet.
        </p>
        <nav className="role-grid" aria-label="Foundation route previews">
          {roles.map((role) => (
            <Link href={role.href} key={role.href}>
              <strong>{role.label}</strong>
              <span>{role.detail}</span>
            </Link>
          ))}
        </nav>
        <p className="safety">Synthetic development environment. Do not enter real patient information.</p>
      </section>
    </main>
  );
}
