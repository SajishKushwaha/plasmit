import { radiologyModalities } from "@/features/diagnostics/radiology/data/modalities";

interface ModalityBadgeProps {
  modalityId: string;
}

const modalityTones: Record<string, string> = {
  "mod-ct": "border-sky-200 bg-sky-50 text-sky-800",
  "mod-mri": "border-indigo-200 bg-indigo-50 text-indigo-800",
  "mod-xray": "border-slate-200 bg-slate-50 text-slate-800",
  "mod-usg": "border-emerald-200 bg-emerald-50 text-emerald-800",
  "mod-mammo": "border-pink-200 bg-pink-50 text-pink-800",
  "mod-pet": "border-violet-200 bg-violet-50 text-violet-800",
};

export function ModalityBadge({ modalityId }: ModalityBadgeProps) {
  const modality = radiologyModalities.find((item) => item.id === modalityId);

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        modalityTones[modalityId] ?? "border-slate-200 bg-slate-50 text-slate-700",
      ].join(" ")}
    >
      {modality?.code ?? modalityId}
    </span>
  );
}
