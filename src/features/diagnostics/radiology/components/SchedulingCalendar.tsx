import type { Modality, Patient, RadiologyTest, Schedule } from "@/features/diagnostics/radiology/types";
import { ModalityBadge } from "@/features/diagnostics/radiology/components/ModalityBadge";
import { RadiologyStatusBadge } from "@/features/diagnostics/radiology/components/RadiologyStatusBadge";

interface SchedulingCalendarProps {
  schedules: Schedule[];
  patients: Patient[];
  tests: RadiologyTest[];
  modalities: Modality[];
}

const timeBlocks = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

export function SchedulingCalendar({ schedules, patients, tests, modalities }: SchedulingCalendarProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="grid min-w-[900px] grid-cols-[90px_repeat(6,1fr)] border-b border-slate-200 bg-slate-50 text-sm font-medium text-slate-600">
        <div className="px-3 py-3">Time</div>
        {modalities.map((modality) => (
          <div className="border-l border-slate-200 px-3 py-3" key={modality.id}>
            {modality.code}
          </div>
        ))}
      </div>
      <div className="max-h-[620px] min-w-[900px] overflow-y-auto">
        {timeBlocks.map((time) => (
          <div className="grid grid-cols-[90px_repeat(6,1fr)] border-b border-slate-100" key={time}>
            <div className="bg-slate-50 px-3 py-4 text-sm font-medium text-slate-500">{time}</div>
            {modalities.map((modality) => {
              const matchingSchedules = schedules.filter((schedule) => schedule.modalityId === modality.id && schedule.startTime.startsWith(time.slice(0, 2)));

              return (
                <div className="min-h-24 border-l border-slate-100 p-2" key={`${time}-${modality.id}`}>
                  {matchingSchedules.length === 0 ? (
                    <div className="h-full rounded-lg border border-dashed border-slate-200 bg-slate-50" />
                  ) : (
                    <div className="space-y-2">
                      {matchingSchedules.map((schedule) => {
                        const patient = patients.find((item) => item.id === schedule.patientId);
                        const test = tests.find((item) => item.id === schedule.testId);

                        return (
                          <article className="rounded-lg border border-sky-200 bg-sky-50 p-2" key={schedule.id}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-sky-900">
                                {schedule.startTime}-{schedule.endTime}
                              </span>
                              <ModalityBadge modalityId={schedule.modalityId} />
                            </div>
                            <p className="mt-2 text-sm font-medium text-slate-950">{patient?.name ?? "Unknown patient"}</p>
                            <p className="text-xs text-slate-600">{test?.name ?? schedule.testId}</p>
                            <div className="mt-2">
                              <RadiologyStatusBadge compact status={schedule.status} />
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
