"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { patientTone } from "@/features/roles/doctor-ipd/dashboard/dashboard.utils";
import type { DoctorIpdPatientContext } from "@/features/roles/doctor-ipd/patient-details/patient-details.types";
import { cn } from "@/lib/utils";

export function PatientBanner({
  isCompact,
  patient,
  rapidReviewPatient,
  tone,
}: DoctorIpdPatientContext & {
  isCompact: boolean;
  tone: ReturnType<typeof patientTone>;
}) {
  const age = rapidReviewPatient?.ageGender?.split("/")[0]?.trim() ? `${rapidReviewPatient.ageGender.split("/")[0].trim()} year(s)` : "25 year(s)";
  const details = [
    { label: "MR", value: "94346597930" },
    { label: "DOB", value: "30-12-1995" },
    { label: "", value: age },
    { label: "", value: "75 kg" },
    { label: "Bed", value: rapidReviewPatient ? `${rapidReviewPatient.ward} / ${rapidReviewPatient.bed}` : patient.bed },
    { label: "Blood Group", value: "AB" },
    { label: "Rh", value: "+ve" },
    { label: "Isolation Type", value: "Droplet" },
  ];

  return (
    <div
      className={cn(
        "rounded-xl border border-[#7367f0]/40 text-white shadow-[0_8px_20px_rgba(115,103,240,0.24)] transition-all duration-200",
        isCompact && "rounded-lg shadow-[0_6px_16px_rgba(115,103,240,0.2)]",
      )}
      style={{ background: "linear-gradient(90deg,#7367f0,#5b8def)" }}
    >
      <div className={cn("grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 transition-all duration-200 xl:px-4", isCompact ? "min-h-9 py-1" : "min-h-11 py-2")}>
        <div className="horizontal-scrollbar min-w-0 overflow-x-auto overflow-y-hidden pb-1">
          <div className={cn("flex min-w-full w-max flex-nowrap items-center justify-between transition-all duration-200", isCompact ? "gap-x-2 xl:gap-x-3" : "gap-x-3 xl:gap-x-4 2xl:gap-x-5")}>
            <div className="flex shrink-0 items-center gap-2">
              <span className="max-w-[130px] truncate text-sm font-bold xl:max-w-[160px]">{patient.name}</span>
              <Badge
                className={cn(
                  "border-white/30 px-2.5 font-bold shadow-sm",
                  tone === "red" && "bg-red-500 text-white",
                  tone === "orange" && "bg-orange-400 text-white",
                  tone === "blue" && "bg-blue-500 text-white",
                )}
                tone={tone === "red" ? "critical" : tone === "orange" ? "warning" : "success"}
              >
                {tone === "red" ? "Urgent" : tone === "orange" ? "Watch" : "Stable"}
              </Badge>
            </div>
            {details.map((item) => (
              <div className="shrink-0 whitespace-nowrap text-[13px] font-semibold leading-5 xl:text-sm" key={`${item.label}-${item.value}`}>
                {item.label ? <span className={item.label === "Isolation Type" ? "font-extrabold text-red-300" : "text-white/80"}>{item.label}: </span> : null}
                <span className={item.label === "Isolation Type" ? "font-extrabold text-red-300" : undefined}>{item.value}</span>
              </div>
            ))}
            <div className={cn("shrink-0 whitespace-nowrap text-[13px] font-bold leading-5 text-orange-300 xl:text-sm", !isCompact && "ml-0")}>Allergies: Meropenem</div>
          </div>
        </div>
        <div className="flex min-w-0 justify-end">
          <Button asChild className="h-8 w-8 max-w-full shrink-0 border-white/25 bg-[#1d4ed8] px-0 text-xs font-bold text-white shadow-sm hover:bg-[#1e40af] sm:w-auto sm:px-3 xl:px-4" size="sm" variant="outline">
            <Link aria-label="Back to Dashboard" className="min-w-0" href="/doctor-ipd">
              <ArrowLeft className="h-4 w-4 shrink-0" />
              <span className="hidden truncate sm:inline">Back to Dashboard</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
