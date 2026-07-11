"use client";

import type { IcuPatient } from "@/features/care-team/nursing-icu/nursing-icu-data";

const ventilationChartHours = ["0000", "0100", "0200", "0300", "0400", "0500", "0600", "0700", "0800", "0900", "1000", "1100", "1200"];

const ventilationParameterRows = [
  { property: "Ventilation Mode", values: ["NIV S/T", "-", "-", "NIV S/T", "-", "-", "NIV S/T", "-", "-", "NIV S/T", "-", "-", "NIV S/T"] },
  { property: "Sxxx Ventilation Mode", values: ["S/T", "-", "-", "S/T", "-", "-", "S/T", "-", "-", "S/T", "-", "-", "S/T"] },
  { property: "Ventilator Type", values: ["NIV mask", "-", "-", "NIV mask", "-", "-", "NIV mask", "-", "-", "NIV mask", "-", "-", "NIV mask"] },
  { property: "Humidification", values: ["Heated", "-", "-", "-", "-", "Heated", "-", "-", "-", "-", "-", "-", "Heated"] },
  { property: "Humidification temperature", values: ["35.5", "-", "-", "-", "-", "35.5", "-", "-", "-", "-", "-", "-", "36.5"] },
  { property: "Humidified water check", values: ["Checked", "-", "-", "-", "-", "-", "-", "-", "Checked", "-", "-", "-", "-"] },
  { property: "Mandatory breath type", values: ["Pressure", "-", "-", "Pressure", "-", "-", "-", "-", "Pressure", "-", "-", "-", "Pressure"] },
  { property: "Apnea ventilatory", values: ["Standby", "-", "-", "-", "-", "Standby", "-", "-", "-", "-", "-", "-", "Standby"] },
  { property: "Spontaneous", values: ["19", "20", "19", "18", "17", "16", "17", "18", "19", "20", "19", "18", "17"] },
  { property: "FiO2", values: ["56", "57", "58", "57", "56", "55", "54", "55", "56", "57", "58", "57", "56"] },
  { property: "Peep", values: ["5", "6", "7", "8", "7", "6", "5", "4", "5", "6", "7", "8", "7"] },
  { property: "Spontaneous breath", values: ["19", "20", "19", "18", "17", "16", "17", "18", "19", "20", "19", "18", "17"] },
  { property: "IE (Inspiratory / Expiratory ratio)", values: ["1:3", "-", "1:3", "-", "1:3", "-", "1:3", "-", "1:3", "-", "1:3", "-", "1:3"] },
  { property: "T High", values: ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"] },
  { property: "T low", values: ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"] },
  { property: "Ppeak Pressure", values: ["18", "19", "20", "19", "18", "17", "16", "17", "18", "19", "20", "19", "18"] },
  { property: "Plateau pressure", values: ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"] },
  { property: "Compliance static (C static)", values: ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"] },
  { property: "Compliance dynamics (C dynamics)", values: ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"] },
  { property: "Pressure support (Ps) - tidal volume", values: ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"] },
  { property: "Pinspiratory", values: ["15", "16", "17", "18", "17", "16", "15", "14", "15", "16", "17", "18", "17"] },
  { property: "Pressure support (Ps) - Minute volume", values: ["9.0", "9.4", "9.8", "9.4", "9.0", "8.6", "8.2", "8.6", "9.0", "9.4", "9.8", "9.4", "9.0"] },
  { property: "Respiratory rate", values: ["17", "18", "17", "16", "15", "14", "15", "16", "17", "18", "17", "16", "15"] },
];

const ventilationValidationColumns = ["38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "Units"];

const ventilationValidationRows = [
  { property: "Ventilation Mode", values: ["-", "95", "120", "52", "36.5", "good", "yes", "-", "night", "-", "Celsius"] },
  { property: "Sxxx Ventilation Mode", values: ["-", "98", "130", "132", "37.5", "not good", "yes", "-", "night", "-", "None"] },
  { property: "Ventilator Type", values: ["-", "96", "141", "46", "38", "very good", "no result", "-", "morning", "-", "Beats/min"] },
  { property: "Humidification", values: ["-", "95", "120", "52", "36.5", "good", "yes", "-", "night", "-", "mmHg"] },
  { property: "Humidification temperature", values: ["-", "95", "96", "85", "37", "nice", "yes", "-", "noon", "-", "mmHg"] },
  { property: "Humidified water check", values: ["-", "95", "120", "52", "36.5", "good", "yes", "-", "night", "-", "ml"] },
  { property: "Mandatory breath type", values: ["-", "95", "70", "82", "36.5", "very good", "yes", "-", "noon", "-", "/min"] },
  { property: "Apnea ventilatory", values: ["-", "79", "150", "90", "38", "good", "yes", "-", "night", "-", "cmH2O"] },
  { property: "Spontaneous", values: ["-", "95", "120", "52", "36.5", "good", "yes", "-", "night", "-", "%"] },
  { property: "FiO2", values: ["-", "98", "130", "132", "37.5", "not good", "yes", "-", "night", "-", "kPa"] },
  { property: "Peep", values: ["-", "96", "141", "46", "38", "very good", "no result", "-", "morning", "-", "kPa"] },
  { property: "Spontaneous breath", values: ["-", "95", "120", "52", "36.5", "good", "yes", "-", "night", "-", "kPa"] },
  { property: "IE (Inspiratory / Expiratory ratio)", values: ["-", "95", "96", "85", "37", "nice", "yes", "-", "noon", "-", "kPa"] },
  { property: "T High", values: ["-", "95", "120", "52", "36.5", "good", "yes", "-", "night", "-", "/min"] },
  { property: "T low", values: ["-", "95", "70", "82", "36.5", "very good", "yes", "-", "noon", "-", "cmH2O"] },
  { property: "Ppeak Pressure", values: ["-", "79", "150", "90", "38", "good", "yes", "-", "night", "-", "%"] },
  { property: "Plateau pressure", values: ["-", "95", "120", "52", "36.5", "good", "yes", "-", "night", "-", "kPa"] },
  { property: "Compliance static (C static)", values: ["-", "98", "130", "132", "37.5", "not good", "yes", "-", "night", "-", "kPa"] },
  { property: "Compliance dynamics (C dynamics)", values: ["-", "96", "141", "46", "38", "very good", "no result", "-", "morning", "-", "kPa"] },
  { property: "Pressure support (Ps) - tidal volume", values: ["-", "95", "120", "52", "36.5", "good", "yes", "-", "night", "-", "kPa"] },
  { property: "Pinspiratory", values: ["-", "95", "96", "85", "37", "nice", "yes", "-", "noon", "-", "kPa"] },
  { property: "Pressure support (Ps) - Minute volume", values: ["-", "95", "120", "52", "36.5", "good", "yes", "-", "night", "-", "kPa"] },
  { property: "Respiratory rate", values: ["-", "95", "70", "82", "36.5", "very good", "yes", "-", "noon", "-", "kPa"] },
];

export function Ventilation({ patient }: { patient: IcuPatient }) {
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div>
            <h3 className="text-sm font-bold text-slate-950">Hourly ventilation parameters</h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">{patient.bedNo} | {patient.patientName} | {patient.ventilatorStatus} | FiO2 58% | PEEP 7</p>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600">0000 - 1200</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1320px] border-collapse bg-white text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="sticky left-0 z-20 min-w-[210px] border-r border-slate-200 bg-slate-50 px-3 py-3 text-left">Property</th>
                {ventilationChartHours.map((hour) => <th className="min-w-[86px] border-r border-slate-200 px-3 py-3 text-center" key={hour}>{hour}</th>)}
              </tr>
            </thead>
            <tbody>
              {ventilationParameterRows.map((row) => (
                <tr className="border-b border-slate-100 last:border-b-0 hover:bg-sky-50/40" key={row.property}>
                  <td className="sticky left-0 z-10 border-r border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-950">{row.property}</td>
                  {row.values.map((value, index) => (
                    <td className="border-r border-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-700" key={`${row.property}-${index}`}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="text-sm font-bold text-slate-950">Property validation</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse bg-white text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase text-slate-500">
              <tr className="border-b border-slate-200">
                <th className="sticky left-0 z-20 min-w-[230px] border-r border-slate-200 bg-slate-50 px-3 py-3 text-left">Property</th>
                {ventilationValidationColumns.map((column) => <th className="min-w-[86px] border-r border-slate-200 px-3 py-3 text-center" key={column}>{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {ventilationValidationRows.map((row) => (
                <tr className="border-b border-slate-100 last:border-b-0 hover:bg-sky-50/40" key={row.property}>
                  <td className="sticky left-0 z-10 border-r border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-950">{row.property}</td>
                  {row.values.map((value, index) => (
                    <td className="border-r border-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-700" key={`${row.property}-validation-${index}`}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
