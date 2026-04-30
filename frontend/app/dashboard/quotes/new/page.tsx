import { fetchJson, type Lead, type Page } from "../../lib";
import NewQuoteForm from "./NewQuoteForm";

export default async function NewQuotePage() {
  const data = await fetchJson<Page<Lead>>("/leads/");
  const leads = (data?.results ?? []).map((l) => ({
    id: l.id,
    label: `#${l.id} · ${l.customer?.name || l.customer?.phone || "Unknown"} — ${l.project_summary || "(no summary)"}`,
  }));
  return <NewQuoteForm leads={leads} />;
}
