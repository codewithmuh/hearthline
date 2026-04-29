import { fetchJson, type Business, type Page } from "../lib";

export default async function SettingsPage() {
  const data = await fetchJson<Page<Business>>("/businesses/");
  const biz = data?.results?.[0];

  return (
    <>
      <div className="app-pagebar">
        <div>
          <h1>Settings</h1>
          <p>Business profile, channels, AI persona, and webhooks.</p>
        </div>
        <div className="app-pagebar-actions">
          {biz && (
            <a
              href={`http://localhost:8000/admin/core/business/${biz.id}/change/`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary"
            >
              Edit in Django admin ↗
            </a>
          )}
        </div>
      </div>

      <div className="app-content">
        {!biz ? (
          <div className="empty-card">
            <h3>No business configured yet</h3>
            <p>Add one via Django admin or run <code>docker compose exec backend python manage.py seed_demo</code>.</p>
          </div>
        ) : (
          <>
            <article className="dash-card">
              <div className="dash-card-head"><h2>Business profile</h2></div>
              <div className="settings-row">
                <div>
                  <div className="settings-label">Name</div>
                  <div className="settings-value">Customer-facing identity</div>
                </div>
                <div>{biz.name}</div>
              </div>
              <div className="settings-row">
                <div>
                  <div className="settings-label">Trade</div>
                  <div className="settings-value">Drives default pricing rules</div>
                </div>
                <div>{biz.trade}</div>
              </div>
              <div className="settings-row">
                <div>
                  <div className="settings-label">Phone number</div>
                  <div className="settings-value">Public business line</div>
                </div>
                <div>{biz.phone_number || "—"}</div>
              </div>
              <div className="settings-row">
                <div>
                  <div className="settings-label">Voice persona</div>
                  <div className="settings-value">Display name for the AI receptionist</div>
                </div>
                <div>{biz.voice_persona}</div>
              </div>
              <div className="settings-row">
                <div>
                  <div className="settings-label">Timezone</div>
                  <div className="settings-value">Used for booking + business hours</div>
                </div>
                <div>{biz.timezone}</div>
              </div>
            </article>

            <article className="dash-card">
              <div className="dash-card-head"><h2>Channels</h2></div>
              {biz.channels.length === 0 ? (
                <p className="dash-empty">No channels configured.</p>
              ) : (
                <ul className="dash-list">
                  {biz.channels.map((ch) => (
                    <li key={ch.id}>
                      <span className="dash-list-id">{ch.kind}</span>
                      <div className="dash-list-body">
                        <div className="dash-list-title">{ch.address}</div>
                        <div className="dash-list-meta">{ch.is_active ? "Active" : "Disabled"}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="dash-card">
              <div className="dash-card-head"><h2>AI knowledge base</h2></div>
              <p style={{ margin: 0, fontSize: 14, color: "var(--ink-2)", whiteSpace: "pre-wrap" }}>
                {biz.knowledge_base || "(no knowledge base configured)"}
              </p>
            </article>

            <article className="dash-card">
              <div className="dash-card-head"><h2>Webhooks</h2></div>
              <ul className="dash-list">
                <li>
                  <span className="dash-list-id">Vapi</span>
                  <div className="dash-list-body">
                    <div className="dash-list-title">POST <code>/api/calls/webhooks/vapi/</code></div>
                    <div className="dash-list-meta">Receives end-of-call reports and triggers the AI extraction pipeline.</div>
                  </div>
                </li>
                <li>
                  <span className="dash-list-id">Twilio</span>
                  <div className="dash-list-body">
                    <div className="dash-list-title">POST <code>/api/calls/webhooks/twilio/</code></div>
                    <div className="dash-list-meta">Handles voice + SMS events from Twilio.</div>
                  </div>
                </li>
                <li>
                  <span className="dash-list-id">Photo</span>
                  <div className="dash-list-body">
                    <div className="dash-list-title">POST <code>/api/quotes/from-photo/</code></div>
                    <div className="dash-list-meta">Vision pipeline: photo URL + lead ID → drafted quote with line items.</div>
                  </div>
                </li>
              </ul>
            </article>
          </>
        )}
      </div>
    </>
  );
}
