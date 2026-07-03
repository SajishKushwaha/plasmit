"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const coreParameters = [
  { label: "Age", tags: "Shorr", unit: "years" },
  { label: "Temperature", tags: "SIRS - CPIS", unit: "deg C" },
  { label: "Heart rate", tags: "SIRS", unit: "bpm" },
  { label: "Respiratory rate", tags: "SIRS", unit: "/min" },
  { label: "PACO2", tags: "SIRS", unit: "mmHg" },
  { label: "WBC", tags: "SIRS - CPIS", unit: "/mm3" },
  { label: "Bands", tags: "SIRS", unit: "%" },
  { label: "Band forms", tags: "CPIS", unit: "/mm3" },
  { label: "Systolic BP", tags: "SIRS", unit: "mmHg" },
  { label: "Lactate", tags: "SIRS", unit: "mmol/L" },
];

const screeningTabs = ["Index", "SIRS / Sepsis", "CPIS / VAP", "DRIP Score", "Shorr Score"];

const instruments = [
  { number: "01", title: "SIRS / Sepsis", score: "0/4" },
  { number: "02", title: "CPIS / VAP", score: "0/12" },
  { number: "03", title: "DRIP Score", score: "0/14" },
  { number: "04", title: "Shorr Score", score: "0/10" },
];

export default function IcuCommandCenterNursingEarlyWarningScoreRoute() {
  const [activeTab, setActiveTab] = React.useState("Index");

  return (
    <div className="min-h-[calc(100vh-88px)] bg-[#f7f8ff] px-4 py-3 md:px-6">
      <section className="overflow-hidden rounded-xl border border-[#d9d7f5] bg-white shadow-[0_18px_44px_rgba(33,37,64,0.08)]">
        <div className="border-l-4 border-[#7367f0] bg-gradient-to-r from-[#fbfaff] to-white px-5 py-6 md:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.16em] text-primary">ICU Nursing Screening</div>
              <h1 className="mt-2 text-xl font-black text-[#252738]">Early Warning Score</h1>
            </div>

            <div className="flex min-w-[170px] items-center justify-center rounded-xl border border-[#dedbf7] bg-[#fbfaff] px-5 py-3 text-center shadow-sm">
              <div>
                <div className="text-3xl font-black leading-none text-primary">0<span className="text-base text-[#565b70]">/5</span></div>
                <div className="mt-2 text-xs font-extrabold text-[#85859a]">Core parameters completed</div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {coreParameters.map((item) => (
              <label className="rounded-lg border border-[#e0deef] bg-[#fbfaff] p-3 shadow-sm" key={item.label}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-black uppercase tracking-[0.08em] text-[#626376]">{item.label}</span>
                  <span className="text-[11px] font-black text-[#9693a8]">{item.tags}</span>
                </div>
                <Input className="mt-2 h-10 rounded-md border-[#dddbea] bg-white shadow-none focus:border-primary focus:ring-primary/15" />
                <div className="mt-1 text-xs font-bold text-[#9a9aaa]">{item.unit}</div>
              </label>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-5 rounded-xl border border-border bg-white p-1 shadow-[0_14px_34px_rgba(33,37,64,0.08)]">
        <div className="grid gap-1 md:grid-cols-5">
          {screeningTabs.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                className={cn(
                  "h-12 rounded-lg text-sm font-black transition",
                  active
                    ? "bg-gradient-to-r from-[#7367f0] to-[#5b8def] text-white shadow-[0_8px_18px_rgba(115,103,240,0.24)]"
                    : "bg-transparent text-[#777688] hover:bg-surface-muted hover:text-[#252738]",
                )}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {!active ? <span className="h-2 w-2 rounded-full bg-[#dfddea]" /> : null}
                  {tab}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <section className="mt-8 space-y-5">
        <div>
          <h2 className="text-2xl font-black text-[#252738]">Screening index</h2>
        </div>

        <div className="rounded-lg border border-[#dedbf0] bg-white px-4 py-3 text-sm font-semibold text-[#4b4d5f] shadow-sm">
          <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-black text-primary">i</span>
          No data entered yet. Start with Patient Parameters above, or open any instrument tab.
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {instruments.map((instrument) => (
            <article
              className="relative min-h-[210px] overflow-hidden rounded-xl border border-[#e2e0ee] bg-white p-5 shadow-sm before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-[#7367f0] before:to-[#5b8def]"
              key={instrument.title}
            >
              <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-primary/5" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-[#9290a4]">Instrument {instrument.number}</div>
                  <h3 className="mt-1 text-lg font-black text-[#252738]">{instrument.title}</h3>
                </div>
                <div className="rounded-lg bg-primary/10 px-3 py-2 text-2xl font-black leading-none text-primary">{instrument.score}</div>
              </div>
              <div className="relative mt-20 rounded-lg border border-[#dedbf0] bg-[#fbfaff] px-3 py-2 text-xs font-black text-[#85859a]">
                Awaiting input
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
