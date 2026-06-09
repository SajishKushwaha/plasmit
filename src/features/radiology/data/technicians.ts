import type { Technician } from "@/features/radiology/types";

export const radiologyTechnicians: Technician[] = [
  {
    id: "tech-1",
    name: "Sandeep Rawat",
    modalities: ["mod-ct", "mod-xray"],
    shift: "08:00 - 16:00",
    phone: "+91 98111 41001",
    status: "Busy",
  },
  {
    id: "tech-2",
    name: "Priya Mathew",
    modalities: ["mod-mri"],
    shift: "10:00 - 18:00",
    phone: "+91 98111 41002",
    status: "Available",
  },
  {
    id: "tech-3",
    name: "Imran Shaikh",
    modalities: ["mod-usg", "mod-mammo"],
    shift: "09:00 - 17:00",
    phone: "+91 98111 41003",
    status: "Available",
  },
  {
    id: "tech-4",
    name: "Lakshmi R",
    modalities: ["mod-pet", "mod-ct"],
    shift: "12:00 - 20:00",
    phone: "+91 98111 41004",
    status: "On Break",
  },
];
