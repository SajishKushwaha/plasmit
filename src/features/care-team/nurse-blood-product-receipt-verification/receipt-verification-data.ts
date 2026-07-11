export type BloodProductType =
  | "Whole Blood"
  | "Packed Red Cells"
  | "Fresh Frozen Plasma"
  | "Cryoprecipitate"
  | "Platelet Concentrate"
  | "Platelet on Cell Separator"
  | "Plasma on Cell Separator"
  | "Cryo Poor Plasma"
  | "Others";

export type BagVerification = {
  bagNo: string;
  bloodGroup: string;
  collectionDate: string;
  expiryDate: string;
  compatibilityConfirmed: boolean;
};

export type NurseBloodProductRecord = {
  patientName: string;
  mrn: string;
  dob: string;
  sex: string;
  wardBed: string;
  bloodGroup: string;
  consentTaken: "Yes" | "No";
  patientIdentityVerified: boolean;
  prescriptionChecked: boolean;
  unitLabelChecked: boolean;
  bloodGroupConfirmed: boolean;
  compatibilityVerified: boolean;
  baselineVitalsChecked: boolean;
  noReactionHistory: boolean;
  componentType: BloodProductType;
  componentOtherText: string;
  bags: BagVerification[];
  patientAbortedLabel?: string;
  pulse: string;
  bloodPressure: string;
  respiratoryRate: string;
  temperature: string;
  painScore: string;
  doctorSignature: string;
  nurseSignature: string;
  verifiedAt: string;
};

export const nurseBloodProductTypes: BloodProductType[] = [
  "Whole Blood",
  "Packed Red Cells",
  "Fresh Frozen Plasma",
  "Cryoprecipitate",
  "Platelet Concentrate",
  "Platelet on Cell Separator",
  "Plasma on Cell Separator",
  "Cryo Poor Plasma",
  "Others",
];

export const nurseBloodProductStaticRecords: NurseBloodProductRecord[] = [
  {
    patientName: "Meera Joshi",
    mrn: "UHID-45821",
    dob: "1971-04-10",
    sex: "Female",
    wardBed: "Ward 3 / Bed 12",
    bloodGroup: "A+",
    consentTaken: "Yes",
    patientIdentityVerified: true,
    prescriptionChecked: true,
    unitLabelChecked: true,
    bloodGroupConfirmed: true,
    compatibilityVerified: true,
    baselineVitalsChecked: true,
    noReactionHistory: true,
    componentType: "Packed Red Cells",
    componentOtherText: "",
    patientAbortedLabel: "",
    bags: [
      {
        bagNo: "BU-10231",
        bloodGroup: "A+",
        collectionDate: "2026-06-14",
        expiryDate: "2026-06-21",
        compatibilityConfirmed: true,
      },
    ],
    pulse: "82",
    bloodPressure: "118/76",
    respiratoryRate: "18",
    temperature: "36.8",
    painScore: "2",
    doctorSignature: "Dr. Kavita Rao",
    nurseSignature: "Nurse Asha",
    verifiedAt: "2026-06-15 09:15",
  },
  {
    patientName: "Rahul Sharma",
    mrn: "UHID-1021",
    dob: "1984-09-02",
    sex: "Male",
    wardBed: "ICU / Bed 4",
    bloodGroup: "B+",
    consentTaken: "Yes",
    patientIdentityVerified: true,
    prescriptionChecked: true,
    unitLabelChecked: true,
    bloodGroupConfirmed: true,
    compatibilityVerified: false,
    baselineVitalsChecked: true,
    noReactionHistory: true,
    componentType: "Fresh Frozen Plasma",
    componentOtherText: "",
    patientAbortedLabel: "",
    bags: [
      {
        bagNo: "BU-20411",
        bloodGroup: "B+",
        collectionDate: "2026-06-13",
        expiryDate: "2026-06-19",
        compatibilityConfirmed: true,
      },
    ],
    pulse: "96",
    bloodPressure: "124/80",
    respiratoryRate: "20",
    temperature: "37.1",
    painScore: "3",
    doctorSignature: "Dr. Amit Sharma",
    nurseSignature: "Nurse Rani",
    verifiedAt: "2026-06-15 10:05",
  },
];
