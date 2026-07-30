import type {
  LaboratoryGroupedTest,
  LaboratoryOrderHistory,
  LaboratoryPackageProfile,
  LaboratoryPriority,
  LaboratoryResultBlock,
  LaboratorySummaryRow,
  LaboratoryTest,
} from "./types";

export const LaboratorySubTabs = ["Laboratory", "Radiology", "Medications", "Nursing orders", "Diet", "IV solutions", "Rehab", "Order history"] as const;

export const visitProblems = ["Diabetes Type 2", "Hypertension", "Fatigue"];

export const specimenSources = ["Blood", "Urine", "Stool", "CSF", "Sputum", "Wound swab", "Pleural Fluid", "Ascitic Fluid", "Biopsy"];

export const priorities: LaboratoryPriority[] = ["Routine", "Urgent", "STAT", "ASAP"];

const labTests: Array<Omit<LaboratoryTest, "description"> & { description?: string }> = [
  { id: "cbc", name: "CBC", description: "Complete blood count", code: "58410-2", department: "Hematology" },
  { id: "rft-kft", name: "RFT/KFT", description: "Renal / kidney function test", code: "24362-6", department: "Biochemistry" },
  { id: "electrolytes", name: "Electrolytes", description: "Sodium, potassium, chloride panel", department: "Biochemistry" },
  { id: "electrolytes-basic", name: "Electrolytes (Na/K/Cl)", description: "Sodium, potassium, chloride", department: "Biochemistry" },
  { id: "electrolytes-icu", name: "Electrolytes (Na/K/Cl/Ca/Mg/PO4)", description: "ICU electrolyte profile", department: "Biochemistry" },
  { id: "rbs", name: "RBS", description: "Random blood sugar", department: "Biochemistry" },
  { id: "pt-inr-aptt", name: "PT/INR + aPTT", description: "Coagulation screen", department: "Hematology" },
  { id: "urine-rm", name: "Urine R/M", description: "Routine urine microscopy", department: "Clinical Pathology" },
  { id: "urine-ketone", name: "Urine Ketone", description: "Urine ketone test", department: "Clinical Pathology" },
  { id: "troponin", name: "Troponin I/T", description: "Cardiac marker", department: "Biochemistry" },
  { id: "ck-mb", name: "CK-MB", description: "Cardiac enzyme", department: "Biochemistry" },
  { id: "ecg", name: "ECG", description: "Electrocardiogram", department: "Cardiology" },
  { id: "ecg-12", name: "ECG (12-lead)", description: "12 lead electrocardiogram", department: "Cardiology" },
  { id: "crp", name: "CRP", description: "C-reactive protein", department: "Serology" },
  { id: "procalcitonin", name: "Procalcitonin", description: "Sepsis marker", department: "Biochemistry" },
  { id: "blood-culture", name: "Blood culture", description: "Microbiology culture", department: "Microbiology" },
  { id: "urine-culture", name: "Urine R/M + culture", description: "Urine routine with culture", department: "Microbiology" },
  { id: "lactate", name: "Lactate", description: "Serum lactate", department: "Biochemistry" },
  { id: "lft", name: "LFT", description: "Liver function test", code: "24323-8", department: "Biochemistry" },
  { id: "bilirubin", name: "Bilirubin (T/D/I)", description: "Total, direct and indirect bilirubin", department: "Biochemistry" },
  { id: "sgot", name: "SGOT", description: "AST enzyme", department: "Biochemistry" },
  { id: "sgpt", name: "SGPT", description: "ALT enzyme", department: "Biochemistry" },
  { id: "alp", name: "ALP", description: "Alkaline phosphatase", department: "Biochemistry" },
  { id: "ggt", name: "GGT", description: "Gamma-glutamyl transferase", department: "Biochemistry" },
  { id: "total-protein", name: "Total protein", description: "Serum total protein", department: "Biochemistry" },
  { id: "albumin", name: "Albumin", description: "Serum albumin", department: "Biochemistry" },
  { id: "urea-bun", name: "Urea/BUN", description: "Urea and blood urea nitrogen", department: "Biochemistry" },
  { id: "creatinine", name: "Creatinine", description: "Serum creatinine", department: "Biochemistry" },
  { id: "uric-acid", name: "Uric acid", description: "Serum uric acid", department: "Biochemistry" },
  { id: "calcium", name: "Calcium", description: "Serum calcium", department: "Biochemistry" },
  { id: "fbs", name: "FBS", description: "Fasting blood sugar", department: "Biochemistry" },
  { id: "ppbs", name: "PPBS", description: "Post-prandial blood sugar", department: "Biochemistry" },
  { id: "hba1c", name: "HbA1c", description: "Glycated hemoglobin", department: "Biochemistry" },
  { id: "lipid-profile", name: "Lipid profile", description: "Cholesterol and lipoprotein panel", department: "Biochemistry" },
  { id: "t3", name: "T3", description: "Triiodothyronine", department: "Biochemistry" },
  { id: "t4", name: "T4", description: "Thyroxine", department: "Biochemistry" },
  { id: "tsh", name: "TSH", description: "Thyroid stimulating hormone", department: "Biochemistry" },
  { id: "dengue", name: "Dengue NS1/IgM", description: "Dengue antigen and antibody", department: "Serology" },
  { id: "malaria-antigen", name: "Malaria antigen", description: "Malaria antigen test", department: "Serology" },
  { id: "widal-typhidot", name: "Widal/Typhidot", description: "Enteric fever serology", department: "Serology" },
  { id: "pt-inr", name: "PT/INR", description: "Prothrombin time and INR", department: "Hematology" },
  { id: "aptt", name: "aPTT", description: "Activated partial thromboplastin time", department: "Hematology" },
  { id: "d-dimer", name: "D-Dimer", description: "Fibrin degradation product", department: "Hematology" },
  { id: "fibrinogen", name: "Fibrinogen", description: "Coagulation protein level", department: "Hematology" },
  { id: "peripheral-smear", name: "Peripheral smear", description: "Peripheral blood smear examination", department: "Hematology" },
  { id: "reticulocyte", name: "Reticulocyte", description: "Reticulocyte count", department: "Hematology" },
  { id: "iron-panel", name: "Iron/TIBC/Ferritin", description: "Iron studies", department: "Biochemistry" },
  { id: "b12", name: "B12", description: "Vitamin B12", department: "Biochemistry" },
  { id: "folate", name: "Folate", description: "Serum folate", department: "Biochemistry" },
  { id: "blood-crossmatch", name: "Blood group & cross-match", description: "Blood grouping with cross-match", department: "Blood Bank / Transfusion Medicine" },
  { id: "blood-rh-crossmatch", name: "Blood group & Rh + cross-match", description: "Blood group, Rh and cross-match", department: "Blood Bank / Transfusion Medicine" },
  { id: "abg", name: "ABG", description: "Arterial blood gas", department: "Critical Care Lab" },
  { id: "abg-lactate", name: "ABG + Lactate", description: "ABG with lactate", department: "Critical Care Lab" },
  { id: "fast", name: "FAST", description: "Focused assessment with sonography", department: "Radiology" },
  { id: "chest-xray", name: "Chest X-ray", description: "Chest radiograph", department: "Radiology" },
  { id: "portable-chest-xray", name: "Portable/Bedside Chest X-ray", description: "Portable chest radiograph", department: "Radiology" },
  { id: "amylase-lipase", name: "Amylase/Lipase", description: "Pancreatic enzymes", department: "Biochemistry" },
  { id: "serology", name: "Serology", description: "Serology as indicated", department: "Serology" },
  { id: "rapid-hiv", name: "RAPID HIV", description: "Rapid HIV screening", department: "Serology" },
  { id: "creatinine-hb", name: "Creatinine / HB", description: "Creatinine and hemoglobin", department: "Biochemistry" },
  { id: "serum-lactate", name: "Serum Lactate", description: "Serum lactate", department: "Biochemistry" },
  { id: "crp-procalcitonin", name: "CRP + Procalcitonin", description: "Inflammatory and sepsis markers", department: "Biochemistry" },
  { id: "cardiac-biomarkers", name: "Troponin/CK-MB + NT-proBNP", description: "Cardiac biomarkers", department: "Biochemistry" },
  { id: "echo-2d", name: "2D-Echo screening", description: "Screening echocardiography", department: "Cardiology" },
  { id: "viral-markers", name: "Viral markers (HIV, HBsAg, Anti-HCV)", description: "Pre-operative viral markers", department: "Serology" },
  { id: "serum-electrolytes", name: "Serum Electrolytes", description: "Serum electrolyte panel", department: "Biochemistry" },
  { id: "pulmonary-function", name: "Pulmonary function", description: "Pulmonary function test", department: "Pulmonology" },
  { id: "abg-major", name: "ABG (major surgery)", description: "Major surgery arterial blood gas", department: "Critical Care Lab" },
];

export const testList: LaboratoryTest[] = labTests.map((test) => ({
  ...test,
  description: test.description ?? test.name,
}));

export const groupedTests: LaboratoryGroupedTest[] = [
  {
    id: "er-emergency-basic",
    name: "ER / Emergency Basic",
    department: "Emergency",
    section: "Common order sets / profiles",
    notes: "ER STAT default",
    testIds: ["cbc", "rft-kft", "electrolytes", "rbs", "pt-inr-aptt", "urine-rm"],
  },
  {
    id: "cardiac-chest-pain",
    name: "Cardiac / Chest Pain",
    department: "Cardiology",
    section: "Common order sets / profiles",
    notes: "With serial troponin option",
    testIds: ["troponin", "ck-mb", "ecg", "electrolytes", "rbs"],
  },
  {
    id: "sepsis-fever-workup",
    name: "Sepsis / Fever Work-up",
    department: "Emergency",
    section: "Common order sets / profiles",
    testIds: ["cbc", "crp", "procalcitonin", "blood-culture", "urine-culture", "lactate"],
  },
  {
    id: "liver-profile",
    name: "Liver Profile (LFT)",
    department: "Biochemistry",
    section: "Common order sets / profiles",
    testIds: ["bilirubin", "sgot", "sgpt", "alp", "ggt", "total-protein", "albumin"],
  },
  {
    id: "renal-profile",
    name: "Renal Profile (KFT/RFT)",
    department: "Biochemistry",
    section: "Common order sets / profiles",
    testIds: ["urea-bun", "creatinine", "uric-acid", "electrolytes", "calcium"],
  },
  {
    id: "diabetic-profile",
    name: "Diabetic Profile",
    department: "Biochemistry",
    section: "Common order sets / profiles",
    testIds: ["fbs", "ppbs", "hba1c", "urine-rm", "lipid-profile"],
  },
  {
    id: "thyroid-profile",
    name: "Thyroid Profile",
    department: "Biochemistry",
    section: "Common order sets / profiles",
    testIds: ["t3", "t4", "tsh"],
  },
  {
    id: "fever-tropical",
    name: "Fever - Tropical",
    department: "Serology",
    section: "Common order sets / profiles",
    notes: "Seasonal",
    testIds: ["cbc", "dengue", "malaria-antigen", "widal-typhidot", "urine-rm"],
  },
  {
    id: "coagulation-profile",
    name: "Coagulation Profile",
    department: "Hematology",
    section: "Common order sets / profiles",
    testIds: ["pt-inr", "aptt", "d-dimer", "fibrinogen"],
  },
  {
    id: "anaemia-workup",
    name: "Anaemia Work-up",
    department: "Hematology",
    section: "Common order sets / profiles",
    testIds: ["cbc", "peripheral-smear", "reticulocyte", "iron-panel", "b12", "folate"],
  },
  {
    id: "trauma-polytrauma",
    name: "Trauma / Poly-trauma",
    department: "Emergency",
    section: "Common order sets / profiles",
    notes: "ER STAT",
    testIds: ["cbc", "blood-crossmatch", "rft-kft", "electrolytes", "pt-inr", "abg", "fast"],
  },
  {
    id: "adm-er",
    name: "ER ADMISSION PROFILE",
    department: "Emergency",
    section: "Admission & OT profiles",
    notes: "Triggered when disposition = Admit; STAT default.",
    testIds: ["cbc", "rft-kft", "electrolytes-basic", "rbs", "pt-inr-aptt", "urine-rm", "ecg-12", "chest-xray", "troponin", "ck-mb", "abg-lactate", "amylase-lipase", "serology", "rapid-hiv", "creatinine-hb"],
  },
  {
    id: "adm-icu",
    name: "ICU ADMISSION PROFILE",
    department: "ICU",
    section: "Admission & OT profiles",
    notes: "Full sick-patient work-up at ICU admission.",
    testIds: ["cbc", "rft-kft", "lft", "electrolytes-icu", "rbs", "abg", "serum-lactate", "pt-inr-aptt", "d-dimer", "crp-procalcitonin", "cardiac-biomarkers", "blood-crossmatch", "blood-culture", "urine-culture", "ecg", "portable-chest-xray", "echo-2d"],
  },
  {
    id: "adm-ot",
    name: "OT / PRE-OPERATIVE (PAC) PROFILE",
    department: "OT",
    section: "Admission & OT profiles",
    notes: "Pre-Anaesthetic Check-up mandatory set.",
    testIds: ["cbc", "rft-kft", "lft", "rbs", "pt-inr-aptt", "blood-rh-crossmatch", "viral-markers", "serum-electrolytes", "urine-rm", "ecg-12", "chest-xray", "echo-2d", "abg", "pulmonary-function"],
  },
  {
    id: "adm-post",
    name: "POST-OP / POST-PROCEDURE PROFILE",
    department: "OT",
    section: "Admission & OT profiles",
    notes: "Ordered on shift from OT to ICU/Ward recovery.",
    testIds: ["cbc", "rft-kft", "electrolytes", "rbs", "pt-inr", "abg-major"],
  },
];

export const admissionPackageProfiles: LaboratoryPackageProfile[] = [
  {
    id: "package-adm-er",
    name: "ER ADMISSION PROFILE (ADM-ER)",
    trigger: "triggered when Plan of Action = Admit",
    bundles: [
      { id: "adm-er-haematology", label: "Haematology", testIds: ["cbc", "pt-inr", "aptt"] },
      { id: "adm-er-biochemistry", label: "Biochemistry", testIds: ["rft-kft", "electrolytes-basic", "rbs"] },
      { id: "adm-er-clinical-path", label: "Clinical Path", testIds: ["urine-rm", "urine-ketone"] },
      { id: "adm-er-cardiac-imaging", label: "Cardiac / Imaging", testIds: ["ecg-12", "chest-xray", "fast"] },
    ],
  },
  {
    id: "package-adm-icu",
    name: "ICU ADMISSION PROFILE (ADM-ICU)",
    trigger: "triggered at ICU admission (B6)",
    bundles: [
      { id: "adm-icu-haematology", label: "Haematology", testIds: ["cbc", "pt-inr", "aptt", "d-dimer"] },
      { id: "adm-icu-biochemistry", label: "Biochemistry", testIds: ["rft-kft", "lft", "electrolytes-icu", "rbs", "abg", "serum-lactate"] },
      { id: "adm-icu-cardiac-markers", label: "Cardiac markers", testIds: ["troponin", "ck-mb", "cardiac-biomarkers"] },
      { id: "adm-icu-inflammatory", label: "Inflammatory", testIds: ["crp", "procalcitonin"] },
      { id: "adm-icu-transfusion", label: "Transfusion", testIds: ["blood-rh-crossmatch"] },
      { id: "adm-icu-microbiology", label: "Microbiology", testIds: ["blood-culture", "urine-culture"] },
      { id: "adm-icu-imaging", label: "Imaging", testIds: ["ecg", "portable-chest-xray", "echo-2d", "fast"], purpose: "Bedside" },
    ],
  },
  {
    id: "package-adm-ot",
    name: "OT / PRE-OPERATIVE PROFILE (ADM-OT)",
    trigger: "Pre-Anaesthetic Check-up (PAC)",
    bundles: [
      { id: "adm-ot-haematology", label: "Haematology", testIds: ["cbc", "pt-inr", "aptt"], purpose: "Bleeding risk" },
      { id: "adm-ot-biochemistry", label: "Biochemistry", testIds: ["rft-kft", "lft", "rbs", "electrolytes"], purpose: "Fitness for anaesthesia" },
      { id: "adm-ot-transfusion", label: "Transfusion", testIds: ["blood-rh-crossmatch"], purpose: "Blood availability before OT" },
      { id: "adm-ot-viral-markers", label: "Viral markers", testIds: ["viral-markers"], purpose: "Mandatory pre-op screen" },
      { id: "adm-ot-clinical-path", label: "Clinical Path", testIds: ["urine-rm"] },
      { id: "adm-ot-cardiac-imaging", label: "Cardiac / Imaging", testIds: ["ecg-12", "chest-xray"] },
    ],
  },
  {
    id: "package-adm-post",
    name: "POST-OP / POST-PROCEDURE PROFILE (ADM-POST)",
    trigger: "on shift from OT",
    bundles: [
      { id: "adm-post-core", label: "Core", testIds: ["cbc", "rft-kft", "electrolytes", "rbs"], purpose: "Recovery baseline" },
      { id: "adm-post-conditional", label: "Conditional", testIds: ["pt-inr", "abg-major", "blood-culture", "urine-culture"], purpose: "As indicated or advice" },
    ],
  },
];

export const previousTestOrders: LaboratoryOrderHistory[] = [
  { id: "hist-cbc", label: "CBC (12 Apr)", selectedTestIds: ["cbc"], selectedGroupIds: [] },
  { id: "hist-lft", label: "LFT (02 Mar)", selectedTestIds: ["lft"], selectedGroupIds: ["liver-profile"] },
  { id: "hist-kft", label: "KFT (02 Mar)", selectedTestIds: ["rft-kft"], selectedGroupIds: ["renal-profile"] },
];

const today = new Date();
const orderDateTime = `${today.toISOString().slice(0, 10)} ${today.toTimeString().slice(0, 5)}`;

export const summaryRows: LaboratorySummaryRow[] = [
  { id: "sum-cbc", name: "CBC", loinc: "58410-2", cpt: "85027", department: "Hematology", specimen: "Blood", priority: "Routine", status: "Ordered", orderedBy: "Dr. Kavita Rao", orderDateTime },
  { id: "sum-rft-kft", name: "RFT/KFT", loinc: "24362-6", cpt: "80048", department: "Biochemistry", specimen: "Blood", priority: "Routine", status: "Sample Collected", orderedBy: "Dr. Kavita Rao", orderDateTime },
  { id: "sum-renal", name: "Renal Profile (KFT/RFT)", loinc: "24362-6", cpt: "80053", department: "Biochemistry", specimen: "Blood", priority: "Urgent", status: "Received", orderedBy: "Dr. Kavita Rao", orderDateTime },
  { id: "sum-lft", name: "LFT", loinc: "24323-8", cpt: "80076", department: "Biochemistry", specimen: "Blood", priority: "STAT", status: "Processing", orderedBy: "Dr. Kavita Rao", orderDateTime },
];

export const resultBlocks: LaboratoryResultBlock[] = [
  {
    id: "result-cbc",
    name: "CBC - complete blood count",
    specialty: "Hematology",
    specimen: "Blood",
    rows: [
      { parameter: "Hemoglobin", result: "9.8", unit: "g/dL", referenceRange: "12.0 - 16.0", flag: "L" },
      { parameter: "WBC", result: "7.2", unit: "x10^3/uL", referenceRange: "4.5 - 11.0", flag: "N" },
      { parameter: "Platelets", result: "240", unit: "x10^3/uL", referenceRange: "150 - 400", flag: "N" },
    ],
  },
  {
    id: "result-rft-kft",
    name: "RFT/KFT - renal function test",
    specialty: "Biochemistry",
    specimen: "Blood",
    rows: [
      { parameter: "Serum creatinine", result: "2.1", unit: "mg/dL", referenceRange: "0.6 - 1.2", flag: "H" },
      { parameter: "Blood urea nitrogen", result: "38", unit: "mg/dL", referenceRange: "7 - 25", flag: "H" },
      { parameter: "Uric acid", result: "5.4", unit: "mg/dL", referenceRange: "3.4 - 7.0", flag: "N" },
    ],
  },
];

export const diagnosisTypes = ["Primary", "Secondary", "Differential"];
