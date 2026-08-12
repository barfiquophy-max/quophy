import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const BRANDS: Record<string, { name: string; blurb: string; image: string }> = {
  "giorgio-armani": {
    name: "Giorgio Armani",
    blurb:
      "The main line of the Armani Group: refined tailoring, precious materials and a timeless idea of elegance.",
    image:
      "https://assets-cf.armani.com/image/upload/f_auto,q_auto,ar_16:9,w_2000,c_lfill/SS26_EA_ADV_CATALOGO_MAIN_MW_03_1920x1080",
  },
  ea7: {
    name: "EA7",
    blurb:
      "Technical performance wear engineered for movement, with innovative fabrics and a sport-driven aesthetic.",
    image:
      "https://assets-cf.armani.com/image/upload/f_auto,q_auto,ar_16:9,w_2000,c_lfill/FW26-27_ADV_CATALOGO_DEL_M_04_1920x1080",
  },
  "armani-exchange": {
    name: "Armani Exchange",
    blurb:
      "Fast, urban and accessible: the youngest expression of the Armani world, inspired by street style and music.",
    image:
      "https://assets-cf.armani.com/image/upload/f_auto,q_auto,ar_16:9,w_2000,c_lfill/SS26_EA_ADV_GLOBAL_FASHION_MW_01_1080x1920",
  },
};

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(BRANDS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const entry = BRANDS[slug];
  return { title: entry ? `${entry.name} | Armani US` : "Armani US" };
}

export default async function BrandExperiencePage({ params }: Params) {
  const { slug } = await params;
  const entry = BRANDS[slug];
  if (!entry) notFound();

  return (
    <div>
      <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden bg-offwhite">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={entry.image} alt={entry.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-x-0 bottom-0 p-6 text-white md:p-12">
          <h1 className="text-2xl uppercase tracking-[0.16em]">{entry.name}</h1>
        </div>
      </section>
      <div className="site-padding py-12">
        <p className="max-w-2xl text-sm leading-relaxed text-muted">{entry.blurb}</p>
        <p className="mt-8 text-sm">
          The {entry.name} catalogue is not part of this demo build.{" "}
          <Link href="/en-us/emporio-armani/experience/" className="underline underline-offset-4">
            Explore Emporio Armani
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
