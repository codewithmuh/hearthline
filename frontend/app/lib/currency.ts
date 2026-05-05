/**
 * Server-side helper that resolves the active business's currency code.
 *
 * Used by server components (dashboard pages) to pass `currency` into
 * fmtMoney() / formatters, so the dashboard always renders amounts in the
 * tenant's chosen currency without each caller having to fetch the business
 * record itself.
 *
 * Client components should accept `currency` as a prop instead of importing
 * this — server-only `cookies()` won't work in the browser.
 */
import { cache } from "react";

import { fetchJson } from "@/app/dashboard/lib";
import type { Business, Page } from "@/app/dashboard/format";

export const getActiveCurrency = cache(async (): Promise<string> => {
  try {
    const res = await fetchJson<Page<Business>>("/businesses/");
    return res?.results?.[0]?.currency ?? "USD";
  } catch {
    return "USD";
  }
});
