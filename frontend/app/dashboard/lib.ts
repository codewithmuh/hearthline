import { apiFetch, apiJson, API_URL as SHARED_API_URL } from "@/app/lib/api";

export const API_URL = SHARED_API_URL;

export async function fetchJson<T>(path: string): Promise<T | null> {
  return apiJson<T>(path);
}

export { apiFetch };

export {
  fmtAge,
  fmtMoney,
} from "./format";
export type { Lead, Call, Quote, Business, Page } from "./format";
