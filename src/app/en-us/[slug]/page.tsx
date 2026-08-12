import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContentPage from "@/components/ContentPage";
import { contentPages } from "@/lib/content";

type Params = { params: Promise<{ slug: string }> };

const SIMPLE_PAGES = ["authenticity", "digital-card", "student-promotions", "gifts"];

export function generateStaticParams() {
  return SIMPLE_PAGES.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const entry = contentPages[slug];
  return { title: entry ? `${entry.title} | Emporio Armani US` : "Emporio Armani US" };
}

export default async function SimplePage({ params }: Params) {
  const { slug } = await params;
  const entry = contentPages[slug];
  if (!entry) notFound();
  return <ContentPage title={entry.title} intro={entry.intro} sections={entry.sections} />;
}
