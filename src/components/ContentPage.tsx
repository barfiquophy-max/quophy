import Link from "next/link";

export type Section = { heading: string; body: string[]; links?: { label: string; href: string }[] };

export default function ContentPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro?: string;
  sections: Section[];
}) {
  return (
    <article className="site-padding py-12">
      <h1 className="text-xl uppercase tracking-[0.1em]">{title}</h1>
      {intro ? <p className="mt-4 max-w-3xl text-sm text-muted">{intro}</p> : null}
      <div className="mt-10 max-w-3xl space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-3 text-label uppercase tracking-[0.1em]">{section.heading}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="mb-3 text-sm leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
            {section.links?.length ? (
              <ul className="mt-3 space-y-1 text-sm">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="underline underline-offset-4">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </article>
  );
}
