import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ContentPage from "@/components/ContentPage";
import { contentPages } from "@/lib/content";

type Params = { params: Promise<{ slug?: string[] }> };

const key = (slug?: string[]) => ["help", ...(slug ?? [])].join("/");

export function generateStaticParams() {
  return Object.keys(contentPages)
    .filter((path) => path.startsWith("help"))
    .map((path) => ({ slug: path.split("/").slice(1) }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const entry = contentPages[key(slug)];
  return { title: entry ? `${entry.title} | Emporio Armani US` : "Client Service" };
}

export default async function HelpPage({ params }: Params) {
  const { slug } = await params;
  const entry = contentPages[key(slug)];
  if (!entry) notFound();
  return <ContentPage title={entry.title} intro={entry.intro} sections={entry.sections} />;
}
