"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Business } from "../lib";

const TRADES = ["windows", "roofing", "hvac", "plumbing", "solar", "doors", "renovation", "electrical", "landscaping", "cleaning", "pest_control", "general"];
const TIMEZONES = [
  "America/Los_Angeles", "America/Denver", "America/Chicago", "America/New_York",
  "Europe/London", "Europe/Paris", "Europe/Madrid", "Asia/Dubai", "Asia/Karachi",
  "Asia/Singapore", "Australia/Sydney", "UTC",
];

type FormState = {
  name: string;
  trade: string;
  timezone: string;
  phone_number: string;
  voice_persona: string;
  knowledge_base: string;
};

function pickEditable(b: Business): FormState {
  return {
    name: b.name ?? "",
    trade: b.trade ?? "",
    timezone: b.timezone ?? "",
    phone_number: b.phone_number ?? "",
    voice_persona: b.voice_persona ?? "",
    knowledge_base: b.knowledge_base ?? "",
  };
}

async function patchBusiness(id: number, patch: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/proxy/businesses/${id}/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: text || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export default function SettingsForm({ business }: { business: Business }) {
  const router = useRouter();
  const initial = pickEditable(business);
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSavedAt(null);
    setError(null);
  }

  async function onSave() {
    if (!dirty || saving) return;
    setSaving(true);
    setError(null);
    const res = await patchBusiness(business.id, form);
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
    <>
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

          <Field label="Timezone" hint="Used for booking + business hours." full>
            <select
              className="text-input"
              value={form.timezone}
              onChange={(e) => update("timezone", e.target.value)}
            >
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </Field>
        </div>

        <div className="settings-actions">
          <button type="button" className="btn btn-ghost" onClick={onReset} disabled={!dirty || saving}>
            Reset
          </button>
          <button type="button" className="btn btn-primary" onClick={onSave} disabled={!dirty || saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </article>

      <ApiKeysCard business={business} />

      <article className="dash-card settings-knowledge">
        <div className="dash-card-head">
          <h2>AI knowledge base</h2>
          <span className="dash-card-meta">Used by Anna on every call</span>
        </div>
        <textarea
          className="text-input text-input-area"
          value={form.knowledge_base}
          onChange={(e) => update("knowledge_base", e.target.value)}
          placeholder="Pricing, service area, hours, common objections — anything Anna should know."
          rows={6}
        />
        <div className="settings-actions">
          <button type="button" className="btn btn-ghost" onClick={onReset} disabled={!dirty || saving}>
            Reset
          </button>
          <button type="button" className="btn btn-primary" onClick={onSave} disabled={!dirty || saving}>
            {saving ? "Saving…" : "Save knowledge base"}
          </button>
        </div>
      </article>
    </>
  );
}

function Field({ label, hint, children, full }: { label: string; hint?: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`settings-field ${full ? "settings-field-full" : ""}`}>
      <span className="settings-field-label">{label}</span>
      {children}
      {hint && <span className="settings-field-hint">{hint}</span>}
    </label>
  );
}

/* ============================================================
   API keys card — masked input, "leave blank to keep current"
   ============================================================ */
type KeyRow = {
  field: keyof Business;
  label: string;
  hint: string;
  configured: boolean;
  masked: string;
};

function ApiKeysCard({ business }: { business: Business }) {
  const router = useRouter();
  const provider = business.llm_provider || "anthropic";
  const usingOpenAI = provider === "openai";
  const allRows: (KeyRow & { hidden?: boolean })[] = [
    {
      field: "anthropic_api_key",
      label: "Anthropic API key",
      hint: "Required — Claude powers Anna, lead extraction, and photo-to-quote vision.",
      configured: business.has_anthropic_key,
      masked: business.anthropic_api_key,
      hidden: usingOpenAI,
    },
    {
      field: "openai_api_key",
      label: "OpenAI API key",
      hint: "Required — GPT powers Anna, lead extraction, and photo-to-quote vision.",
      configured: business.has_openai_key,
      masked: business.openai_api_key,
      hidden: !usingOpenAI,
    },
    { field: "vapi_api_key", label: "Vapi API key", hint: "For programmatic call placement (optional).", configured: business.has_vapi_key, masked: business.vapi_api_key },
    { field: "vapi_phone_number_id", label: "Vapi phone number ID", hint: "Public number Vapi answers on.", configured: !!business.vapi_phone_number_id, masked: business.vapi_phone_number_id },
    { field: "twilio_account_sid", label: "Twilio Account SID", hint: "Twilio voice + SMS fallback.", configured: !!business.twilio_account_sid, masked: business.twilio_account_sid },
    { field: "twilio_auth_token", label: "Twilio Auth token", hint: "", configured: business.has_twilio_creds, masked: business.twilio_auth_token },
    { field: "twilio_from_number", label: "Twilio from number", hint: "Outbound caller ID.", configured: !!business.twilio_from_number, masked: business.twilio_from_number },
  ];
  const rows: KeyRow[] = allRows.filter((r) => !r.hidden);

  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = Object.values(drafts).some((v) => v && v.length > 0);

  function setDraft(field: string, value: string) {
    setDrafts((d) => ({ ...d, [field]: value }));
    setSavedAt(null);
    setError(null);
  }

  async function clearKey(field: string) {
    setSaving(true);
    setError(null);
    const res = await patchBusiness(business.id, { [field]: "__CLEAR__" });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Failed to clear");
      return;
    }
    setDrafts((d) => ({ ...d, [field]: "" }));
    setSavedAt(new Date());
    router.refresh();
  }

  async function saveAll() {
    if (!dirty || saving) return;
    const patch: Record<string, string> = {};
    for (const [k, v] of Object.entries(drafts)) {
      if (v && v.trim()) patch[k] = v.trim();
    }
    setSaving(true);
    setError(null);
    const res = await patchBusiness(business.id, patch);
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Failed to save");
      return;
    }
    setDrafts({});
    setSavedAt(new Date());
    router.refresh();
  }

  async function setProvider(next: "anthropic" | "openai") {
    if (next === provider) return;
    setSaving(true);
    setError(null);
    const res = await patchBusiness(business.id, { llm_provider: next });
    setSaving(false);
    if (!res.ok) {
      setError(res.error ?? "Failed to switch provider");
      return;
    }
    setSavedAt(new Date());
    router.refresh();
  }

  return (
    <article className="dash-card settings-keys">
      <div className="dash-card-head">
        <h2>Provider API keys</h2>
        <div className="settings-saved">
          {error && <span className="settings-saved-err">{error}</span>}
          {!error && savedAt && <span className="settings-saved-ok">Saved · {savedAt.toLocaleTimeString()}</span>}
          {!error && !savedAt && dirty && <span className="settings-saved-dirty">{Object.values(drafts).filter(Boolean).length} key(s) staged</span>}
        </div>
      </div>

      <div className="provider-toggle" role="radiogroup" aria-label="LLM provider for Anna">
        <span className="provider-toggle-label">LLM provider</span>
        <div className="provider-toggle-options">
          <button
            type="button"
            role="radio"
            aria-checked={provider === "anthropic"}
            className={`provider-pill ${provider === "anthropic" ? "is-active" : ""}`}
            onClick={() => setProvider("anthropic")}
            disabled={saving}
          >
            <strong>Claude</strong>
            <span>Anthropic · {`claude-sonnet-4-6`}</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={provider === "openai"}
            className={`provider-pill ${provider === "openai" ? "is-active" : ""}`}
            onClick={() => setProvider("openai")}
            disabled={saving}
          >
            <strong>OpenAI</strong>
            <span>GPT · gpt-4o</span>
          </button>
        </div>
        <p className="provider-toggle-hint">
          Powers Anna, lead extraction, and photo-to-quote vision. Switch any time — the unused provider&apos;s key isn&apos;t needed.
        </p>
      </div>

      <p className="settings-keys-hint">
        Stored encrypted-at-rest in your Postgres. Per-business keys override the server&apos;s
        env-var defaults. Leave a field blank to keep the existing value.
      </p>
      <div className="keys-list">
        {rows.map((row) => (
          <KeyRow
            key={String(row.field)}
            row={row}
            value={drafts[String(row.field)] ?? ""}
            onChange={(v) => setDraft(String(row.field), v)}
            onClear={() => clearKey(String(row.field))}
            disabled={saving}
          />
        ))}
      </div>
      <div className="settings-actions">
        <button type="button" className="btn btn-ghost" onClick={() => setDrafts({})} disabled={!dirty || saving}>
          Discard
        </button>
        <button type="button" className="btn btn-primary" onClick={saveAll} disabled={!dirty || saving}>
          {saving ? "Saving…" : "Save keys"}
        </button>
      </div>
    </article>
  );
}

function KeyRow({
  row, value, onChange, onClear, disabled,
}: {
  row: KeyRow; value: string; onChange: (v: string) => void; onClear: () => void; disabled: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="key-row">
      <div className="key-row-meta">
        <div className="key-row-label">
          {row.label}
          {row.configured && <span className="key-row-status pill pill-active">configured</span>}
          {!row.configured && <span className="key-row-status pill pill-disabled">not set</span>}
        </div>
        {row.hint && <div className="key-row-hint">{row.hint}</div>}
        {row.configured && row.masked && (
          <div className="key-row-current">Current: <code>{row.masked}</code></div>
        )}
      </div>
      <div className="key-row-input">
        <input
          className="text-input"
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={row.configured ? "Leave blank to keep current" : "Paste key here"}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          className="key-row-toggle"
          onClick={() => setShow((s) => !s)}
          disabled={disabled || !value}
          aria-label={show ? "Hide" : "Show"}
        >
          {show ? "Hide" : "Show"}
        </button>
        {row.configured && (
          <button
            type="button"
            className="key-row-clear"
            onClick={() => {
              if (confirm(`Clear ${row.label}? Server env-var fallback (if any) will be used after.`)) onClear();
            }}
            disabled={disabled}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
