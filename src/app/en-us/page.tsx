import Link from "next/link";

const BRANDS = [
  {
    label: "Giorgio Armani",
    href: "/en-us/giorgio-armani/experience/",
    image:
      "https://assets-cf.armani.com/image/upload/f_auto,q_auto,ar_4:5,w_1000,c_lfill/SS26_EA_ADV_CATALOGO_VL_W_03_1080x1350",
  },
  {
    label: "Emporio Armani",
    href: "/en-us/emporio-armani/experience/",
    image:
      "https://assets-cf.armani.com/image/upload/f_auto,q_auto,ar_4:5,w_1000,c_lfill/SS26_EA_ADV_CATALOGO_MAIN_MW_03_1080x1350",
  },
  {
    label: "EA7",
    href: "/en-us/ea7/experience/",
    image:
      "https://assets-cf.armani.com/image/upload/f_auto,q_auto,ar_4:5,w_1000,c_lfill/SS26_EAJ_ADV_012",
  },
  {
    label: "Armani Exchange",
    href: "/en-us/armani-exchange/experience/",
    image:
      "https://assets-cf.armani.com/image/upload/f_auto,q_auto,ar_4:5,w_1000,c_lfill/SS26_EAJ_ADV_002",
  },
];

export const metadata = { title: "Armani | Official Store US" };

export default function BrandHubPage() {
  return (
    <div className="py-10">
      <h1 className="site-padding pb-8 text-xl uppercase tracking-[0.1em]">Choose your world</h1>
      <div className="grid grid-cols-1 gap-px bg-line md:grid-cols-2 lg:grid-cols-4">
        {BRANDS.map((brand) => (
          <Link key={brand.href} href={brand.href} className="group relative block bg-offwhite">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.image}
              alt={brand.label}
              className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-label uppercase tracking-[0.12em] text-white">
              {brand.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
