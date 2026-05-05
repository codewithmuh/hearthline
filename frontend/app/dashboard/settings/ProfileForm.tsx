"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Business } from "../lib";
import { patchBusiness } from "./api";

const TRADES = [
  "windows", "roofing", "hvac", "plumbing", "solar", "doors",
  "renovation", "electrical", "landscaping", "cleaning", "pest_control", "general",
];
const TIMEZONES = [
  "America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York",
  "Europe/London", "Europe/Paris", "Europe/Madrid", "Asia/Dubai", "Asia/Karachi",
  "Asia/Singapore", "Australia/Sydney", "UTC",
];
const CURRENCIES: { code: string; label: string }[] = [
  { code: "USD", label: "US Dollar ($)" },
  { code: "EUR", label: "Euro (€)" },
  { code: "GBP", label: "British Pound (£)" },
  { code: "CAD", label: "Canadian Dollar (C$)" },
  { code: "AUD", label: "Australian Dollar (A$)" },
  { code: "NZD", label: "New Zealand Dollar (NZ$)" },
  { code: "CHF", label: "Swiss Franc (CHF)" },
  { code: "SEK", label: "Swedish Krona (kr)" },
  { code: "NOK", label: "Norwegian Krone (kr)" },
  { code: "DKK", label: "Danish Krone (kr)" },
  { code: "PLN", label: "Polish Zloty (zł)" },
  { code: "CZK", label: "Czech Koruna (Kč)" },
  { code: "HUF", label: "Hungarian Forint (Ft)" },
  { code: "RON", label: "Romanian Leu (lei)" },
  { code: "TRY", label: "Turkish Lira (₺)" },
  { code: "RUB", label: "Russian Ruble (₽)" },
  { code: "UAH", label: "Ukrainian Hryvnia (₴)" },
  { code: "ILS", label: "Israeli Shekel (₪)" },
  { code: "AED", label: "UAE Dirham (د.إ)" },
  { code: "SAR", label: "Saudi Riyal (﷼)" },
  { code: "QAR", label: "Qatari Riyal (﷼)" },
  { code: "KWD", label: "Kuwaiti Dinar (د.ك)" },
  { code: "BHD", label: "Bahraini Dinar (.د.ب)" },
  { code: "OMR", label: "Omani Rial (﷼)" },
  { code: "JOD", label: "Jordanian Dinar (د.ا)" },
  { code: "EGP", label: "Egyptian Pound (£)" },
  { code: "LBP", label: "Lebanese Pound (ل.ل)" },
  { code: "MAD", label: "Moroccan Dirham (د.م.)" },
  { code: "DZD", label: "Algerian Dinar (د.ج)" },
  { code: "TND", label: "Tunisian Dinar (د.ت)" },
  { code: "ZAR", label: "South African Rand (R)" },
  { code: "NGN", label: "Nigerian Naira (₦)" },
  { code: "KES", label: "Kenyan Shilling (KSh)" },
  { code: "GHS", label: "Ghanaian Cedi (₵)" },
  { code: "ETB", label: "Ethiopian Birr (Br)" },
  { code: "UGX", label: "Ugandan Shilling (USh)" },
  { code: "TZS", label: "Tanzanian Shilling (TSh)" },
  { code: "PKR", label: "Pakistani Rupee (Rs)" },
  { code: "INR", label: "Indian Rupee (₹)" },
  { code: "BDT", label: "Bangladeshi Taka (৳)" },
  { code: "LKR", label: "Sri Lankan Rupee (Rs)" },
  { code: "NPR", label: "Nepalese Rupee (Rs)" },
  { code: "AFN", label: "Afghan Afghani (؋)" },
  { code: "CNY", label: "Chinese Yuan (¥)" },
  { code: "HKD", label: "Hong Kong Dollar (HK$)" },
  { code: "TWD", label: "Taiwan Dollar (NT$)" },
  { code: "JPY", label: "Japanese Yen (¥)" },
  { code: "KRW", label: "South Korean Won (₩)" },
  { code: "SGD", label: "Singapore Dollar (S$)" },
  { code: "MYR", label: "Malaysian Ringgit (RM)" },
  { code: "IDR", label: "Indonesian Rupiah (Rp)" },
  { code: "PHP", label: "Philippine Peso (₱)" },
  { code: "THB", label: "Thai Baht (฿)" },
  { code: "VND", label: "Vietnamese Dong (₫)" },
  { code: "MXN", label: "Mexican Peso ($)" },
  { code: "BRL", label: "Brazilian Real (R$)" },
  { code: "ARS", label: "Argentine Peso ($)" },
  { code: "CLP", label: "Chilean Peso ($)" },
  { code: "COP", label: "Colombian Peso ($)" },
  { code: "PEN", label: "Peruvian Sol (S/.)" },
  { code: "UYU", label: "Uruguayan Peso ($)" },
];

type FormState = {
  name: string;
  trade: string;
  timezone: string;
  currency: string;
  phone_number: string;
  voice_persona: string;
};

function pickEditable(b: Business): FormState {
  return {
    name: b.name ?? "",
    trade: b.trade ?? "",
    timezone: b.timezone ?? "",
    currency: b.currency ?? "USD",
    phone_number: b.phone_number ?? "",
    voice_persona: b.voice_persona ?? "",
  };
}

export default function ProfileForm({ business }: { business: Business }) {
  const router = useRouter();
  const isNew = business.id === 0;
  const initial = pickEditable(business);
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = isNew ? form.name.trim().length > 0 : JSON.stringify(form) !== JSON.stringify(initial);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSavedAt(null);
    setError(null);
  }

  async function onSave() {
    if (!dirty || saving) return;
    setSaving(true);
    setError(null);
    const payload = isNew
      ? { ...form, slug: form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "default" }
      : form;
    const res = await patchBusiness(business.id, payload);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Failed to save");
      return;
    }
    setSavedAt(new Date());
    router.refresh();
  }

  function onReset() {
    setForm(initial);
    setError(null);
  }

  return (
    <article className="dash-card settings-profile">
      <div className="settings-profile-head">
        <span className="settings-profile-mark">{(form.name || "?").slice(0, 1).toUpperCase()}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ margin: 0 }}>{form.name || "Untitled business"}</h2>
          <p className="settings-profile-sub">
            {form.trade || "—"} · {form.timezone || "UTC"}
          </p>
        </div>
        <div className="settings-saved">
          {error && <span className="settings-saved-err">{error}</span>}
          {!error && savedAt && <span className="settings-saved-ok">Saved · {savedAt.toLocaleTimeString()}</span>}
          {!error && !savedAt && dirty && <span className="settings-saved-dirty">Unsaved changes</span>}
        </div>
      </div>

      <div className="settings-form">
        <Field label="Name" hint="Customer-facing identity.">
          <input
            className="text-input"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Rolling Shutters Inc."
          />
        </Field>

        <Field label="Phone number" hint="Public business line.">
          <input
            className="text-input"
            type="tel"
            value={form.phone_number}
            onChange={(e) => update("phone_number", e.target.value)}
            placeholder="+1 (555) 010-1010"
          />
        </Field>

        <Field label="AI persona" hint="Display name Anna uses on calls.">
          <input
            className="text-input"
            value={form.voice_persona}
            onChange={(e) => update("voice_persona", e.target.value)}
            placeholder="Anna"
          />
        </Field>

        <Field label="Trade" hint="Drives default pricing rules and scripts.">
          <select
            className="text-input"
            value={form.trade}
            onChange={(e) => update("trade", e.target.value)}
          >
            {TRADES.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
            ))}
          </select>
        </Field>

        <Field label="Timezone" hint="Used for booking + business hours.">
          <select
            className="text-input"
            value={form.timezone}
            onChange={(e) => update("timezone", e.target.value)}
          >
            {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </Field>

        <Field label="Currency" hint="Anna quotes prices in this currency. Dashboard formats accordingly." full>
          <select
            className="text-input"
            value={form.currency}
            onChange={(e) => update("currency", e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="settings-actions">
        <button type="button" className="btn btn-ghost" onClick={onReset} disabled={!dirty || saving}>
          Reset
        </button>
        <button type="button" className="btn btn-primary" onClick={onSave} disabled={!dirty || saving}>
          {saving ? "Saving…" : isNew ? "Create business" : "Save changes"}
        </button>
      </div>
    </article>
  );
}

function Field({
  label, hint, children, full,
}: { label: string; hint?: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`settings-field ${full ? "settings-field-full" : ""}`}>
      <span className="settings-field-label">{label}</span>
      {children}
      {hint && <span className="settings-field-hint">{hint}</span>}
    </label>
  );
}
