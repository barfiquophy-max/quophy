import Link from "next/link";
import type { EditorialBlock as Block } from "@/lib/types";

export default function EditorialBlock({
  block,
  priority = false,
  height = "tall",
}: {
  block: Block;
  priority?: boolean;
  height?: "tall" | "short";
}) {
  const heightClass = height === "tall" ? "h-[80vh] min-h-[520px]" : "h-[60vh] min-h-[420px]";

  return (
    <section className={`relative w-full overflow-hidden bg-offwhite ${heightClass}`}>
      {block.video ? (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={block.video}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : block.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={block.image}
          alt={block.title}
          className="absolute inset-0 h-full w-full object-cover"
          loading={priority ? "eager" : "lazy"}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 text-white md:p-12">
        <h2 className="max-w-2xl text-xl uppercase tracking-[0.12em] md:text-2xl">{block.title}</h2>
        <div className="flex flex-wrap gap-6">
          {block.ctas.map((cta) => (
            <Link
              key={`${block.title}-${cta.href}-${cta.label}`}
              href={cta.href}
              className="text-label uppercase tracking-[0.08em] underline underline-offset-4 hover:opacity-80"
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
