export type CalculatorField = {
  key: string;
  label: string;
  type?: "number" | "select" | "checkbox";
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ label: string; value: string }>;
};

export type CalculationResult = {
  value: string;
  unit: string;
  interpretation: string;
  trace: string;
};
export type CalculatorDefinition = {
  fields: CalculatorField[];
  calculate: (_v: Record<string, string>) => CalculationResult;
};

const sex = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
];
const n = (v: Record<string, string>, key: string) => Number(v[key]);
const checked = (v: Record<string, string>, key: string) => v[key] === "1";
const num = (
  key: string,
  label: string,
  unit?: string,
  min?: number,
  max?: number,
  step = 1,
): CalculatorField => ({ key, label, unit, min, max, step, type: "number" });
const yn = (key: string, label: string): CalculatorField => ({ key, label, type: "checkbox" });
const select = (
  key: string,
  label: string,
  options: CalculatorField["options"],
): CalculatorField => ({ key, label, type: "select", options });

function apacheTemp(x: number) {
  return x >= 41 || x < 30
    ? 4
    : x >= 39 || x < 32
      ? 3
      : x >= 32 && x < 34
        ? 2
        : x >= 38.5 || x < 36
          ? 1
          : 0;
}
function apacheMap(x: number) {
  return x >= 160 || x < 50 ? 4 : x >= 130 || x < 70 ? 3 : x >= 110 ? 2 : 0;
}
function apacheHr(x: number) {
  return x >= 180 || x < 40 ? 4 : x >= 140 || x < 55 ? 3 : x >= 130 || x < 70 ? 2 : 0;
}
function apacheRr(x: number) {
  return x >= 50 || x < 6 ? 4 : x >= 35 ? 3 : x < 10 ? 2 : x >= 25 || x < 12 ? 1 : 0;
}
function apacheOxygen(fio2: number, value: number) {
  if (fio2 >= 0.5) return value >= 500 ? 4 : value >= 350 ? 3 : value >= 200 ? 2 : 0; // A-aDO2
  return value < 55 ? 4 : value < 61 ? 3 : value < 71 ? 1 : 0; // PaO2
}
function apachePh(x: number) {
  return x >= 7.7 || x < 7.15 ? 4 : x >= 7.6 || x < 7.25 ? 3 : x < 7.33 ? 2 : x >= 7.5 ? 1 : 0;
}
function apacheNa(x: number) {
  return x >= 180 || x < 111 ? 4 : x >= 160 || x < 120 ? 3 : x < 130 ? 2 : x >= 155 ? 1 : 0;
}
function apacheK(x: number) {
  return x >= 7 || x < 2.5 ? 4 : x >= 6 ? 3 : x < 3 ? 2 : x >= 5.5 || x < 3.5 ? 1 : 0;
}
function apacheCr(x: number, acute: boolean) {
  const p = x >= 3.5 ? 4 : x >= 2 ? 3 : x >= 1.5 ? 2 : x < 0.6 ? 2 : 0;
  return acute ? p * 2 : p;
}
function apacheHct(x: number) {
  return x >= 60 || x < 20 ? 4 : x >= 50 || x < 30 ? 2 : x >= 46 || x < 30 ? 1 : 0;
}
function apacheWbc(x: number) {
  return x >= 40 || x < 1 ? 4 : x < 3 ? 2 : x >= 15 ? 1 : 0;
}
function agePoints(x: number) {
  return x >= 75 ? 6 : x >= 65 ? 5 : x >= 55 ? 3 : x >= 45 ? 2 : 0;
}

export const calculatorDefinitions: Record<string, CalculatorDefinition> = {
  bmi: {
    fields: [
      num("weight", "Weight", "kg", 1, 500, 0.1),
      num("height", "Height", "cm", 30, 250, 0.1),
    ],
    calculate: (v) => {
      const bmi = n(v, "weight") / (n(v, "height") / 100) ** 2;
      return {
        value: bmi.toFixed(1),
        unit: "kg/m²",
        interpretation:
          bmi < 18.5
            ? "Underweight"
            : bmi < 25
              ? "Normal range"
              : bmi < 30
                ? "Overweight"
                : "Obesity range",
        trace: `weight / height² = ${n(v, "weight")} / ${(n(v, "height") / 100).toFixed(2)}²`,
      };
    },
  },
  bsa: {
    fields: [
      num("weight", "Weight", "kg", 1, 500, 0.1),
      num("height", "Height", "cm", 30, 250, 0.1),
    ],
    calculate: (v) => {
      const bsa = Math.sqrt((n(v, "height") * n(v, "weight")) / 3600);
      return {
        value: bsa.toFixed(2),
        unit: "m²",
        interpretation: "Mosteller body surface area",
        trace: `√(height × weight / 3600)`,
      };
    },
  },
  "ideal-weight": {
    fields: [
      num("height", "Height", "cm", 100, 250, 0.1),
      select("gender", "Sex used by Devine formula", sex),
    ],
    calculate: (v) => {
      const inches = n(v, "height") / 2.54;
      const ibw = (v.gender === "Female" ? 45.5 : 50) + 2.3 * Math.max(0, inches - 60);
      return {
        value: ibw.toFixed(1),
        unit: "kg",
        interpretation: "Estimated ideal body weight (Devine)",
        trace: `${v.gender === "Female" ? "45.5" : "50"} + 2.3 × inches over 5 ft`,
      };
    },
  },
  creatinine: {
    fields: [
      num("age", "Age", "years", 18, 120),
      num("weight", "Weight", "kg", 1, 500, 0.1),
      num("serumCreatinine", "Serum creatinine", "mg/dL", 0.1, 30, 0.01),
      select("gender", "Sex coefficient", sex),
    ],
    calculate: (v) => {
      const crcl =
        ((140 - n(v, "age")) * n(v, "weight") * (v.gender === "Female" ? 0.85 : 1)) /
        (72 * n(v, "serumCreatinine"));
      return {
        value: Math.max(0, crcl).toFixed(1),
        unit: "mL/min",
        interpretation:
          crcl >= 90
            ? "Normal or high estimate"
            : crcl >= 60
              ? "Mildly decreased"
              : crcl >= 30
                ? "Moderately decreased"
                : crcl >= 15
                  ? "Severely decreased"
                  : "Kidney failure range",
        trace: `((140 − age) × weight × ${v.gender === "Female" ? "0.85" : "1"}) / (72 × SCr)`,
      };
    },
  },
  mdrd: {
    fields: [
      num("age", "Age", "years", 18, 120),
      num("serumCreatinine", "Serum creatinine", "mg/dL", 0.1, 30, 0.01),
      select("gender", "Sex coefficient", sex),
    ],
    calculate: (v) => {
      const egfr =
        175 *
        n(v, "serumCreatinine") ** -1.154 *
        n(v, "age") ** -0.203 *
        (v.gender === "Female" ? 0.742 : 1);
      return {
        value: egfr.toFixed(1),
        unit: "mL/min/1.73m²",
        interpretation:
          egfr >= 90
            ? "G1 range"
            : egfr >= 60
              ? "G2 range"
              : egfr >= 45
                ? "G3a range"
                : egfr >= 30
                  ? "G3b range"
                  : egfr >= 15
                    ? "G4 range"
                    : "G5 range",
        trace: `175 × SCr^-1.154 × age^-0.203 × ${v.gender === "Female" ? ".742" : "1"}`,
      };
    },
  },
  gcs: {
    fields: [
      select("eye", "Eye response", [
        { label: "None (1)", value: "1" },
        { label: "To pressure (2)", value: "2" },
        { label: "To sound (3)", value: "3" },
        { label: "Spontaneous (4)", value: "4" },
      ]),
      select("verbal", "Verbal response", [
        { label: "None (1)", value: "1" },
        { label: "Sounds (2)", value: "2" },
        { label: "Words (3)", value: "3" },
        { label: "Confused (4)", value: "4" },
        { label: "Oriented (5)", value: "5" },
      ]),
      select("motor", "Motor response", [
        { label: "None (1)", value: "1" },
        { label: "Extension (2)", value: "2" },
        { label: "Abnormal flexion (3)", value: "3" },
        { label: "Normal flexion (4)", value: "4" },
        { label: "Localizing (5)", value: "5" },
        { label: "Obeys commands (6)", value: "6" },
      ]),
    ],
    calculate: (v) => {
      const score = n(v, "eye") + n(v, "verbal") + n(v, "motor");
      return {
        value: String(score),
        unit: "/ 15",
        interpretation:
          score <= 8
            ? "Severe impairment"
            : score <= 12
              ? "Moderate impairment"
              : "Mild/no impairment",
        trace: `E${v.eye} + V${v.verbal} + M${v.motor}`,
      };
    },
  },
  cha2ds2: {
    fields: [
      yn("chf", "Congestive heart failure/LV dysfunction (+1)"),
      yn("htn", "Hypertension (+1)"),
      num("age", "Age", "years", 18, 120),
      yn("diabetes", "Diabetes mellitus (+1)"),
      yn("stroke", "Prior stroke/TIA/systemic embolism (+2)"),
      yn("vascular", "Vascular disease (+1)"),
      select("gender", "Sex category", sex),
    ],
    calculate: (v) => {
      const score =
        +checked(v, "chf") +
        +checked(v, "htn") +
        (n(v, "age") >= 75 ? 2 : n(v, "age") >= 65 ? 1 : 0) +
        +checked(v, "diabetes") +
        (checked(v, "stroke") ? 2 : 0) +
        +checked(v, "vascular") +
        (v.gender === "Female" ? 1 : 0);
      return {
        value: String(score),
        unit: "points",
        interpretation:
          score === 0
            ? "Low score"
            : score === 1
              ? "Low-intermediate score"
              : "Elevated stroke-risk score",
        trace: "C + H + A₂/A + D + S₂ + V + Sc",
      };
    },
  },
  wells: {
    fields: [
      yn("cancer", "Active cancer (+1)"),
      yn("paralysis", "Paralysis/paresis or recent leg immobilization (+1)"),
      yn("bedridden", "Bedridden ≥3 days or major surgery within 12 weeks (+1)"),
      yn("tenderness", "Localized deep venous tenderness (+1)"),
      yn("swelling", "Entire leg swollen (+1)"),
      yn("calf", "Calf swelling ≥3 cm (+1)"),
      yn("edema", "Pitting edema confined to symptomatic leg (+1)"),
      yn("collateral", "Collateral superficial veins (+1)"),
      yn("previous", "Previous DVT (+1)"),
      yn("alternative", "Alternative diagnosis at least as likely (−2)"),
    ],
    calculate: (v) => {
      const positives = [
        "cancer",
        "paralysis",
        "bedridden",
        "tenderness",
        "swelling",
        "calf",
        "edema",
        "collateral",
        "previous",
      ].filter((k) => checked(v, k)).length;
      const score = positives - (checked(v, "alternative") ? 2 : 0);
      return {
        value: String(score),
        unit: "points",
        interpretation:
          score >= 2 ? "DVT likely (two-tier model)" : "DVT unlikely (two-tier model)",
        trace: `${positives} positive criteria${checked(v, "alternative") ? " − 2 alternative diagnosis" : ""}`,
      };
    },
  },
  curb65: {
    fields: [
      yn("confusion", "New confusion (+1)"),
      num("urea", "Blood urea nitrogen", "mg/dL", 1, 200, 0.1),
      num("rr", "Respiratory rate", "/min", 1, 80),
      num("sbp", "Systolic BP", "mmHg", 20, 300),
      num("dbp", "Diastolic BP", "mmHg", 10, 200),
      num("age", "Age", "years", 18, 120),
    ],
    calculate: (v) => {
      const score =
        +checked(v, "confusion") +
        +(n(v, "urea") > 19) +
        +(n(v, "rr") >= 30) +
        +(n(v, "sbp") < 90 || n(v, "dbp") <= 60) +
        +(n(v, "age") >= 65);
      return {
        value: String(score),
        unit: "points",
        interpretation:
          score <= 1
            ? "Low-risk group"
            : score === 2
              ? "Moderate-risk group"
              : "Severe pneumonia risk group",
        trace: "Confusion + BUN >19 + RR ≥30 + low BP + age ≥65",
      };
    },
  },
  sofa: {
    fields: [
      num("pao2fio2", "PaO₂/FiO₂ ratio", "mmHg", 0, 700),
      yn("respSupport", "Respiratory support"),
      num("platelets", "Platelets", "×10³/µL", 0, 1000),
      num("bilirubin", "Bilirubin", "mg/dL", 0, 50, 0.1),
      select("cardio", "Cardiovascular status", [
        { label: "MAP ≥70", value: "0" },
        { label: "MAP <70", value: "1" },
        { label: "Dopamine ≤5 or dobutamine any dose", value: "2" },
        { label: "Dopamine >5 or epinephrine/norepinephrine ≤0.1", value: "3" },
        { label: "Dopamine >15 or epinephrine/norepinephrine >0.1", value: "4" },
      ]),
      num("gcs", "Glasgow Coma Scale", "/15", 3, 15),
      num("creatinine", "Creatinine", "mg/dL", 0, 20, 0.1),
      num("urine", "Urine output in 24 h", "mL", 0, 10000),
    ],
    calculate: (v) => {
      const pf = n(v, "pao2fio2"),
        support = checked(v, "respSupport");
      const resp =
        pf < 100 && support ? 4 : pf < 200 && support ? 3 : pf < 300 ? 2 : pf < 400 ? 1 : 0;
      const p = n(v, "platelets"),
        coag = p < 20 ? 4 : p < 50 ? 3 : p < 100 ? 2 : p < 150 ? 1 : 0;
      const b = n(v, "bilirubin"),
        liver = b >= 12 ? 4 : b >= 6 ? 3 : b >= 2 ? 2 : b >= 1.2 ? 1 : 0;
      const g = n(v, "gcs"),
        cns = g < 6 ? 4 : g <= 9 ? 3 : g <= 12 ? 2 : g <= 14 ? 1 : 0;
      const cr = n(v, "creatinine"),
        u = n(v, "urine"),
        renal =
          u < 200 ? 4 : u < 500 ? 3 : cr >= 5 ? 4 : cr >= 3.5 ? 3 : cr >= 2 ? 2 : cr >= 1.2 ? 1 : 0;
      const score = resp + coag + liver + n(v, "cardio") + cns + renal;
      return {
        value: String(score),
        unit: "/ 24",
        interpretation:
          score >= 12
            ? "High organ-dysfunction burden"
            : score >= 7
              ? "Moderate organ-dysfunction burden"
              : "Lower organ-dysfunction score",
        trace: `Resp ${resp} + Coag ${coag} + Liver ${liver} + CV ${v.cardio} + CNS ${cns} + Renal ${renal}`,
      };
    },
  },
  apache: {
    fields: [
      num("temp", "Rectal/core temperature", "°C", 20, 45, 0.1),
      num("map", "Mean arterial pressure", "mmHg", 20, 250),
      num("hr", "Heart rate", "/min", 10, 250),
      num("rr", "Respiratory rate", "/min", 1, 80),
      num("fio2", "FiO₂", "fraction", 0.21, 1, 0.01),
      num("oxygen", "PaO₂ if FiO₂ <0.5; A-aDO₂ if ≥0.5", "mmHg", 0, 700),
      num("ph", "Arterial pH", "", 6.5, 8, 0.01),
      num("sodium", "Serum sodium", "mmol/L", 80, 220),
      num("potassium", "Serum potassium", "mmol/L", 1, 10, 0.1),
      num("creatinine", "Serum creatinine", "mg/dL", 0.1, 20, 0.1),
      yn("arf", "Acute renal failure (double creatinine points)"),
      num("hct", "Hematocrit", "%", 5, 80, 0.1),
      num("wbc", "WBC", "×10³/mm³", 0.1, 100, 0.1),
      num("gcs", "Glasgow Coma Scale", "/15", 3, 15),
      num("age", "Age", "years", 18, 120),
      select("chronic", "Severe chronic organ insufficiency/immunocompromise", [
        { label: "None", value: "0" },
        { label: "Non-operative or emergency postoperative (+5)", value: "5" },
        { label: "Elective postoperative (+2)", value: "2" },
      ]),
    ],
    calculate: (v) => {
      const parts = [
        apacheTemp(n(v, "temp")),
        apacheMap(n(v, "map")),
        apacheHr(n(v, "hr")),
        apacheRr(n(v, "rr")),
        apacheOxygen(n(v, "fio2"), n(v, "oxygen")),
        apachePh(n(v, "ph")),
        apacheNa(n(v, "sodium")),
        apacheK(n(v, "potassium")),
        apacheCr(n(v, "creatinine"), checked(v, "arf")),
        apacheHct(n(v, "hct")),
        apacheWbc(n(v, "wbc")),
        15 - n(v, "gcs"),
      ];
      const aps = parts.reduce((a, b) => a + b, 0),
        score = aps + agePoints(n(v, "age")) + n(v, "chronic");
      return {
        value: String(score),
        unit: "points",
        interpretation:
          score >= 30
            ? "Very high severity score"
            : score >= 20
              ? "High severity score"
              : score >= 10
                ? "Moderate severity score"
                : "Lower severity score",
        trace: `APS ${aps} + age ${agePoints(n(v, "age"))} + chronic health ${v.chronic}`,
      };
    },
  },
};

export function initialCalculatorValues(id: string, context: Record<string, string>) {
  const definition = calculatorDefinitions[id];
  return Object.fromEntries(
    definition.fields.map((field) => [
      field.key,
      context[field.key] || field.options?.[0]?.value || (field.type === "checkbox" ? "0" : ""),
    ]),
  );
}

export function validateCalculator(id: string, values: Record<string, string>) {
  return calculatorDefinitions[id].fields.find(
    (field) =>
      field.type === "number" &&
      (!values[field.key]?.trim() ||
        !Number.isFinite(Number(values[field.key])) ||
        (field.min != null && Number(values[field.key]) < field.min) ||
        (field.max != null && Number(values[field.key]) > field.max)),
  );
}
