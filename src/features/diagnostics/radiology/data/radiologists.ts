import type { Radiologist } from "@/features/diagnostics/radiology/types";

export const radiologists: Radiologist[] = [
  {
    id: "rad-1",
    name: "Dr. Vikram Talwar",
    specialization: "Neuroradiology",
    modalities: ["mod-mri", "mod-ct"],
    shift: "08:00 - 16:00",
    status: "Reporting",
  },
  {
    id: "rad-2",
    name: "Dr. Sana Qureshi",
    specialization: "Chest and Body Imaging",
    modalities: ["mod-ct", "mod-xray", "mod-usg"],
    shift: "10:00 - 18:00",
    status: "Available",
  },
  {
    id: "rad-3",
    name: "Dr. Neil D'Souza",
    specialization: "Onco Imaging",
    modalities: ["mod-pet", "mod-mammo", "mod-mri"],
    shift: "12:00 - 20:00",
    status: "Available",
  },
];
