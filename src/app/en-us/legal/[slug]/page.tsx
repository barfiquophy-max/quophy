import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContentPage from "@/components/ContentPage";
import { contentPages } from "@/lib/content";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(contentPages)
    .filter((path) => path.startsWith("legal/"))
    .map((path) => ({ slug: path.split("/")[1] }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const entry = contentPages[`legal/${slug}`];
  return { title: entry ? `${entry.title} | Emporio Armani US` : "Legal" };
}

export default async function LegalPage({ params }: Params) {
  const { slug } = await params;
  const entry = contentPages[`legal/${slug}`];
  if (!entry) notFound();
  return <ContentPage title={entry.title} intro={entry.intro} sections={entry.sections} />;
}
