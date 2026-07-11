export type NursingFieldType = "Dropdown" | "Free text" | "Number" | "Calculated" | "Date and time";
export type NursingSelectable = "Single" | "Multiple" | "None";
export type CareProblemStatus = "Active" | "Adequate for discharge" | "Resolved";
export type GoalProgress = "Pending" | "Achieved" | "Partially achieved" | "Achieved and completed";

export type AssessmentRow = {
  id: string;
  group: string;
  label: string;
  fieldType: NursingFieldType;
  selectable: NursingSelectable;
  options?: string[];
  formula?: string;
  commentBox?: boolean;
  intake?: boolean;
  output?: boolean;
};

export type AssessmentGroup = {
  id: string;
  name: string;
  displayName: string;
  active: boolean;
  rows: AssessmentRow[];
};

export type CareIntervention = {
  id: string;
  name: string;
  completed: boolean;
  worklist: boolean;
  lastNote?: string;
};

export type CareGoal = {
  id: string;
  name: string;
  progress: GoalProgress;
  recentNote: string;
  interventions: CareIntervention[];
};

export type CareProblem = {
  id: string;
  name: string;
  status: CareProblemStatus;
  goals: CareGoal[];
};

export type CarePlan = {
  id: string;
  name: string;
  patient: string;
  visit: string;
  problems: CareProblem[];
};

export const assessmentGroups: AssessmentGroup[] = [
  {
    id: "grp-urine",
    name: "Urine assessment",
    displayName: "Urine Assessment",
    active: true,
    rows: [
      { id: "r2", group: "Urine assessment", label: "Urine Volume (in ml)", fieldType: "Number", selectable: "None", output: true },
      { id: "r3", group: "Urine assessment", label: "Urine incontinence", fieldType: "Dropdown", selectable: "Single", options: ["Yes", "No"] },
      { id: "r4", group: "Urine assessment", label: "Unmeasured Urine occurrence", fieldType: "Dropdown", selectable: "Single", options: ["Yes", "No"] },
      { id: "r5", group: "Urine assessment", label: "Urine colour", fieldType: "Dropdown", selectable: "Single", options: ["Yellow/Straw", "Amber", "Brown", "Colourless", "Red", "Blue", "Orange", "Pink", "Unable to assess"], commentBox: true },
      { id: "r6", group: "Urine assessment", label: "Urine appearance", fieldType: "Dropdown", selectable: "Multiple", options: ["Clear", "Cloudy", "Hazy", "Sediment", "Blood clots", "Mucous", "Purulent", "Red flecks", "Stones", "Unable to assess"], commentBox: true },
      { id: "r7", group: "Urine assessment", label: "Urine Odor", fieldType: "Dropdown", selectable: "Multiple", options: ["Fruity", "Malodorous", "No odor", "Unable to assess"], commentBox: true },
      { id: "r8", group: "Urine assessment", label: "Diaper weight (in ml)", fieldType: "Number", selectable: "None", output: true },
    ],
  },
  {
    id: "grp-stool",
    name: "Stool assessment",
    displayName: "Stool Assessment",
    active: true,
    rows: [
      { id: "st1", group: "Stool assessment", label: "Unmeasured stool occurrence", fieldType: "Dropdown", selectable: "Single", options: ["Yes", "No"] },
      { id: "st2", group: "Stool assessment", label: "Stool (ml)", fieldType: "Number", selectable: "None", output: true },
      { id: "st3", group: "Stool assessment", label: "Bowel incontinence", fieldType: "Dropdown", selectable: "Single", options: ["Yes", "No"] },
      { id: "st4", group: "Stool assessment", label: "Stool amount", fieldType: "Dropdown", selectable: "Single", options: ["Smear", "Small", "Medium", "Large", "Unable to assess"] },
      { id: "st5", group: "Stool assessment", label: "Stool Appearance", fieldType: "Dropdown", selectable: "Multiple", options: ["Formed", "Loose", "Soft", "Hard", "Bloody", "Mucous", "Watery", "Unable to assess"] },
      { id: "st6", group: "Stool assessment", label: "Stool colour", fieldType: "Dropdown", selectable: "Multiple", options: ["Black", "Brown", "Clay", "Green", "Meconium", "Red", "Red streaks", "Tan", "Yellow", "Unable to assess"] },
    ],
  },
  {
    id: "grp-fall",
    name: "Morse Fall risk assessment",
    displayName: "Morse Fall Risk",
    active: true,
    rows: [
      { id: "ri4", group: "Morse Fall risk assessment", label: "History of falling    ri4", fieldType: "Dropdown", selectable: "Single", options: ["Yes=25", "No=0"] },
      { id: "ri5", group: "Morse Fall risk assessment", label: "Secondary diagnosis     ri5", fieldType: "Dropdown", selectable: "Single", options: ["Yes=15", "No=0"] },
      { id: "ri6", group: "Morse Fall risk assessment", label: "Ambulatory aids     ri6", fieldType: "Dropdown", selectable: "Single", options: ["None/bed rest/Nurse assist=0", "Crutches/Walker/Cane=15", "Furniture=30"] },
      { id: "ri7", group: "Morse Fall risk assessment", label: "Intravanous therepy /heparin / salin lock     ri7", fieldType: "Dropdown", selectable: "Single", options: ["Yes=20", "No=0"] },
      { id: "ri8", group: "Morse Fall risk assessment", label: "Gait/Transferring     r8", fieldType: "Dropdown", selectable: "Single", options: ["Normal/Bed rest/Wheel chair=0", "Weak=10", "Impaired=20"] },
      { id: "ri9", group: "Morse Fall risk assessment", label: "Mental status     r9", fieldType: "Dropdown", selectable: "Single", options: ["Oriented to own ability=0", "Over estimates/Forgets limitations=15"] },
      { id: "ri10", group: "Morse Fall risk assessment", label: "Score", fieldType: "Calculated", selectable: "None", formula: "ri4+ri5+ri6+ri7+ri8+ri9" },
      { id: "ri11", group: "Morse Fall risk assessment", label: "Fall risk Intervention", fieldType: "Dropdown", selectable: "Single", options: ["Yellow fall risk band applied", "Non-skid socks applied", "Falling star sign placed at bedside", "Bed in lowest position", "Strecher/chair alarm in place", "Placed close to nurse station"] },
    ],
  },
  {
    id: "grp-emesis",
    name: "Emesis Assessment",
    displayName: "Emesis Assessment",
    active: true,
    rows: [
      { id: "em1", group: "Emesis Assessment", label: "Emesis (in ml)", fieldType: "Number", selectable: "None", output: true },
      { id: "em2", group: "Emesis Assessment", label: "Unmeasured Emesis Occurrence", fieldType: "Dropdown", selectable: "Single", options: ["Yes", "No"] },
      { id: "em3", group: "Emesis Assessment", label: "Emesis amount", fieldType: "Dropdown", selectable: "Single", options: ["Smear", "Small", "Medium", "Large", "Unable to assess"] },
      { id: "em4", group: "Emesis Assessment", label: "Emesis colour/Appearance", fieldType: "Dropdown", selectable: "Multiple", options: ["Black", "Brown", "Coffee ground", "Clear", "Green", "Mucous", "Projectile", "Red", "Tan", "Undigested food", "Wet burp", "Yellow"], commentBox: true },
    ],
  },
  {
    id: "grp-adl",
    name: "Daily living Activities assessment",
    displayName: "Daily Living Activities",
    active: true,
    rows: [
      { id: "adl1", group: "Daily living Activities assessment", label: "Dominant hand", fieldType: "Dropdown", selectable: "Single", options: ["Right", "Left"] },
      { id: "adl2", group: "Daily living Activities assessment", label: "Dressing", fieldType: "Dropdown", selectable: "Single", options: ["Independent", "Needs assistant", "Dependent", "Unable to assess"] },
      { id: "adl3", group: "Daily living Activities assessment", label: "Grooming", fieldType: "Dropdown", selectable: "Single", options: ["Independent", "Needs assistant", "Dependent", "Unable to assess"] },
      { id: "adl4", group: "Daily living Activities assessment", label: "Feeding", fieldType: "Dropdown", selectable: "Single", options: ["Independent", "Needs assistant", "Dependent", "Unable to assess"] },
      { id: "adl5", group: "Daily living Activities assessment", label: "Bathing", fieldType: "Dropdown", selectable: "Single", options: ["Independent", "Needs assistant", "Dependent", "Unable to assess"] },
      { id: "adl6", group: "Daily living Activities assessment", label: "Toileting", fieldType: "Dropdown", selectable: "Single", options: ["Independent", "Needs assistant", "Dependent", "Unable to assess"] },
      { id: "adl7", group: "Daily living Activities assessment", label: "In/Out Bed", fieldType: "Dropdown", selectable: "Single", options: ["Independent", "Needs assistant", "Dependent", "Unable to assess"] },
      { id: "adl8", group: "Daily living Activities assessment", label: "Weakness of legs", fieldType: "Dropdown", selectable: "Single", options: ["Right", "Left", "None", "Both", "Unable to assess"] },
      { id: "adl9", group: "Daily living Activities assessment", label: "Hearing - Right ear", fieldType: "Dropdown", selectable: "Single", options: ["Functional", "Difficulty with noise", "Deaf", "Hearing aid", "Cochlear implant", "Unable to assess"] },
    ],
  },
  {
    id: "grp-braden",
    name: "Braden scale Assessment",
    displayName: "Braden Scale Assessment",
    active: true,
    rows: [
      { id: "br1", group: "Braden scale Assessment", label: "Sensory perceptions", fieldType: "Dropdown", selectable: "Single", options: ["Completely limited", "Very limited", "Slightly limited", "No impairment"] },
      { id: "br2", group: "Braden scale Assessment", label: "Moisture", fieldType: "Dropdown", selectable: "Single", options: ["Constantly moist", "Very moist", "Occasionally moist", "Rarely moist"] },
      { id: "br3", group: "Braden scale Assessment", label: "Activity", fieldType: "Dropdown", selectable: "Single", options: ["Bed fast", "Chair fast", "Walks occasionally", "Walks frequently"] },
      { id: "br4", group: "Braden scale Assessment", label: "Mobility", fieldType: "Dropdown", selectable: "Single", options: ["Completely immobile", "Very limited", "Slightly limited", "No limitation"] },
      { id: "br5", group: "Braden scale Assessment", label: "Nutrition", fieldType: "Dropdown", selectable: "Single", options: ["Very poor", "Probably inadequate", "Adequate", "Excellent"] },
      { id: "br6", group: "Braden scale Assessment", label: "Friction and Shear", fieldType: "Dropdown", selectable: "Single", options: ["Problem", "Potential problem", "No apparent problem"] },
      { id: "br7", group: "Braden scale Assessment", label: "Braden score", fieldType: "Calculated", selectable: "None", formula: "br1+br2+br3+br4+br5+br6" },
    ],
  },
  {
    id: "grp-oxygen",
    name: "Oxygen therapy Assessment",
    displayName: "Oxygen Therapy Assessment",
    active: true,
    rows: [
      { id: "ox1", group: "Oxygen therapy Assessment", label: "ETCO2 Level", fieldType: "Free text", selectable: "None" },
      { id: "ox2", group: "Oxygen therapy Assessment", label: "SpO2 (Right hand)", fieldType: "Free text", selectable: "None" },
      { id: "ox3", group: "Oxygen therapy Assessment", label: "O2 device", fieldType: "Dropdown", selectable: "Single", options: ["None (Room air)", "High flow nasal canula"] },
      { id: "ox4", group: "Oxygen therapy Assessment", label: "FiO2 (%)", fieldType: "Number", selectable: "None" },
      { id: "ox5", group: "Oxygen therapy Assessment", label: "Start", fieldType: "Date and time", selectable: "None" },
      { id: "ox6", group: "Oxygen therapy Assessment", label: "End", fieldType: "Date and time", selectable: "None" },
      { id: "ox7", group: "Oxygen therapy Assessment", label: "Pulse oximetry type", fieldType: "Dropdown", selectable: "Single", options: ["Intermittent", "Continuous"] },
    ],
  },
  {
    id: "grp-ng",
    name: "NG Aspiration assessment",
    displayName: "NG Aspiration Assessment",
    active: true,
    rows: [
      { id: "ng1", group: "NG Aspiration assessment", label: "Volume (ml)", fieldType: "Number", selectable: "None", output: true },
      { id: "ng2", group: "NG Aspiration assessment", label: "Colour", fieldType: "Dropdown", selectable: "Multiple", options: ["Coffee ground", "Green", "Blood stained", "Clear"], commentBox: true },
      { id: "ng3", group: "NG Aspiration assessment", label: "Content", fieldType: "Dropdown", selectable: "Multiple", options: ["Blood", "Bilious", "Fecal", "Normal"], commentBox: true },
    ],
  },
  {
    id: "grp-neuro",
    name: "Neuro assessment",
    displayName: "Neuro Assessment",
    active: true,
    rows: [
      { id: "neuro1", group: "Neuro assessment", label: "Pupil size", fieldType: "Dropdown", selectable: "Single", options: ["1 mm", "2 mm", "3 mm", "4 mm", "5 mm", "Unequal", "Unable to assess"], commentBox: true },
      { id: "neuro2", group: "Neuro assessment", label: "Pupil reactivity", fieldType: "Dropdown", selectable: "Single", options: ["Brisk", "Sluggish", "Fixed", "Unable to assess"], commentBox: true },
      { id: "neuro3", group: "Neuro assessment", label: "Sedation assessment", fieldType: "Dropdown", selectable: "Single", options: ["RASS +4 Combative", "RASS +2 Agitated", "RASS 0 Alert and calm", "RASS -2 Light sedation", "RASS -5 Unarousable"] },
      { id: "neuro4", group: "Neuro assessment", label: "CAM score (Delirium)", fieldType: "Dropdown", selectable: "Single", options: ["Positive", "Negative", "Unable to assess"] },
      { id: "neuro5", group: "Neuro assessment", label: "GCS score", fieldType: "Number", selectable: "None", commentBox: true },
    ],
  },
  {
    id: "grp-respiratory",
    name: "Respiratory",
    displayName: "Respiratory Assessment",
    active: true,
    rows: [
      { id: "resp1", group: "Respiratory", label: "Chest symmetry", fieldType: "Dropdown", selectable: "Single", options: ["Symmetrical", "Asymmetrical", "Unable to assess"], commentBox: true },
      { id: "resp2", group: "Respiratory", label: "Breath sounds", fieldType: "Dropdown", selectable: "Multiple", options: ["Clear", "Wheeze", "Crepitations", "Reduced air entry", "Absent", "Unable to assess"], commentBox: true },
      { id: "resp3", group: "Respiratory", label: "Respiratory effort", fieldType: "Dropdown", selectable: "Single", options: ["Normal", "Mild distress", "Moderate distress", "Severe distress"] },
      { id: "resp4", group: "Respiratory", label: "Respiratory rate", fieldType: "Number", selectable: "None" },
    ],
  },
  {
    id: "grp-ventilation",
    name: "Ventilation",
    displayName: "Ventilation Assessment",
    active: true,
    rows: [
      { id: "vent1", group: "Ventilation", label: "Ventilation mode", fieldType: "Dropdown", selectable: "Single", options: ["Room air", "Nasal cannula", "Mask", "NIV", "Invasive ventilator", "High flow nasal cannula"] },
      { id: "vent2", group: "Ventilation", label: "FiO2 (%)", fieldType: "Number", selectable: "None" },
      { id: "vent3", group: "Ventilation", label: "PEEP", fieldType: "Number", selectable: "None" },
      { id: "vent4", group: "Ventilation", label: "Tidal volume", fieldType: "Number", selectable: "None" },
      { id: "vent5", group: "Ventilation", label: "ETCO2", fieldType: "Number", selectable: "None" },
    ],
  },
  {
    id: "grp-cardiovascular",
    name: "Cardiovascular",
    displayName: "Cardiovascular Assessment",
    active: true,
    rows: [
      { id: "cv1", group: "Cardiovascular", label: "Heart rhythm", fieldType: "Dropdown", selectable: "Single", options: ["Regular", "Irregular", "Sinus rhythm", "AF", "VT", "Unable to assess"], commentBox: true },
      { id: "cv2", group: "Cardiovascular", label: "Peripheral pulses", fieldType: "Dropdown", selectable: "Single", options: ["Present", "Weak", "Absent", "Unable to assess"] },
      { id: "cv3", group: "Cardiovascular", label: "Capillary refill", fieldType: "Dropdown", selectable: "Single", options: ["< 2 sec", "2-3 sec", "> 3 sec", "Unable to assess"] },
      { id: "cv4", group: "Cardiovascular", label: "Edema", fieldType: "Dropdown", selectable: "Single", options: ["None", "+1", "+2", "+3", "+4"] },
    ],
  },
  {
    id: "grp-abdominal",
    name: "Abdominal assessment",
    displayName: "Abdominal Assessment",
    active: true,
    rows: [
      { id: "abd1", group: "Abdominal assessment", label: "Abdomen", fieldType: "Dropdown", selectable: "Single", options: ["Soft", "Distended", "Tender", "Rigid", "Unable to assess"], commentBox: true },
      { id: "abd2", group: "Abdominal assessment", label: "Bowel sounds", fieldType: "Dropdown", selectable: "Single", options: ["Present", "Absent", "Hypoactive", "Hyperactive", "Unable to assess"] },
      { id: "abd3", group: "Abdominal assessment", label: "Hands and legs power", fieldType: "Dropdown", selectable: "Single", options: ["Grade 0", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5"] },
      { id: "abd4", group: "Abdominal assessment", label: "Tone of limbs", fieldType: "Dropdown", selectable: "Single", options: ["Normal", "Hypotonia", "Hypertonia", "Unable to assess"] },
    ],
  },
  {
    id: "grp-metabolic",
    name: "Metabolic assessment",
    displayName: "Metabolic Assessment",
    active: true,
    rows: [
      { id: "met1", group: "Metabolic assessment", label: "Blood sugar", fieldType: "Number", selectable: "None" },
      { id: "met2", group: "Metabolic assessment", label: "Temperature", fieldType: "Number", selectable: "None" },
      { id: "met3", group: "Metabolic assessment", label: "Ketones", fieldType: "Dropdown", selectable: "Single", options: ["Negative", "Trace", "+", "++", "+++", "Unable to assess"] },
      { id: "met4", group: "Metabolic assessment", label: "SOFA score", fieldType: "Number", selectable: "None" },
      { id: "met5", group: "Metabolic assessment", label: "qSOFA score", fieldType: "Number", selectable: "None" },
    ],
  },
  {
    id: "grp-sepsis",
    name: "Sepsis",
    displayName: "Sepsis Assessment",
    active: true,
    rows: [
      { id: "sep1", group: "Sepsis", label: "Temperature", fieldType: "Number", selectable: "None" },
      { id: "sep2", group: "Sepsis", label: "ETCO2", fieldType: "Number", selectable: "None" },
      { id: "sep3", group: "Sepsis", label: "Consciousness", fieldType: "Dropdown", selectable: "Single", options: ["Alert", "Voice", "Pain", "Unresponsive"] },
      { id: "sep4", group: "Sepsis", label: "SOFA scoring system", fieldType: "Number", selectable: "None" },
      { id: "sep5", group: "Sepsis", label: "qSOFA score system", fieldType: "Number", selectable: "None" },
    ],
  },
  {
    id: "grp-fluid-balance",
    name: "Fluid Balance",
    displayName: "Fluid Balance",
    active: true,
    rows: [
      { id: "fb1", group: "Fluid Balance", label: "Oral intake (ml)", fieldType: "Number", selectable: "None", intake: true },
      { id: "fb2", group: "Fluid Balance", label: "IV intake (ml)", fieldType: "Number", selectable: "None", intake: true },
      { id: "fb3", group: "Fluid Balance", label: "Urine output (ml)", fieldType: "Number", selectable: "None", output: true },
      { id: "fb4", group: "Fluid Balance", label: "Drain output (ml)", fieldType: "Number", selectable: "None", output: true },
      { id: "fb5", group: "Fluid Balance", label: "Balance", fieldType: "Calculated", selectable: "None", formula: "fb1+fb2-fb3-fb4" },
    ],
  },
];

export const assessmentTimes = ["08:00", "10:00", "12:00", "14:00", "Now"];
export const preferredAssessmentIds = ["grp-urine", "grp-fall", "grp-oxygen"];

export const carePlans: CarePlan[] = [
  {
    id: "cp-1",
    name: "Post operative recovery care plan",
    patient: "Aarav Sharma",
    visit: "IPD-1188",
    problems: [
      {
        id: "p1",
        name: "Acute pain",
        status: "Active",
        goals: [
          {
            id: "g1",
            name: "Pain score below 3/10",
            progress: "Partially achieved",
            recentNote: "Pain reduced after reassessment at 10:30.",
            interventions: [
              { id: "i1", name: "Assess pain every 4 hours", completed: true, worklist: true, lastNote: "Pain score documented as 4/10." },
              { id: "i2", name: "Position for comfort", completed: false, worklist: true },
              { id: "i3", name: "Escalate uncontrolled pain to consultant", completed: false, worklist: false },
            ],
          },
          {
            id: "g2",
            name: "Patient ambulates with support",
            progress: "Pending",
            recentNote: "Awaiting physiotherapy review.",
            interventions: [
              { id: "i4", name: "Assist first walk", completed: false, worklist: true },
              { id: "i5", name: "Check dizziness before mobilization", completed: true, worklist: false },
            ],
          },
        ],
      },
      {
        id: "p2",
        name: "Risk for fall",
        status: "Adequate for discharge",
        goals: [
          {
            id: "g3",
            name: "Fall precautions maintained",
            progress: "Achieved",
            recentNote: "Bed low, call bell within reach, fall band applied.",
            interventions: [
              { id: "i6", name: "Apply fall risk band", completed: true, worklist: true, lastNote: "Yellow band applied." },
              { id: "i7", name: "Keep bedside clear", completed: true, worklist: false },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "cp-2",
    name: "Fluid balance monitoring",
    patient: "Meera Iyer",
    visit: "IPD-1192",
    problems: [
      {
        id: "p3",
        name: "Risk for fluid imbalance",
        status: "Active",
        goals: [
          {
            id: "g4",
            name: "Intake and output documented each shift",
            progress: "Achieved",
            recentNote: "Urine output captured at 08:00 and 12:00.",
            interventions: [
              { id: "i8", name: "Record urine volume", completed: true, worklist: true },
              { id: "i9", name: "Notify doctor for low urine output", completed: false, worklist: false },
            ],
          },
        ],
      },
    ],
  },
];

export const carePlanProgressNotes = [
  { id: "n1", time: "21 May 2026 10:30", goal: "Pain score below 3/10", intervention: "Assess pain every 4 hours", note: "Pain score 4/10, patient comfortable after repositioning." },
  { id: "n2", time: "21 May 2026 11:10", goal: "Fall precautions maintained", intervention: "Apply fall risk band", note: "Yellow band applied and education provided." },
  { id: "n3", time: "21 May 2026 12:00", goal: "Intake and output documented each shift", intervention: "Record urine volume", note: "Urine output 350 ml, clear yellow." },
];

export const carePlanTemplates = [
  { id: "tpl-1", name: "Post operative recovery care plan", problems: 2, goals: 3, interventions: 7, active: true },
  { id: "tpl-2", name: "Fluid balance monitoring", problems: 1, goals: 1, interventions: 4, active: true },
  { id: "tpl-3", name: "Fall prevention", problems: 1, goals: 2, interventions: 6, active: true },
  { id: "tpl-4", name: "Respiratory support", problems: 2, goals: 2, interventions: 5, active: false },
];
