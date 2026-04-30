import { notFound } from "next/navigation";

import { fetchJson, type Business, type Page, type Quote } from "../../lib";
import QuoteEditor from "./QuoteEditor";

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [quote, businesses] = await Promise.all([
    fetchJson<Quote>(`/quotes/${id}/`),
    fetchJson<Page<Business>>("/businesses/"),
  ]);
  if (!quote) notFound();
  const businessName = businesses?.results?.[0]?.name ?? "Hearthline";
  return <QuoteEditor quote={quote} businessName={businessName} />;
}
