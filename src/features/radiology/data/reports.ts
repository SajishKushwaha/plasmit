import type { RadiologyReport } from "@/features/radiology/types";

export const radiologyReports: RadiologyReport[] = [
  {
    id: "rep-1",
    orderId: "ord-7001",
    patientId: "pat-1001",
    testId: "test-ct-chest",
    radiologistId: "rad-2",
    templateName: "CT Chest Contrast",
    findings:
      "Contrast-enhanced CT chest shows adequate opacification of pulmonary arteries. No central pulmonary embolus is seen. Mild basal atelectatic bands are present bilaterally. No pleural effusion.",
    impression:
      "No CT evidence of central pulmonary thromboembolism. Mild bilateral basal subsegmental atelectatic changes.",
    status: "Pending Verification",
    critical: false,
    createdAt: "2026-05-21T11:20:00+05:30",
  },
  {
    id: "rep-2",
    orderId: "ord-7002",
    patientId: "pat-1002",
    testId: "test-ct-head",
    radiologistId: "rad-1",
    templateName: "CT Head Trauma",
    findings:
      "Small acute hyperdense extra-axial collection is noted in the left temporal region with mild local mass effect. No midline shift. Basal cisterns are patent.",
    impression:
      "Small acute left temporal extra-axial hemorrhage. Urgent neurosurgical correlation advised.",
    status: "Draft",
    critical: true,
    createdAt: "2026-05-21T09:58:00+05:30",
  },
  {
    id: "rep-3",
    orderId: "ord-7006",
    patientId: "pat-1006",
    testId: "test-mammo-bilateral",
    radiologistId: "rad-3",
    templateName: "Mammography BIRADS",
    findings:
      "Bilateral craniocaudal and mediolateral oblique views obtained. Stable well-circumscribed left upper outer quadrant lesion. No suspicious clustered microcalcification.",
    impression: "Stable benign appearing left breast lesion. BIRADS 2.",
    status: "Verified",
    critical: false,
    createdAt: "2026-05-21T09:45:00+05:30",
    verifiedAt: "2026-05-21T10:40:00+05:30",
  },
];

export const reportTemplates = [
  {
    id: "tpl-ct-head",
    name: "CT Head Trauma",
    modalityId: "mod-ct",
    sections: ["Clinical History", "Technique", "Findings", "Impression"],
    lastUpdated: "2026-05-01",
  },
  {
    id: "tpl-mri-brain",
    name: "MRI Brain Contrast",
    modalityId: "mod-mri",
    sections: ["Sequences", "Findings", "Vascular Flow Voids", "Impression"],
    lastUpdated: "2026-04-25",
  },
  {
    id: "tpl-usg-abdomen",
    name: "USG Whole Abdomen",
    modalityId: "mod-usg",
    sections: ["Liver", "Gall Bladder", "Kidneys", "Pelvis", "Impression"],
    lastUpdated: "2026-04-18",
  },
  {
    id: "tpl-mammo",
    name: "Mammography BIRADS",
    modalityId: "mod-mammo",
    sections: ["Breast Density", "Findings", "Assessment", "Recommendation"],
    lastUpdated: "2026-05-10",
  },
];
