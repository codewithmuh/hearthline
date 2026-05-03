"use client";

import { useState } from "react";
import Link from "next/link";

import PhoneWidget from "./PhoneWidget";

type Feature = { name: string; body: string };

export default function FeaturesSwitcher({
  features,
  exploreLabel,
}: {
  features: Feature[];
  exploreLabel: string;
}) {
  const [activeFeature, setActiveFeature] = useState(0);
  const active = features[activeFeature];

  return (
    <div className="feature-split feature-split-stretch">
      <div className="feature-split-left">
        <div className="feature-active">
          <div className="feature-active-row">
            <h3 className="feature-active-name">{active.name}</h3>
            <span className="feature-num feature-num-active">0{activeFeature + 1}</span>
          </div>
          <p className="feature-active-body">{active.body}</p>
          <Link href="/dashboard" className="feature-cta">
            {exploreLabel} <span aria-hidden>→</span>
          </Link>
        </div>
        <div className="features-list features-list-tight">
          {features.map((f, i) =>
            i === activeFeature ? null : (
              <button
                type="button"
                className="feature-row muted feature-row-btn"
                key={f.name}
                onClick={() => setActiveFeature(i)}
              >
                <h3 className="feature-name">{f.name}</h3>
                <span className="feature-num">0{i + 1}</span>
              </button>
            )
          )}
        </div>
      </div>
      <div className="feature-split-right">
        <PhoneWidget />
      </div>
    </div>
  );
}
