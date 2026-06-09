"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as React from "react";
import { Check, ChevronDown, Edit3, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createCarePlanWorklistTaskId, upsertCarePlanWorklistTask } from "@/components/worklist/worklist-storage";
import { cn } from "@/lib/utils";
import { NursingPatientStrip, NursingShell } from "@/features/nursing/nursing-shared";

type ProblemStatus = "Active" | "Adequate for discharge" | "Resolved";
type GoalProgress = "Pending" | "Achieved" | "Partially achieved" | "Achieved and completed";

type TemplateIntervention = {
  id: string;
  name: string;
};

type TemplateGoal = {
  id: string;
  name: string;
  interventions: TemplateIntervention[];
};

type TemplateProblem = {
  id: string;
  name: string;
  goals: TemplateGoal[];
};

type CarePlanTemplate = {
  id: string;
  name: string;
  problems: TemplateProblem[];
};

type CarePlanSelectionTemplate = CarePlanTemplate & {
  sourceTemplateId?: string;
};

type WorklistDetails = {
  taskName: string;
  category: string;
  priority: string;
  frequency: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  notes: string;
};

type DocumentIntervention = TemplateIntervention & {
  worklist: boolean;
  worklistDetails?: WorklistDetails;
  completedAt?: string;
  completionNote?: string;
  documentationNote?: string;
  documentationNoteTime?: string;
};

type DocumentGoal = Omit<TemplateGoal, "interventions"> & {
  progress: GoalProgress;
  recentNote?: string;
  recentNoteTime?: string;
  interventions: DocumentIntervention[];
};

type DocumentProblem = Omit<TemplateProblem, "goals"> & {
  status: ProblemStatus;
  goals: DocumentGoal[];
};

type DocumentCarePlan = Omit<CarePlanTemplate, "problems"> & {
  sourceTemplateId?: string;
  problems: DocumentProblem[];
};

type ProgressNoteRow = {
  id: string;
  time: string;
  carePlan: string;
  problem: string;
  goal: string;
  intervention: string;
  text: string;
};

type AddTarget =
  | { type: "problem"; planId: string }
  | { type: "goal"; planId: string; problemId: string }
  | { type: "intervention"; planId: string; problemId: string; goalId: string };

type WorklistTarget = {
  planId: string;
  problemId: string;
  goalId: string;
  interventionId: string;
} & WorklistDetails;

type WorklistDetailsTarget = {
  planId: string;
  problemId: string;
  goalId: string;
  interventionId: string;
  interventionName: string;
  details: WorklistDetails;
};

type CheckboxClearTarget = {
  planId: string;
  problemId: string;
  goalId: string;
  interventionId: string;
  interventionName: string;
};

type NoteTarget = {
  planId: string;
  problemId: string;
  goalId: string;
  carePlan: string;
  goal: string;
  intervention?: string;
  interventions?: DocumentIntervention[];
  text?: string;
  time?: string;
};

type InterventionNoteTarget = {
  planId: string;
  problemId: string;
  goalId: string;
  interventionId: string;
  carePlan: string;
  goal: string;
  intervention: string;
  time?: string;
  text?: string;
};

type NoteDetailsTarget = Required<Pick<NoteTarget, "planId" | "problemId" | "goalId" | "carePlan" | "goal" | "text">> & {
  time?: string;
};

type CompletionTarget = {
  planId: string;
  problemId: string;
  goalId: string;
  goal: string;
  interventionId: string;
  intervention: string;
};

const frequencyOptions = ["Once", "Every 2 hours", "Every 4 hours", "Every shift"];

let carePlanInstanceCounter = 0;

function createWorklistDetails(taskName: string): WorklistDetails {
  return {
    taskName,
    category: "Nursing intervention",
    priority: "Routine",
    frequency: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    notes: "",
  };
}

const initialTemplates: CarePlanTemplate[] = [
  {
    id: "tpl-burns",
    name: "Burns care plan",
    problems: [
      {
        id: "bp-1",
        name: "Acute pain related to tissue injury",
        goals: [
          {
            id: "bg-1",
            name: "Pain will reduce to tolerable level",
            interventions: [
              { id: "bi-1", name: "Assess pain score every 4 hours" },
              { id: "bi-2", name: "Administer prescribed pain medication" },
              { id: "bi-3", name: "Position patient for comfort" },
            ],
          },
          {
            id: "bg-2",
            name: "Patient will demonstrate comfort measures",
            interventions: [
              { id: "bi-4", name: "Teach relaxation breathing" },
              { id: "bi-5", name: "Keep affected area elevated as ordered" },
            ],
          },
        ],
      },
      {
        id: "bp-2",
        name: "Risk for infection",
        goals: [
          {
            id: "bg-3",
            name: "Wound will remain free from infection",
            interventions: [
              { id: "bi-6", name: "Use aseptic dressing technique" },
              { id: "bi-7", name: "Monitor temperature and wound discharge" },
              { id: "bi-8", name: "Apply prescribed topical ointment" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tpl-post-op",
    name: "Post operative recovery care plan",
    problems: [
      {
        id: "pop-1",
        name: "Acute pain after surgery",
        goals: [
          {
            id: "pog-1",
            name: "Pain score will remain within ordered target",
            interventions: [
              { id: "poi-1", name: "Assess pain score before and after analgesia" },
              { id: "poi-2", name: "Administer analgesics as prescribed" },
              { id: "poi-3", name: "Support incision during movement and coughing" },
            ],
          },
          {
            id: "pog-2",
            name: "Patient will mobilize safely as tolerated",
            interventions: [
              { id: "poi-4", name: "Assist first ambulation after surgery" },
              { id: "poi-5", name: "Monitor dizziness, bleeding, and vital signs" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tpl-fall",
    name: "Fall prevention care plan",
    problems: [
      {
        id: "fp-1",
        name: "Risk for fall",
        goals: [
          {
            id: "fg-1",
            name: "Patient will remain free from fall",
            interventions: [
              { id: "fi-1", name: "Keep bed in lowest position" },
              { id: "fi-2", name: "Apply yellow fall risk band" },
              { id: "fi-3", name: "Place call bell within reach" },
            ],
          },
          {
            id: "fg-2",
            name: "Patient will ask for assistance before walking",
            interventions: [
              { id: "fi-4", name: "Educate patient on fall precautions" },
              { id: "fi-5", name: "Assist during ambulation" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tpl-fluid",
    name: "Fluid balance monitoring",
    problems: [
      {
        id: "flp-1",
        name: "Risk for fluid imbalance",
        goals: [
          {
            id: "flg-1",
            name: "Intake and output will be documented each shift",
            interventions: [
              { id: "fli-1", name: "Record oral and IV intake" },
              { id: "fli-2", name: "Measure urine output" },
              { id: "fli-3", name: "Notify doctor for low urine output" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tpl-pressure",
    name: "Pressure injury prevention care plan",
    problems: [
      {
        id: "pp-1",
        name: "Impaired skin integrity",
        goals: [
          {
            id: "pg-1",
            name: "Skin breakdown will be prevented",
            interventions: [
              { id: "pi-1", name: "Turn and reposition every 2 hours" },
              { id: "pi-2", name: "Keep skin clean and dry" },
              { id: "pi-3", name: "Apply pressure relieving mattress" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tpl-diabetes",
    name: "Diabetes management care plan",
    problems: [
      {
        id: "dp-1",
        name: "Risk for unstable blood glucose",
        goals: [
          {
            id: "dg-1",
            name: "Blood glucose will remain within target range",
            interventions: [
              { id: "di-1", name: "Monitor capillary blood glucose as ordered" },
              { id: "di-2", name: "Administer insulin or oral medication as prescribed" },
              { id: "di-3", name: "Observe for hypoglycemia and hyperglycemia symptoms" },
            ],
          },
          {
            id: "dg-2",
            name: "Patient will follow diet and medication instructions",
            interventions: [
              { id: "di-4", name: "Provide diabetic diet teaching" },
              { id: "di-5", name: "Teach signs requiring urgent reporting" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tpl-hypertension",
    name: "Hypertension care plan",
    problems: [
      {
        id: "hp-1",
        name: "Elevated blood pressure",
        goals: [
          {
            id: "hg-1",
            name: "Blood pressure will trend toward ordered target",
            interventions: [
              { id: "hi-1", name: "Monitor blood pressure at ordered intervals" },
              { id: "hi-2", name: "Administer antihypertensive medication as prescribed" },
              { id: "hi-3", name: "Assess headache, chest pain, and visual changes" },
            ],
          },
          {
            id: "hg-2",
            name: "Patient will verbalize lifestyle precautions",
            interventions: [
              { id: "hi-4", name: "Educate on low salt diet" },
              { id: "hi-5", name: "Encourage medication adherence teaching" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tpl-copd",
    name: "COPD respiratory care plan",
    problems: [
      {
        id: "cpd-1",
        name: "Ineffective airway clearance",
        goals: [
          {
            id: "cg-1",
            name: "Patient will maintain clear airway",
            interventions: [
              { id: "ci-1", name: "Assess breath sounds and sputum characteristics" },
              { id: "ci-2", name: "Encourage coughing and deep breathing" },
              { id: "ci-3", name: "Administer nebulization or inhaler as prescribed" },
            ],
          },
          {
            id: "cg-2",
            name: "Oxygen saturation will remain within ordered range",
            interventions: [
              { id: "ci-4", name: "Monitor oxygen saturation continuously or as ordered" },
              { id: "ci-5", name: "Position in high Fowler's position" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tpl-pneumonia",
    name: "Pneumonia care plan",
    problems: [
      {
        id: "pnp-1",
        name: "Impaired gas exchange",
        goals: [
          {
            id: "png-1",
            name: "Respiratory status will improve",
            interventions: [
              { id: "pni-1", name: "Monitor respiratory rate and work of breathing" },
              { id: "pni-2", name: "Encourage incentive spirometry" },
              { id: "pni-3", name: "Administer antibiotics and oxygen as prescribed" },
            ],
          },
          {
            id: "png-2",
            name: "Fever and infection signs will reduce",
            interventions: [
              { id: "pni-4", name: "Monitor temperature and white blood cell trends" },
              { id: "pni-5", name: "Encourage oral fluids if not contraindicated" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tpl-heart-failure",
    name: "Heart failure care plan",
    problems: [
      {
        id: "hfp-1",
        name: "Excess fluid volume",
        goals: [
          {
            id: "hfg-1",
            name: "Fluid overload signs will decrease",
            interventions: [
              { id: "hfi-1", name: "Record strict intake and output" },
              { id: "hfi-2", name: "Monitor daily weight" },
              { id: "hfi-3", name: "Assess edema and lung sounds" },
            ],
          },
          {
            id: "hfg-2",
            name: "Patient will tolerate activity with less dyspnea",
            interventions: [
              { id: "hfi-4", name: "Cluster nursing care to conserve energy" },
              { id: "hfi-5", name: "Position patient for breathing comfort" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tpl-stroke",
    name: "Stroke rehabilitation care plan",
    problems: [
      {
        id: "sp-1",
        name: "Impaired physical mobility",
        goals: [
          {
            id: "sg-1",
            name: "Mobility and strength will improve",
            interventions: [
              { id: "si-1", name: "Assist active and passive range of motion" },
              { id: "si-2", name: "Maintain safe transfer techniques" },
              { id: "si-3", name: "Coordinate physiotherapy sessions" },
            ],
          },
          {
            id: "sg-2",
            name: "Patient will remain safe from aspiration",
            interventions: [
              { id: "si-4", name: "Assess swallowing before oral intake" },
              { id: "si-5", name: "Maintain aspiration precautions" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tpl-sepsis",
    name: "Sepsis monitoring care plan",
    problems: [
      {
        id: "sep-1",
        name: "Risk for systemic infection progression",
        goals: [
          {
            id: "seg-1",
            name: "Sepsis signs will be detected early",
            interventions: [
              { id: "sei-1", name: "Monitor temperature, pulse, respiratory rate, and blood pressure" },
              { id: "sei-2", name: "Report hypotension or altered sensorium immediately" },
              { id: "sei-3", name: "Collect cultures as ordered before antibiotics" },
            ],
          },
          {
            id: "seg-2",
            name: "Perfusion will remain adequate",
            interventions: [
              { id: "sei-4", name: "Monitor urine output hourly if ordered" },
              { id: "sei-5", name: "Administer IV fluids and antibiotics as prescribed" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tpl-renal",
    name: "Chronic kidney disease care plan",
    problems: [
      {
        id: "rp-1",
        name: "Risk for electrolyte imbalance",
        goals: [
          {
            id: "rg-1",
            name: "Electrolytes and fluid status will remain stable",
            interventions: [
              { id: "ri-1", name: "Monitor intake, output, and daily weight" },
              { id: "ri-2", name: "Review potassium, sodium, urea, and creatinine results" },
              { id: "ri-3", name: "Implement renal diet and fluid restriction as ordered" },
            ],
          },
          {
            id: "rg-2",
            name: "Patient will understand dialysis or follow-up needs",
            interventions: [
              { id: "ri-4", name: "Reinforce medication and diet teaching" },
              { id: "ri-5", name: "Prepare patient for dialysis if scheduled" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tpl-antenatal",
    name: "Antenatal observation care plan",
    problems: [
      {
        id: "ap-1",
        name: "Risk for maternal or fetal compromise",
        goals: [
          {
            id: "ag-1",
            name: "Mother and fetus will remain stable",
            interventions: [
              { id: "ai-1", name: "Monitor maternal vital signs" },
              { id: "ai-2", name: "Assess fetal movement and fetal heart rate as ordered" },
              { id: "ai-3", name: "Report bleeding, pain, leaking, or reduced fetal movement" },
            ],
          },
          {
            id: "ag-2",
            name: "Patient will understand warning symptoms",
            interventions: [
              { id: "ai-4", name: "Provide education on danger signs in pregnancy" },
              { id: "ai-5", name: "Encourage rest and prescribed follow-up" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tpl-postpartum",
    name: "Postpartum care plan",
    problems: [
      {
        id: "ppp-1",
        name: "Risk for postpartum bleeding and infection",
        goals: [
          {
            id: "ppg-1",
            name: "Bleeding will remain within expected limits",
            interventions: [
              { id: "ppi-1", name: "Assess lochia amount, color, and odor" },
              { id: "ppi-2", name: "Monitor uterine tone and fundal height" },
              { id: "ppi-3", name: "Report heavy bleeding or clots immediately" },
            ],
          },
          {
            id: "ppg-2",
            name: "Mother will demonstrate newborn care confidence",
            interventions: [
              { id: "ppi-4", name: "Support breastfeeding or feeding plan" },
              { id: "ppi-5", name: "Teach perineal hygiene and warning symptoms" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tpl-neonatal",
    name: "Neonatal care plan",
    problems: [
      {
        id: "np-1",
        name: "Risk for ineffective thermoregulation",
        goals: [
          {
            id: "ng-1",
            name: "Newborn temperature will remain stable",
            interventions: [
              { id: "ni-1", name: "Monitor temperature as ordered" },
              { id: "ni-2", name: "Maintain warm environment and skin-to-skin care" },
              { id: "ni-3", name: "Keep newborn dry and appropriately covered" },
            ],
          },
          {
            id: "ng-2",
            name: "Feeding and elimination will be adequate",
            interventions: [
              { id: "ni-4", name: "Record feeding frequency and amount" },
              { id: "ni-5", name: "Monitor urine and stool output" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tpl-fracture",
    name: "Fracture immobilization care plan",
    problems: [
      {
        id: "frp-1",
        name: "Impaired mobility related to fracture",
        goals: [
          {
            id: "frg-1",
            name: "Neurovascular status will remain intact",
            interventions: [
              { id: "fri-1", name: "Assess color, warmth, movement, sensation, and pulse" },
              { id: "fri-2", name: "Elevate limb as ordered" },
              { id: "fri-3", name: "Report increasing pain or numbness immediately" },
            ],
          },
          {
            id: "frg-2",
            name: "Patient will mobilize safely with support",
            interventions: [
              { id: "fri-4", name: "Teach use of walker, crutches, or sling" },
              { id: "fri-5", name: "Maintain fall prevention precautions" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tpl-wound",
    name: "Wound care plan",
    problems: [
      {
        id: "wp-1",
        name: "Impaired tissue integrity",
        goals: [
          {
            id: "wg-1",
            name: "Wound will show signs of healing",
            interventions: [
              { id: "wi-1", name: "Assess wound size, drainage, odor, and surrounding skin" },
              { id: "wi-2", name: "Perform dressing change using ordered technique" },
              { id: "wi-3", name: "Maintain nutrition and hydration support" },
            ],
          },
          {
            id: "wg-2",
            name: "Infection will be prevented",
            interventions: [
              { id: "wi-4", name: "Use hand hygiene and aseptic precautions" },
              { id: "wi-5", name: "Report redness, swelling, fever, or purulent drainage" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tpl-uti",
    name: "Urinary tract infection care plan",
    problems: [
      {
        id: "up-1",
        name: "Altered urinary elimination",
        goals: [
          {
            id: "ug-1",
            name: "Urinary symptoms will reduce",
            interventions: [
              { id: "ui-1", name: "Monitor urine frequency, burning, color, and odor" },
              { id: "ui-2", name: "Encourage oral fluids if not contraindicated" },
              { id: "ui-3", name: "Administer antibiotics as prescribed" },
            ],
          },
          {
            id: "ug-2",
            name: "Patient will understand UTI prevention",
            interventions: [
              { id: "ui-4", name: "Teach perineal hygiene" },
              { id: "ui-5", name: "Encourage timely voiding and reporting symptoms" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tpl-anemia",
    name: "Anemia fatigue care plan",
    problems: [
      {
        id: "anp-1",
        name: "Activity intolerance related to low hemoglobin",
        goals: [
          {
            id: "ang-1",
            name: "Patient will tolerate activity with less fatigue",
            interventions: [
              { id: "ani-1", name: "Assess fatigue, dizziness, and shortness of breath" },
              { id: "ani-2", name: "Cluster care and provide rest periods" },
              { id: "ani-3", name: "Monitor hemoglobin and vital signs as ordered" },
            ],
          },
          {
            id: "ang-2",
            name: "Patient will follow nutrition and medication plan",
            interventions: [
              { id: "ani-4", name: "Teach iron-rich diet and prescribed supplements" },
              { id: "ani-5", name: "Monitor for medication side effects" },
            ],
          },
        ],
      },
    ],
  },
];

function nowStamp() {
  return new Date().toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function carePlanSourceId(template: CarePlanTemplate): string {
  const sourceTemplateId = (template as CarePlanSelectionTemplate).sourceTemplateId;
  return sourceTemplateId || template.id;
}

function toDocumentPlan(template: CarePlanTemplate): DocumentCarePlan {
  carePlanInstanceCounter += 1;
  const suffix = `${Date.now()}-${carePlanInstanceCounter}`;
  return {
    id: `${template.id}-${suffix}`,
    sourceTemplateId: carePlanSourceId(template),
    name: template.name,
    problems: template.problems.map((problem) => ({
      ...problem,
      id: `${problem.id}-${suffix}`,
      status: "Active",
      goals: problem.goals.map((goal) => ({
        ...goal,
        id: `${goal.id}-${suffix}`,
        progress: "Pending",
        interventions: goal.interventions.map((intervention) => ({
          ...intervention,
          id: `${intervention.id}-${suffix}`,
          worklist: false,
        })),
      })),
    })),
  };
}

function Cell({
  children,
  className,
  colSpan,
}: {
  children?: React.ReactNode;
  className?: string;
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      className={cn("h-9 border border-border px-3 py-2 align-top text-sm leading-snug text-foreground", className)}
    >
      {children}
    </td>
  );
}

function SheetButton({
  children,
  className,
  onClick,
  onDoubleClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onDoubleClick?: () => void;
}) {
  return (
    <button
      className={cn("h-full w-full text-left text-sm leading-snug text-foreground outline-none hover:text-primary", className)}
      type="button"
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {children}
    </button>
  );
}

function SheetSelect({
  value,
  onChange,
  options,
  placeholder,
  placeholderForValue,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  placeholderForValue?: string;
  className?: string;
}) {
  return (
    <select
      className={cn(
        "h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20",
        className,
      )}
      value={value}
      onChange={(event) => onChange(event.target.value || placeholderForValue || value)}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

function CenterModal({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(calc(100vw-2rem),620px)] -translate-x-1/2 -translate-y-1/2 border border-[#000] bg-white p-0 text-black shadow-xl outline-none">
          <Dialog.Description className="sr-only">{title}</Dialog.Description>
          <div className="flex items-center justify-between border-b border-[#000] bg-[#4472c4] px-3 py-2 text-sm font-semibold text-white">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" className="h-7 w-7 text-white hover:bg-white/15" aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="max-h-[72vh] overflow-auto p-3">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function WorklistModal({
  target,
  onClose,
  onTargetChange,
  onSave,
}: {
  target: WorklistTarget | null;
  onClose: () => void;
  onTargetChange: (updates: Partial<WorklistDetails>) => void;
  onSave: (target: WorklistTarget) => void;
}) {
  const [frequencyDropdownOpen, setFrequencyDropdownOpen] = React.useState(false);
  const frequencySearch = target?.frequency.trim().toLowerCase() ?? "";
  const displayedFrequencyOptions = frequencyOptions.filter((option) => option.toLowerCase().includes(frequencySearch));

  return (
    <CenterModal open={Boolean(target)} onOpenChange={(open) => !open && onClose()} title="Add to work list">
      {target ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold">
            Task name
            <Input className="mt-1" value={target.taskName} onChange={(event) => onTargetChange({ taskName: event.target.value })} />
          </label>
          <label className="text-xs font-semibold">
            Category
            <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={target.category} onChange={(event) => onTargetChange({ category: event.target.value })}>
              <option>Nursing intervention</option>
              <option>Medication</option>
              <option>Vitals</option>
            </select>
          </label>
          <label className="text-xs font-semibold">
            Priority
            <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={target.priority} onChange={(event) => onTargetChange({ priority: event.target.value })}>
              <option>Routine</option>
              <option>High</option>
              <option>Stat</option>
            </select>
          </label>
          <div className="text-xs font-semibold">
            Frequency
            <div className="relative mt-1">
              <Input
                className="pr-10"
                value={target.frequency}
                onChange={(event) => {
                  onTargetChange({ frequency: event.target.value });
                  setFrequencyDropdownOpen(true);
                }}
                onFocus={() => setFrequencyDropdownOpen(true)}
                onBlur={() => setFrequencyDropdownOpen(false)}
                placeholder="Search or type frequency"
              />
              <button
                aria-label="Open frequency dropdown"
                className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  setFrequencyDropdownOpen((current) => !current);
                }}
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              {frequencyDropdownOpen ? (
                <div className="absolute left-0 top-10 z-40 max-h-44 w-full overflow-auto rounded-md border border-border bg-surface p-1 shadow-soft">
                  {displayedFrequencyOptions.map((option) => (
                    <button
                      className="block w-full rounded px-2 py-2 text-left text-sm text-foreground hover:bg-surface-muted"
                      key={option}
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        onTargetChange({ frequency: option });
                        setFrequencyDropdownOpen(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                  {displayedFrequencyOptions.length === 0 ? (
                    <div className="px-2 py-2 text-sm text-muted-foreground">No frequency found</div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
          <label className="text-xs font-semibold">
            Start date
            <Input className="mt-1" type="date" value={target.startDate} onChange={(event) => onTargetChange({ startDate: event.target.value })} />
          </label>
          <label className="text-xs font-semibold">
            Start time
            <Input
              className="mt-1"
              type="time"
              value={target.startTime}
              onChange={(event) => {
                onTargetChange({ startTime: event.target.value });
                if (event.target.value) event.currentTarget.blur();
              }}
            />
          </label>
          <label className="text-xs font-semibold">
            End date
            <Input className="mt-1" type="date" value={target.endDate} onChange={(event) => onTargetChange({ endDate: event.target.value })} />
          </label>
          <label className="text-xs font-semibold">
            End time
            <Input className="mt-1" type="time" value={target.endTime} onChange={(event) => onTargetChange({ endTime: event.target.value })} />
          </label>
          <label className="text-xs font-semibold sm:col-span-2">
            Order / notes
            <textarea
              className="mt-1 min-h-20 w-full rounded-md border border-input bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              value={target.notes}
              onChange={(event) => onTargetChange({ notes: event.target.value })}
            />
          </label>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => onSave(target)}><Check className="h-4 w-4" />Save</Button>
          </div>
        </div>
      ) : null}
    </CenterModal>
  );
}

function WorklistDetailsModal({
  target,
  onClose,
  onEdit,
}: {
  target: WorklistDetailsTarget | null;
  onClose: () => void;
  onEdit: (target: WorklistDetailsTarget) => void;
}) {
  return (
    <CenterModal open={Boolean(target)} onOpenChange={(open) => !open && onClose()} title="Work list details">
      {target ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-border p-2 text-sm"><b>Task name</b><br />{target.details.taskName}</div>
          <div className="rounded-md border border-border p-2 text-sm"><b>Category</b><br />{target.details.category}</div>
          <div className="rounded-md border border-border p-2 text-sm"><b>Priority</b><br />{target.details.priority}</div>
          <div className="rounded-md border border-border p-2 text-sm"><b>Frequency</b><br />{target.details.frequency}</div>
          <div className="rounded-md border border-border p-2 text-sm"><b>Start date</b><br />{target.details.startDate || "-"}</div>
          <div className="rounded-md border border-border p-2 text-sm"><b>Start time</b><br />{target.details.startTime || "-"}</div>
          <div className="rounded-md border border-border p-2 text-sm"><b>End date</b><br />{target.details.endDate || "-"}</div>
          <div className="rounded-md border border-border p-2 text-sm"><b>End time</b><br />{target.details.endTime || "-"}</div>
          <div className="rounded-md border border-border p-2 text-sm sm:col-span-2"><b>Order / notes</b><br />{target.details.notes || "-"}</div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onEdit(target)}>Edit</Button>
            <Button type="button" onClick={onClose}>Close</Button>
          </div>
        </div>
      ) : null}
    </CenterModal>
  );
}

function NoteDetailsModal({
  target,
  onClose,
  onEdit,
}: {
  target: NoteDetailsTarget | null;
  onClose: () => void;
  onEdit: (target: NoteDetailsTarget) => void;
}) {
  return (
    <CenterModal open={Boolean(target)} onOpenChange={(open) => !open && onClose()} title="Progress notes">
      {target ? (
        <div className="space-y-4">
          <div className="grid gap-2 text-xs sm:grid-cols-2">
            <div className="border border-[#000] p-2"><b>Time</b><br />{target.time || "-"}</div>
            <div className="border border-[#000] p-2"><b>Goal name</b><br />{target.goal}</div>
          </div>
          <div className="min-h-32 rounded-md border border-input bg-background p-3 text-sm">{target.text}</div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onEdit(target)}>Edit</Button>
            <Button type="button" onClick={onClose}>Close</Button>
          </div>
        </div>
      ) : null}
    </CenterModal>
  );
}

function createCustomCarePlanDraft(): CarePlanTemplate {
  const suffix = `${Date.now()}-${carePlanInstanceCounter + 1}`;
  return {
    id: `custom-care-plan-${suffix}`,
    name: "New care plan",
    problems: [
      {
        id: `custom-problem-${suffix}`,
        name: "New problem",
        goals: [
          {
            id: `custom-goal-${suffix}`,
            name: "New goal",
            interventions: [{ id: `custom-intervention-${suffix}`, name: "New intervention" }],
          },
        ],
      },
    ],
  };
}

function sanitizeCustomCarePlan(template: CarePlanTemplate): CarePlanTemplate {
  return {
    ...template,
    name: template.name.trim() || "New care plan",
    problems: template.problems.map((problem, problemIndex) => ({
      ...problem,
      name: problem.name.trim() || `Problem ${problemIndex + 1}`,
      goals: problem.goals.map((goal, goalIndex) => ({
        ...goal,
        name: goal.name.trim() || `Goal ${goalIndex + 1}`,
        interventions: goal.interventions.map((intervention, interventionIndex) => ({
          ...intervention,
          name: intervention.name.trim() || `Intervention ${interventionIndex + 1}`,
        })),
      })),
    })),
  };
}

function CustomCarePlanModal({
  draft,
  onDraftChange,
  onClose,
  onSave,
}: {
  draft: CarePlanTemplate | null;
  onDraftChange: React.Dispatch<React.SetStateAction<CarePlanTemplate | null>>;
  onClose: () => void;
  onSave: (template: CarePlanTemplate) => void;
}) {
  function updateDraft(update: (current: CarePlanTemplate) => CarePlanTemplate) {
    onDraftChange((current) => (current ? update(current) : current));
  }

  function updateProblem(problemId: string, value: string) {
    updateDraft((current) => ({
      ...current,
      problems: current.problems.map((problem) => (problem.id === problemId ? { ...problem, name: value } : problem)),
    }));
  }

  function updateGoal(problemId: string, goalId: string, value: string) {
    updateDraft((current) => ({
      ...current,
      problems: current.problems.map((problem) => problem.id === problemId ? {
        ...problem,
        goals: problem.goals.map((goal) => (goal.id === goalId ? { ...goal, name: value } : goal)),
      } : problem),
    }));
  }

  function updateIntervention(problemId: string, goalId: string, interventionId: string, value: string) {
    updateDraft((current) => ({
      ...current,
      problems: current.problems.map((problem) => problem.id === problemId ? {
        ...problem,
        goals: problem.goals.map((goal) => goal.id === goalId ? {
          ...goal,
          interventions: goal.interventions.map((intervention) => (intervention.id === interventionId ? { ...intervention, name: value } : intervention)),
        } : goal),
      } : problem),
    }));
  }

  function addProblem() {
    const suffix = Date.now();
    updateDraft((current) => ({
      ...current,
      problems: [
        ...current.problems,
        {
          id: `custom-problem-${suffix}`,
          name: "New problem",
          goals: [{ id: `custom-goal-${suffix}`, name: "New goal", interventions: [{ id: `custom-intervention-${suffix}`, name: "New intervention" }] }],
        },
      ],
    }));
  }

  function addGoal(problemId: string) {
    const suffix = Date.now();
    updateDraft((current) => ({
      ...current,
      problems: current.problems.map((problem) => problem.id === problemId ? {
        ...problem,
        goals: [...problem.goals, { id: `custom-goal-${suffix}`, name: "New goal", interventions: [{ id: `custom-intervention-${suffix}`, name: "New intervention" }] }],
      } : problem),
    }));
  }

  function addIntervention(problemId: string, goalId: string) {
    const suffix = Date.now();
    updateDraft((current) => ({
      ...current,
      problems: current.problems.map((problem) => problem.id === problemId ? {
        ...problem,
        goals: problem.goals.map((goal) => goal.id === goalId ? {
          ...goal,
          interventions: [...goal.interventions, { id: `custom-intervention-${suffix}`, name: "New intervention" }],
        } : goal),
      } : problem),
    }));
  }

  function removeProblem(problemId: string) {
    updateDraft((current) => ({ ...current, problems: current.problems.filter((problem) => problem.id !== problemId) }));
  }

  function removeGoal(problemId: string, goalId: string) {
    updateDraft((current) => ({
      ...current,
      problems: current.problems.map((problem) => problem.id === problemId ? {
        ...problem,
        goals: problem.goals.filter((goal) => goal.id !== goalId),
      } : problem),
    }));
  }

  function removeIntervention(problemId: string, goalId: string, interventionId: string) {
    updateDraft((current) => ({
      ...current,
      problems: current.problems.map((problem) => problem.id === problemId ? {
        ...problem,
        goals: problem.goals.map((goal) => goal.id === goalId ? {
          ...goal,
          interventions: goal.interventions.filter((intervention) => intervention.id !== interventionId),
        } : goal),
      } : problem),
    }));
  }

  return (
    <CenterModal open={Boolean(draft)} onOpenChange={(open) => !open && onClose()} title="Add care plan">
      {draft ? (
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(sanitizeCustomCarePlan(draft));
          }}
        >
          <label className="block text-xs font-semibold">
            Name of care plan
            <Input className="mt-1" value={draft.name} onChange={(event) => updateDraft((current) => ({ ...current, name: event.target.value }))} autoFocus />
          </label>
          <div className="space-y-3">
            {draft.problems.map((problem, problemIndex) => (
              <div className="border border-border p-3" key={problem.id}>
                <div className="flex items-center gap-2">
                  <Input value={problem.name} onChange={(event) => updateProblem(problem.id, event.target.value)} placeholder={`Problem ${problemIndex + 1}`} />
                  <Button size="icon" type="button" variant="ghost" onClick={() => removeProblem(problem.id)} aria-label="Remove problem">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-3 space-y-3 pl-4">
                  {problem.goals.map((goal, goalIndex) => (
                    <div className="space-y-2 border-l border-border pl-3" key={goal.id}>
                      <div className="flex items-center gap-2">
                        <Input value={goal.name} onChange={(event) => updateGoal(problem.id, goal.id, event.target.value)} placeholder={`Goal ${goalIndex + 1}`} />
                        <Button size="icon" type="button" variant="ghost" onClick={() => removeGoal(problem.id, goal.id)} aria-label="Remove goal">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-2 pl-4">
                        {goal.interventions.map((intervention, interventionIndex) => (
                          <div className="flex items-center gap-2" key={intervention.id}>
                            <Input
                              value={intervention.name}
                              onChange={(event) => updateIntervention(problem.id, goal.id, intervention.id, event.target.value)}
                              placeholder={`Intervention ${interventionIndex + 1}`}
                            />
                            <Button
                              size="icon"
                              type="button"
                              variant="ghost"
                              onClick={() => removeIntervention(problem.id, goal.id, intervention.id)}
                              aria-label="Remove intervention"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button size="sm" type="button" variant="outline" onClick={() => addIntervention(problem.id, goal.id)}>
                          <Plus className="h-4 w-4" />Add intervention
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button size="sm" type="button" variant="outline" onClick={() => addGoal(problem.id)}>
                    <Plus className="h-4 w-4" />Add goal
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <Button type="button" variant="outline" onClick={addProblem}>
              <Plus className="h-4 w-4" />Add problem
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit"><Check className="h-4 w-4" />Save care plan</Button>
            </div>
          </div>
        </form>
      ) : null}
    </CenterModal>
  );
}

function buildSelectedCarePlanTemplate({
  template,
  selectedProblemIds,
  selectedGoalIds,
  selectedInterventionIds,
}: {
  template: CarePlanTemplate;
  selectedProblemIds: Set<string>;
  selectedGoalIds: Set<string>;
  selectedInterventionIds: Set<string>;
}): CarePlanSelectionTemplate | null {
  const selectedProblems = template.problems.flatMap((problem) => {
    const selectedGoals = problem.goals.flatMap((goal) => {
      const selectedInterventions = goal.interventions.filter((intervention) => selectedInterventionIds.has(intervention.id));
      if (!selectedGoalIds.has(goal.id) && !selectedInterventions.length) return [];
      return [{ ...goal, interventions: selectedInterventions }];
    });
    if (!selectedProblemIds.has(problem.id) && !selectedGoals.length) return [];
    return [{ ...problem, goals: selectedGoals }];
  });

  if (!selectedProblems.length) return null;
  return {
    ...template,
    id: `${template.id}-selected-${Date.now()}`,
    sourceTemplateId: template.id,
    problems: selectedProblems,
  };
}

function CarePlanSelectionModal({
  template,
  onClose,
  onSelect,
}: {
  template: CarePlanTemplate | null;
  onClose: () => void;
  onSelect: (template: CarePlanTemplate) => void;
}) {
  const [selectedProblemIds, setSelectedProblemIds] = React.useState<Set<string>>(new Set());
  const [selectedGoalIds, setSelectedGoalIds] = React.useState<Set<string>>(new Set());
  const [selectedInterventionIds, setSelectedInterventionIds] = React.useState<Set<string>>(new Set());

  function toggleSet(setter: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) {
    setter((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleProblem(problemId: string) {
    toggleSet(setSelectedProblemIds, problemId);
  }

  function toggleGoal(goalId: string) {
    toggleSet(setSelectedGoalIds, goalId);
  }

  function toggleIntervention(interventionId: string) {
    toggleSet(setSelectedInterventionIds, interventionId);
  }

  function selectCarePlan() {
    if (!template) return;
    const selectedTemplate = buildSelectedCarePlanTemplate({ template, selectedProblemIds, selectedGoalIds, selectedInterventionIds });
    if (!selectedTemplate) return;
    onSelect(selectedTemplate);
  }

  const hasSelection = Boolean(selectedProblemIds.size || selectedGoalIds.size || selectedInterventionIds.size);

  return (
    <CenterModal open={Boolean(template)} onOpenChange={(open) => !open && onClose()} title="Select care plan">
      {template ? (
        <div className="space-y-4">
          <div>
            <div className="text-sm font-semibold text-foreground">{template.name}</div>
          </div>
          <div className="space-y-3">
            {template.problems.map((problem, problemIndex) => (
                <div className="border border-border p-3" key={problem.id}>
                  <label className="flex items-start gap-2 text-sm font-semibold">
                    <input
                      className="mt-1 accent-primary"
                      type="checkbox"
                      checked={selectedProblemIds.has(problem.id)}
                      onChange={() => toggleProblem(problem.id)}
                    />
                    <span>Problem {problemIndex + 1}: {problem.name}</span>
                  </label>
                  <div className="mt-3 space-y-3 pl-6">
                    {problem.goals.map((goal, goalIndex) => (
                        <div className="space-y-2 border-l border-border pl-3" key={goal.id}>
                          <label className="flex items-start gap-2 text-sm font-medium">
                            <input
                              className="mt-1 accent-primary"
                              type="checkbox"
                              checked={selectedGoalIds.has(goal.id)}
                              onChange={() => toggleGoal(goal.id)}
                            />
                            <span>Goal {goalIndex + 1}: {goal.name}</span>
                          </label>
                          <div className="space-y-2 pl-6">
                            {goal.interventions.map((intervention) => (
                              <label className="flex items-start gap-2 text-sm" key={intervention.id}>
                                <input
                                  className="mt-1 accent-primary"
                                  type="checkbox"
                                  checked={selectedInterventionIds.has(intervention.id)}
                                  onChange={() => toggleIntervention(intervention.id)}
                                />
                                <span>{intervention.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
            ))}
          </div>
          <div className="flex justify-between gap-2">
            <Button type="button" disabled={!hasSelection} onClick={selectCarePlan}>
              <Check className="h-4 w-4" />Select
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </div>
      ) : null}
    </CenterModal>
  );
}

function DocumentCarePlanTable({
  plans,
  templates,
  selectedInterventions,
  onAddCarePlan,
  onRemoveCarePlan,
  onResolveProblem,
  onProgress,
  onGoalNote,
  onAddTarget,
  onWorklist,
  onToggleIntervention,
  onClearInterventionCheckbox,
  onCompleteSelected,
}: {
  plans: DocumentCarePlan[];
  templates: CarePlanTemplate[];
  selectedInterventions: Set<string>;
  onAddCarePlan: (template: CarePlanTemplate) => void;
  onRemoveCarePlan: (planId: string) => void;
  onResolveProblem: (planId: string, problemId: string, status: ProblemStatus) => void;
  onProgress: (planId: string, problemId: string, goalId: string, progress: GoalProgress) => void;
  onGoalNote: (target: NoteTarget) => void;
  onAddTarget: (target: AddTarget) => void;
  onWorklist: (target: WorklistTarget) => void;
  onToggleIntervention: (id: string) => void;
  onClearInterventionCheckbox: (target: CheckboxClearTarget) => void;
  onCompleteSelected: () => void;
}) {
  const [carePlanSearch, setCarePlanSearch] = React.useState("");
  const [carePlanDropdownMode, setCarePlanDropdownMode] = React.useState<"closed" | "search" | "all">("closed");
  const [customCarePlanDraft, setCustomCarePlanDraft] = React.useState<CarePlanTemplate | null>(null);
  const [selectionTemplate, setSelectionTemplate] = React.useState<CarePlanTemplate | null>(null);
  const [removeTarget, setRemoveTarget] = React.useState<DocumentCarePlan | null>(null);
  const [checkboxClearTarget, setCheckboxClearTarget] = React.useState<CheckboxClearTarget | null>(null);
  const [worklistDetailsTarget, setWorklistDetailsTarget] = React.useState<WorklistDetailsTarget | null>(null);
  const [noteDetailsTarget, setNoteDetailsTarget] = React.useState<NoteDetailsTarget | null>(null);
  const searchTerm = carePlanSearch.trim().toLowerCase();
  const openCarePlanSelection = (template: CarePlanTemplate) => {
    setSelectionTemplate(template);
    setCarePlanSearch("");
    setCarePlanDropdownMode("closed");
  };
  const selectCarePlanFromDropdown = (template: CarePlanTemplate) => {
    onAddCarePlan(template);
    setSelectionTemplate(null);
  };
  const saveCustomCarePlan = (template: CarePlanTemplate) => {
    onAddCarePlan(template);
    setCustomCarePlanDraft(null);
  };
  const removeCarePlan = () => {
    if (!removeTarget) return;
    onRemoveCarePlan(removeTarget.id);
    setRemoveTarget(null);
  };
  const clearInterventionCheckbox = () => {
    if (!checkboxClearTarget) return;
    onClearInterventionCheckbox(checkboxClearTarget);
    setCheckboxClearTarget(null);
  };
  const editWorklistDetails = (target: WorklistDetailsTarget) => {
    onWorklist({
      planId: target.planId,
      problemId: target.problemId,
      goalId: target.goalId,
      interventionId: target.interventionId,
      ...target.details,
    });
    setWorklistDetailsTarget(null);
  };
  const editNoteDetails = (target: NoteDetailsTarget) => {
    onGoalNote({
      planId: target.planId,
      problemId: target.problemId,
      goalId: target.goalId,
      carePlan: target.carePlan,
      goal: target.goal,
      text: target.text,
      time: target.time,
    });
    setNoteDetailsTarget(null);
  };
  const preservedTemplates = templates.length ? templates : initialTemplates;
  const searchedTemplates = preservedTemplates.filter((template) => {
    if (!searchTerm) return true;
    return [
      template.name,
      ...template.problems.flatMap((problem) => [
        problem.name,
        ...problem.goals.flatMap((goal) => [goal.name, ...goal.interventions.map((intervention) => intervention.name)]),
      ]),
    ].some((value) => value.toLowerCase().includes(searchTerm));
  });
  const displayedTemplates = carePlanDropdownMode === "search" ? searchedTemplates : preservedTemplates;
  const showCarePlanDropdown = carePlanDropdownMode !== "closed";

  return (
    <div className="rounded-lg border border-border bg-surface p-3 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-foreground">Nursing care plan</div>
          <div className="text-xs text-muted-foreground">Document active problems, goals, interventions, worklist tasks, and completion status.</div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Button size="sm" type="button" onClick={() => setCustomCarePlanDraft(createCustomCarePlanDraft())}>
            <Plus className="h-4 w-4" />Add new care plan
          </Button>
          <span className="rounded-md border border-border bg-background px-2 py-1">{plans.length} care plans</span>
        </div>
      </div>
      <div className="min-h-[720px] overflow-auto rounded-md border border-border bg-white p-4">
        <div className="min-h-[680px] min-w-[1120px]">
          <div>
            <table className="w-[1120px] border-collapse bg-white shadow-sm [&_td]:border-l-0 [&_td]:border-r-0">
            <tbody>
              <tr>
                <Cell colSpan={2}>
                  <div className="relative w-64">
                    <Input
                      className="h-9 w-64 pr-10 text-sm"
                      value={carePlanSearch}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        setCarePlanSearch(nextValue);
                        setCarePlanDropdownMode(nextValue.trim() ? "search" : "closed");
                      }}
                      onFocus={() => {
                        if (searchTerm) setCarePlanDropdownMode("search");
                      }}
                      onClick={() => {
                        if (searchTerm) setCarePlanDropdownMode("search");
                      }}
                      onBlur={() => {
                        if (carePlanDropdownMode === "search") setCarePlanDropdownMode("closed");
                      }}
                      placeholder="Search care plan"
                    />
                    <button
                      aria-label="Open care plan dropdown"
                      className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                      type="button"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        setCarePlanDropdownMode((current) => (current === "all" ? "closed" : "all"));
                      }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {showCarePlanDropdown ? (
                      <div className="absolute left-0 top-10 z-30 max-h-64 w-64 overflow-auto rounded-md border border-border bg-surface p-1 shadow-soft">
                        {displayedTemplates.map((template) => (
                          <button
                            className="block w-full rounded px-2 py-2 text-left text-sm text-foreground hover:bg-surface-muted"
                            key={template.id}
                            type="button"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              openCarePlanSelection(template);
                            }}
                            onClick={(event) => {
                              if (event.detail === 0) openCarePlanSelection(template);
                            }}
                          >
                            {template.name}
                          </button>
                        ))}
                        {displayedTemplates.length === 0 ? (
                          <div className="px-2 py-2 text-sm text-muted-foreground">No care plan found</div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </Cell>
                <Cell className="text-center font-semibold">
                  <Button size="sm" type="button" onClick={onCompleteSelected}>Complete</Button>
                </Cell>
                <Cell>Selected: {selectedInterventions.size}</Cell>
              </tr>
              {plans.map((plan) => {
                const activeProblems = plan.problems.filter((problem) => problem.status === "Active");
                const lastProblem = activeProblems.at(-1);

                if (!activeProblems.length) return null;

                return (
                  <React.Fragment key={plan.id}>
                    <tr>
                      <Cell
                        className="cursor-pointer font-semibold hover:bg-surface-muted"
                        colSpan={4}
                      >
                        <button
                          className="block w-full text-left"
                          type="button"
                          onDoubleClick={() => setRemoveTarget(plan)}
                        >
                          Care plan: {plan.name}
                        </button>
                      </Cell>
                    </tr>
                    {activeProblems.map((problem, problemIndex) => {
                      return (
                        <React.Fragment key={problem.id}>
                          <tr>
                            <Cell className="bg-surface-muted font-semibold text-foreground">Problem {problemIndex + 1}: {problem.name}</Cell>
                            <Cell className="bg-surface-muted">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-muted-foreground">Status</span>
                                <SheetSelect
                                  value={problem.status}
                                  onChange={(value) => onResolveProblem(plan.id, problem.id, value as ProblemStatus)}
                                  options={["Active", "Adequate for discharge", "Resolved"]}
                                  placeholderForValue="Active"
                                />
                              </div>
                            </Cell>
                            <Cell className="bg-surface-muted" colSpan={2} />
                          </tr>
                          {problem.goals.map((goal, goalIndex) => {
                            return (
                              <React.Fragment key={goal.id}>
                                <tr>
                                  <Cell className="font-semibold text-foreground">Goal {goalIndex + 1}: {goal.name}</Cell>
                                  <Cell>
                                    <SheetSelect
                                      value={goal.progress}
                                      onChange={(value) => onProgress(plan.id, problem.id, goal.id, value as GoalProgress)}
                                      options={["Achieved", "Partially achieved", "Achieved and completed"]}
                                      placeholder="Progress"
                                      placeholderForValue="Pending"
                                    />
                                  </Cell>
                                  <Cell>
                                    <Button
                                      aria-disabled={Boolean(goal.recentNote)}
                                      className={cn(goal.recentNote && "cursor-not-allowed opacity-60")}
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        if (goal.recentNote) return;
                                        onGoalNote({ planId: plan.id, problemId: problem.id, goalId: goal.id, carePlan: plan.name, goal: goal.name, interventions: goal.interventions });
                                      }}
                                      onDoubleClick={() => {
                                        if (!goal.recentNote) return;
                                        setNoteDetailsTarget({
                                          planId: plan.id,
                                          problemId: problem.id,
                                          goalId: goal.id,
                                          carePlan: plan.name,
                                          goal: goal.name,
                                          text: goal.recentNote,
                                          time: goal.recentNoteTime,
                                        });
                                      }}
                                    >
                                      Notes
                                    </Button>
                                  </Cell>
                                  <Cell>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => onAddTarget({ type: "intervention", planId: plan.id, problemId: problem.id, goalId: goal.id })}
                                    >
                                      <Plus className="h-4 w-4" />
                                      Add intervention
                                    </Button>
                                  </Cell>
                                </tr>
                                {goal.interventions.map((intervention) => {
                                  const checked = Boolean(intervention.completedAt) || selectedInterventions.has(intervention.id);
                                  return (
                                    <tr key={intervention.id}>
                                      <Cell>{intervention.name}</Cell>
                                      <Cell>
                                        <SheetButton
                                          onClick={() => {
                                            if (!intervention.worklist) {
                                              onWorklist({
                                                planId: plan.id,
                                                problemId: problem.id,
                                                goalId: goal.id,
                                                interventionId: intervention.id,
                                                ...createWorklistDetails(intervention.name),
                                              });
                                            }
                                          }}
                                          onDoubleClick={() => {
                                            if (!intervention.worklist) return;
                                            setWorklistDetailsTarget({
                                              planId: plan.id,
                                              problemId: problem.id,
                                              goalId: goal.id,
                                              interventionId: intervention.id,
                                              interventionName: intervention.name,
                                              details: intervention.worklistDetails ?? createWorklistDetails(intervention.name),
                                            });
                                          }}
                                        >
                                          {intervention.worklist ? "Added" : "Add to worklist"}
                                        </SheetButton>
                                      </Cell>
                                      <Cell>
                                        <label
                                          className="flex h-full items-center gap-2 text-sm"
                                          onDoubleClickCapture={(event) => {
                                            if (!checked) return;
                                            event.preventDefault();
                                            setCheckboxClearTarget({
                                              planId: plan.id,
                                              problemId: problem.id,
                                              goalId: goal.id,
                                              interventionId: intervention.id,
                                              interventionName: intervention.name,
                                            });
                                          }}
                                        >
                                          <input
                                            className="accent-primary"
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => {
                                              if (!intervention.completedAt) onToggleIntervention(intervention.id);
                                            }}
                                          />
                                          Check box
                                        </label>
                                      </Cell>
                                      <Cell>{intervention.completedAt ? "Completed" : ""}</Cell>
                                    </tr>
                                  );
                                })}
                              </React.Fragment>
                            );
                          })}
                        </React.Fragment>
                      );
                    })}
                    <tr>
                      <Cell colSpan={4}>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={!lastProblem}
                            onClick={() => {
                              if (lastProblem) onAddTarget({ type: "goal", planId: plan.id, problemId: lastProblem.id });
                            }}
                          >
                            <Plus className="h-4 w-4" />
                            Add goal
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => onAddTarget({ type: "problem", planId: plan.id })}>
                            <Plus className="h-4 w-4" />
                            Add problem
                          </Button>
                        </div>
                      </Cell>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
            </table>
          </div>
        </div>
      </div>
      <CustomCarePlanModal
        draft={customCarePlanDraft}
        onDraftChange={setCustomCarePlanDraft}
        onClose={() => setCustomCarePlanDraft(null)}
        onSave={saveCustomCarePlan}
      />
      <CarePlanSelectionModal
        key={selectionTemplate?.id ?? "no-selection-template"}
        template={selectionTemplate}
        onClose={() => setSelectionTemplate(null)}
        onSelect={selectCarePlanFromDropdown}
      />
      <CenterModal open={Boolean(removeTarget)} onOpenChange={(open) => !open && setRemoveTarget(null)} title="Remove care plan">
        <div className="space-y-4">
          <div className="text-sm text-foreground">
            Are you sure you want to remove <span className="font-semibold">{removeTarget?.name}</span> from this care plan list?
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setRemoveTarget(null)}>Cancel</Button>
            <Button type="button" variant="danger" onClick={removeCarePlan}>Remove</Button>
          </div>
        </div>
      </CenterModal>
      <CenterModal open={Boolean(checkboxClearTarget)} onOpenChange={(open) => !open && setCheckboxClearTarget(null)} title="Blank checkbox">
        <div className="space-y-4">
          <div className="text-sm text-foreground">
            Are you sure you want to blank the checkbox for <span className="font-semibold">{checkboxClearTarget?.interventionName}</span>?
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setCheckboxClearTarget(null)}>Cancel</Button>
            <Button type="button" variant="danger" onClick={clearInterventionCheckbox}>Blank</Button>
          </div>
        </div>
      </CenterModal>
      <WorklistDetailsModal target={worklistDetailsTarget} onClose={() => setWorklistDetailsTarget(null)} onEdit={editWorklistDetails} />
      <NoteDetailsModal target={noteDetailsTarget} onClose={() => setNoteDetailsTarget(null)} onEdit={editNoteDetails} />
    </div>
  );
}

function parseNoteTime(value: string) {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function getProgressNoteRows(plans: DocumentCarePlan[]): ProgressNoteRow[] {
  return plans.flatMap((plan, planIndex) => plan.problems.flatMap((problem, problemIndex) => problem.goals.flatMap((goal, goalIndex) => {
    const goalRows: ProgressNoteRow[] = goal.recentNote ? [{
      id: `${goal.id}-goal-note`,
      time: goal.recentNoteTime || "",
      carePlan: `Care plan ${planIndex + 1}: ${plan.name}`,
      problem: `Problem ${problemIndex + 1}: ${problem.name}`,
      goal: `Goal ${goalIndex + 1}: ${goal.name}`,
      intervention: "",
      text: goal.recentNote,
    }] : [];
    const interventionRows = goal.interventions.flatMap((intervention) => intervention.completedAt ? [{
      id: `${intervention.id}-completion-note`,
      time: intervention.completedAt,
      carePlan: `Care plan ${planIndex + 1}: ${plan.name}`,
      problem: `Problem ${problemIndex + 1}: ${problem.name}`,
      goal: `Goal ${goalIndex + 1}: ${goal.name}`,
      intervention: intervention.name,
      text: intervention.completionNote || "Intervention completed.",
    }] : []);
    return [...goalRows, ...interventionRows];
  })));
}

function getProblemStatus(problem: DocumentProblem) {
  return problem.status;
}

function ProgressNotesTable({ plans }: { plans: DocumentCarePlan[] }) {
  const [fromDateTime, setFromDateTime] = React.useState("");
  const [toDateTime, setToDateTime] = React.useState("");
  const notes = getProgressNoteRows(plans);
  const filtered = notes.filter((note) => {
    const noteTime = parseNoteTime(note.time);
    const fromTime = fromDateTime ? new Date(fromDateTime).getTime() : null;
    const toTime = toDateTime ? new Date(toDateTime).getTime() : null;
    if (noteTime === null) return !fromTime && !toTime;
    if (fromTime !== null && noteTime < fromTime) return false;
    if (toTime !== null && noteTime > toTime) return false;
    return true;
  });
  return (
    <div className="overflow-auto rounded-lg border border-border bg-surface p-3 shadow-sm">
      <div className="min-w-[1080px]">
        <table className="w-[1080px] border-collapse bg-white [&_td]:border-l-0 [&_td]:border-r-0">
          <tbody>
            <tr>
              <Cell />
              <Cell colSpan={5}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm">Filter by date and time range</span>
                  <Input className="h-9 w-56 text-sm" type="datetime-local" value={fromDateTime} onChange={(event) => setFromDateTime(event.target.value)} />
                  <Input className="h-9 w-56 text-sm" type="datetime-local" value={toDateTime} onChange={(event) => setToDateTime(event.target.value)} />
                </div>
              </Cell>
            </tr>
            <tr>
              <Cell className="font-semibold">Time</Cell>
              <Cell className="font-semibold">Care plan</Cell>
              <Cell className="font-semibold">Problem</Cell>
              <Cell className="font-semibold">Goal name</Cell>
              <Cell className="font-semibold">Intervention</Cell>
              <Cell className="font-semibold">Text written</Cell>
            </tr>
            {filtered.map((note) => (
              <tr key={note.id}>
                <Cell>{note.time}</Cell>
                <Cell>{note.carePlan}</Cell>
                <Cell>{note.problem}</Cell>
                <Cell>{note.goal}</Cell>
                <Cell>{note.intervention}</Cell>
                <Cell>{note.text}</Cell>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <Cell colSpan={6}>No progress notes found from document care plan</Cell>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OverviewTable({ plans }: { plans: DocumentCarePlan[] }) {
  const [documentationTarget, setDocumentationTarget] = React.useState<{
    carePlan: string;
    goal: string;
    intervention: string;
    time: string;
    text: string;
  } | null>(null);

  function recentGoalProgress(goal: DocumentGoal) {
    if (goal.recentNote) return `${goal.recentNoteTime || "Time not recorded"} - ${goal.recentNote}`;
    if (goal.progress !== "Pending") return goal.progress;
    return "No recent progress documented";
  }

  function interventionDocumentation(intervention: DocumentIntervention) {
    const time = intervention.documentationNoteTime || intervention.completedAt || [intervention.worklistDetails?.startDate, intervention.worklistDetails?.startTime].filter(Boolean).join(" ");
    const text = intervention.documentationNote || intervention.completionNote || intervention.worklistDetails?.notes || "No documentation recorded.";
    return { time: time || "-", text };
  }

  return (
    <div className="overflow-auto rounded-lg border border-border bg-surface p-3 shadow-sm">
      <div className="min-w-[1180px]">
        <table className="w-[1180px] border-collapse bg-white shadow-sm [&_td]:border-l-0 [&_td]:border-r-0">
          <tbody>
            <tr>
              <Cell className="bg-[#4472c4] font-semibold text-white" colSpan={5}>
                Selected care plans overview
              </Cell>
            </tr>
            <tr>
              <Cell className="font-semibold">Care plan</Cell>
              <Cell className="font-semibold">Problem / status</Cell>
              <Cell className="font-semibold">Goal</Cell>
              <Cell className="font-semibold">Recent progress</Cell>
              <Cell className="font-semibold">Interventions</Cell>
            </tr>
            {plans.map((plan, planIndex) => (
              <React.Fragment key={plan.id}>
                <tr>
                  <Cell className="bg-surface-muted font-semibold text-foreground" colSpan={5}>
                    Care plan {planIndex + 1}: {plan.name}
                  </Cell>
                </tr>
                {plan.problems.map((problem, problemIndex) => (
                  <React.Fragment key={problem.id}>
                    {problem.goals.length ? problem.goals.map((goal, goalIndex) => (
                      <tr key={goal.id}>
                        <Cell>{plan.name}</Cell>
                        <Cell>
                          <div className="font-medium">Problem {problemIndex + 1}: {problem.name}</div>
                          <div className={cn("mt-1 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold", problem.status === "Active" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700")}>
                            {getProblemStatus(problem)}
                          </div>
                        </Cell>
                        <Cell>Goal {goalIndex + 1}: {goal.name}</Cell>
                        <Cell>{recentGoalProgress(goal)}</Cell>
                        <Cell>
                          <div className="space-y-1">
                            {goal.interventions.map((intervention) => {
                              const documentation = interventionDocumentation(intervention);
                              return (
                                <button
                                  className="block text-left text-sm text-primary hover:underline"
                                  key={intervention.id}
                                  type="button"
                                  onClick={() => setDocumentationTarget({
                                    carePlan: plan.name,
                                    goal: goal.name,
                                    intervention: intervention.name,
                                    ...documentation,
                                  })}
                                >
                                  {intervention.name}
                                </button>
                              );
                            })}
                            {goal.interventions.length === 0 ? (
                              <span className="text-sm text-muted-foreground">No interventions added</span>
                            ) : null}
                          </div>
                        </Cell>
                      </tr>
                    )) : (
                      <tr>
                        <Cell>{plan.name}</Cell>
                        <Cell>
                          <div className="font-medium">Problem {problemIndex + 1}: {problem.name}</div>
                          <div className={cn("mt-1 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold", problem.status === "Active" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700")}>
                            {getProblemStatus(problem)}
                          </div>
                        </Cell>
                        <Cell>No goals added</Cell>
                        <Cell>-</Cell>
                        <Cell>-</Cell>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {plan.problems.length === 0 ? (
                  <tr>
                    <Cell>{plan.name}</Cell>
                    <Cell colSpan={4}>No problems added</Cell>
                  </tr>
                ) : null}
              </React.Fragment>
            ))}
            {plans.length === 0 ? (
              <tr>
                <Cell colSpan={5}>No care plans selected for this visit</Cell>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <CenterModal open={Boolean(documentationTarget)} onOpenChange={(open) => !open && setDocumentationTarget(null)} title="Intervention documentation">
        {documentationTarget ? (
          <div className="space-y-3">
            <div className="grid gap-2 text-xs sm:grid-cols-2">
              <div className="border border-[#000] p-2"><b>Care plan</b><br />{documentationTarget.carePlan}</div>
              <div className="border border-[#000] p-2"><b>Goal</b><br />{documentationTarget.goal}</div>
              <div className="border border-[#000] p-2"><b>Intervention</b><br />{documentationTarget.intervention}</div>
              <div className="border border-[#000] p-2"><b>Time</b><br />{documentationTarget.time}</div>
            </div>
            <div className="min-h-24 rounded-md border border-input bg-background p-3 text-sm">{documentationTarget.text}</div>
            <div className="flex justify-end">
              <Button type="button" onClick={() => setDocumentationTarget(null)}>Close</Button>
            </div>
          </div>
        ) : null}
      </CenterModal>
    </div>
  );
}

export function NursingCarePlansPage() {
  const [plans, setPlans] = React.useState<DocumentCarePlan[]>([toDocumentPlan(initialTemplates[0]), toDocumentPlan(initialTemplates[1])]);
  const [addTarget, setAddTarget] = React.useState<AddTarget | null>(null);
  const [addValue, setAddValue] = React.useState("");
  const [noteTarget, setNoteTarget] = React.useState<NoteTarget | null>(null);
  const [noteText, setNoteText] = React.useState("");
  const [interventionNoteTarget, setInterventionNoteTarget] = React.useState<InterventionNoteTarget | null>(null);
  const [interventionNoteText, setInterventionNoteText] = React.useState("");
  const [worklistTarget, setWorklistTarget] = React.useState<WorklistTarget | null>(null);
  const [selectedInterventions, setSelectedInterventions] = React.useState<Set<string>>(new Set());
  const [completionTargets, setCompletionTargets] = React.useState<CompletionTarget[]>([]);
  const [completionTime, setCompletionTime] = React.useState("");
  const [completionNote, setCompletionNote] = React.useState("");

  function updatePlan(planId: string, update: (plan: DocumentCarePlan) => DocumentCarePlan) {
    setPlans((current) => current.map((plan) => (plan.id === planId ? update(plan) : plan)));
  }

  function resolveProblem(planId: string, problemId: string, status: ProblemStatus) {
    if (status !== "Active") {
      const resolvedProblem = plans.find((plan) => plan.id === planId)?.problems.find((problem) => problem.id === problemId);
      const resolvedInterventionIds = new Set(resolvedProblem?.goals.flatMap((goal) => goal.interventions.map((intervention) => intervention.id)) ?? []);
      setSelectedInterventions((current) => new Set([...current].filter((id) => !resolvedInterventionIds.has(id))));
    }
    updatePlan(planId, (plan) => ({
      ...plan,
      problems: plan.problems.map((problem) => (problem.id === problemId ? { ...problem, status } : problem)),
    }));
  }

  function updateProgress(planId: string, problemId: string, goalId: string, progress: GoalProgress) {
    const time = nowStamp();
    updatePlan(planId, (plan) => ({
      ...plan,
      problems: plan.problems.map((problem) => problem.id === problemId ? {
        ...problem,
        goals: problem.goals.map((goal) => goal.id === goalId ? {
          ...goal,
          progress,
          recentNote: `Progress updated to ${progress}`,
          recentNoteTime: time,
        } : goal),
      } : problem),
    }));
  }

  function saveAddTarget() {
    const value = addValue.trim();
    if (!addTarget || !value) return;
    updatePlan(addTarget.planId, (plan) => {
      if (addTarget.type === "problem") {
        return { ...plan, problems: [...plan.problems, { id: `custom-problem-${Date.now()}`, name: value, status: "Active", goals: [] }] };
      }
      return {
        ...plan,
        problems: plan.problems.map((problem) => {
          if (problem.id !== addTarget.problemId) return problem;
          if (addTarget.type === "goal") {
            return { ...problem, goals: [...problem.goals, { id: `custom-goal-${Date.now()}`, name: value, progress: "Pending", interventions: [] }] };
          }
          return {
            ...problem,
            goals: problem.goals.map((goal) => goal.id === addTarget.goalId ? {
              ...goal,
              interventions: [...goal.interventions, { id: `custom-intervention-${Date.now()}`, name: value, worklist: false }],
            } : goal),
          };
        }),
      };
    });
    setAddTarget(null);
    setAddValue("");
  }

  function saveGoalNote() {
    if (!noteTarget) return;
    const text = noteText.trim();
    if (!text) return;
    const time = nowStamp();
    updatePlan(noteTarget.planId, (plan) => ({
      ...plan,
      problems: plan.problems.map((problem) => problem.id === noteTarget.problemId ? {
        ...problem,
        goals: problem.goals.map((goal) => goal.id === noteTarget.goalId ? { ...goal, recentNote: text, recentNoteTime: time } : goal),
      } : problem),
    }));
    setNoteTarget(null);
    setNoteText("");
  }

  function openInterventionNote(target: InterventionNoteTarget) {
    setInterventionNoteTarget(target);
    setInterventionNoteText(target.text ?? "");
  }

  function saveInterventionNote() {
    if (!interventionNoteTarget) return;
    const text = interventionNoteText.trim();
    if (!text) return;
    const time = nowStamp();
    updatePlan(interventionNoteTarget.planId, (plan) => ({
      ...plan,
      problems: plan.problems.map((problem) => problem.id === interventionNoteTarget.problemId ? {
        ...problem,
        goals: problem.goals.map((goal) => goal.id === interventionNoteTarget.goalId ? {
          ...goal,
          interventions: goal.interventions.map((intervention) => intervention.id === interventionNoteTarget.interventionId ? {
            ...intervention,
            documentationNote: text,
            documentationNoteTime: time,
          } : intervention),
        } : goal),
      } : problem),
    }));
    setInterventionNoteTarget(null);
    setInterventionNoteText("");
  }

  function saveWorklist(target: WorklistTarget) {
    const details: WorklistDetails = {
      taskName: target.taskName.trim() || "Work list task",
      category: target.category,
      priority: target.priority,
      frequency: target.frequency,
      startDate: target.startDate,
      endDate: target.endDate,
      startTime: target.startTime,
      endTime: target.endTime,
      notes: target.notes,
    };
    upsertCarePlanWorklistTask({
      id: createCarePlanWorklistTaskId(target),
      taskName: details.taskName,
      priority: details.priority,
      startDate: details.startDate,
      startTime: details.startTime,
      endDate: details.endDate,
      frequency: details.frequency,
      comments: details.notes,
    });
    updatePlan(target.planId, (plan) => ({
      ...plan,
      problems: plan.problems.map((problem) => problem.id === target.problemId ? {
        ...problem,
        goals: problem.goals.map((goal) => goal.id === target.goalId ? {
          ...goal,
          interventions: goal.interventions.map((intervention) => intervention.id === target.interventionId ? {
            ...intervention,
            worklist: true,
            name: details.taskName,
            worklistDetails: details,
          } : intervention),
        } : goal),
      } : problem),
    }));
    setWorklistTarget(null);
  }

  function toggleIntervention(id: string) {
    setSelectedInterventions((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearInterventionCheckbox(target: CheckboxClearTarget) {
    updatePlan(target.planId, (plan) => ({
      ...plan,
      problems: plan.problems.map((problem) => problem.id === target.problemId ? {
        ...problem,
        goals: problem.goals.map((goal) => goal.id === target.goalId ? {
          ...goal,
          interventions: goal.interventions.map((intervention) => intervention.id === target.interventionId ? {
            ...intervention,
            completedAt: undefined,
            completionNote: undefined,
          } : intervention),
        } : goal),
      } : problem),
    }));
    setSelectedInterventions((current) => {
      const next = new Set(current);
      next.delete(target.interventionId);
      return next;
    });
  }

  function removeCarePlan(planId: string) {
    setPlans((currentPlans) => {
      const planToRemove = currentPlans.find((plan) => plan.id === planId);
      if (planToRemove) {
        const interventionIds = new Set(planToRemove.problems.flatMap((problem) => problem.goals.flatMap((goal) => goal.interventions.map((intervention) => intervention.id))));
        setSelectedInterventions((current) => new Set([...current].filter((id) => !interventionIds.has(id))));
      }
      return currentPlans.filter((plan) => plan.id !== planId);
    });
  }

  function addCarePlan(template: CarePlanTemplate) {
    const sourceId = carePlanSourceId(template);
    setPlans((current) => {
      if (current.some((plan) => (plan.sourceTemplateId ?? plan.id) === sourceId)) return current;
      return [...current, toDocumentPlan(template)];
    });
  }

  function openCompleteSelected() {
    if (!selectedInterventions.size) return;
    const targets = plans.flatMap((plan) => plan.problems.flatMap((problem) => problem.goals.flatMap((goal) => (
      goal.interventions.flatMap((intervention) => selectedInterventions.has(intervention.id) ? [{
        planId: plan.id,
        problemId: problem.id,
        goalId: goal.id,
        goal: goal.name,
        interventionId: intervention.id,
        intervention: intervention.name,
      }] : [])
    ))));
    if (!targets.length) return;
    setCompletionTargets(targets);
    setCompletionTime(nowStamp());
    setCompletionNote("");
  }

  function saveCompletedInterventions() {
    if (!completionTargets.length) return;
    const completedIds = new Set(completionTargets.map((target) => target.interventionId));
    const time = completionTime.trim() || nowStamp();
    const note = completionNote.trim() || "Intervention completed.";
    setPlans((currentPlans) => currentPlans.map((plan) => ({
      ...plan,
      problems: plan.problems.map((problem) => ({
        ...problem,
        goals: problem.goals.map((goal) => ({
          ...goal,
          interventions: goal.interventions.map((intervention) => {
            if (!completedIds.has(intervention.id)) return intervention;
            return { ...intervention, completedAt: time, completionNote: note };
          }),
        })),
      })),
    })));
    setSelectedInterventions(new Set());
    setCompletionTargets([]);
    setCompletionTime("");
    setCompletionNote("");
  }

  return (
    <NursingShell title="Nursing Care Plan" description="Document care plan, progress notes, and overview in the configured spreadsheet format.">
      <NursingPatientStrip />
      <Tabs defaultValue="document">
        <TabsList className="bg-transparent p-0">
          <TabsTrigger
            value="document"
            className="h-[var(--density-control-height-sm)] rounded-md border border-border bg-background px-[var(--density-control-x-sm)] text-xs font-medium text-foreground hover:bg-surface-muted data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            Document care plan
          </TabsTrigger>
          <TabsTrigger
            value="notes"
            className="h-[var(--density-control-height-sm)] rounded-md border border-border bg-background px-[var(--density-control-x-sm)] text-xs font-medium text-foreground hover:bg-surface-muted data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            Care plan progress notes
          </TabsTrigger>
          <TabsTrigger
            value="overview"
            className="h-[var(--density-control-height-sm)] rounded-md border border-border bg-background px-[var(--density-control-x-sm)] text-xs font-medium text-foreground hover:bg-surface-muted data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm"
          >
            Overview
          </TabsTrigger>
        </TabsList>
        <TabsContent value="document">
          <DocumentCarePlanTable
            plans={plans}
            templates={initialTemplates}
            selectedInterventions={selectedInterventions}
            onAddCarePlan={addCarePlan}
            onRemoveCarePlan={removeCarePlan}
            onResolveProblem={resolveProblem}
            onProgress={updateProgress}
            onGoalNote={(target) => {
              setNoteTarget(target);
              setNoteText(target.text ?? "");
            }}
            onAddTarget={(target) => {
              setAddTarget(target);
              setAddValue("");
            }}
            onWorklist={setWorklistTarget}
            onToggleIntervention={toggleIntervention}
            onClearInterventionCheckbox={clearInterventionCheckbox}
            onCompleteSelected={openCompleteSelected}
          />
        </TabsContent>
        <TabsContent value="notes"><ProgressNotesTable plans={plans} /></TabsContent>
        <TabsContent value="overview"><OverviewTable plans={plans} /></TabsContent>
      </Tabs>

      <CenterModal open={Boolean(addTarget)} onOpenChange={(open) => !open && setAddTarget(null)} title={`Add ${addTarget?.type ?? "item"}`}>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            saveAddTarget();
          }}
        >
          <Input value={addValue} onChange={(event) => setAddValue(event.target.value)} placeholder={`Name of ${addTarget?.type ?? "item"}`} autoFocus />
          <Button type="submit"><Plus className="h-4 w-4" />Add</Button>
        </form>
      </CenterModal>
      <CenterModal open={Boolean(noteTarget)} onOpenChange={(open) => !open && setNoteTarget(null)} title="Progress notes">
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            saveGoalNote();
          }}
        >
          <div className="grid gap-2 text-xs sm:grid-cols-2">
            <div className="border border-[#000] p-2"><b>Time</b><br />{nowStamp()}</div>
            <div className="border border-[#000] p-2"><b>Goal name</b><br />{noteTarget?.goal}</div>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold text-foreground">Interventions</div>
            <div className="max-h-48 overflow-auto rounded-md border border-input bg-background p-2">
              {noteTarget?.interventions?.map((intervention) => (
                <div className="flex items-center justify-between gap-2 border-b border-border py-2 last:border-b-0" key={intervention.id}>
                  <span className="text-sm text-foreground">{intervention.name}</span>
                  <Button
                    aria-label={`Write note for ${intervention.name}`}
                    size="icon"
                    type="button"
                    variant="outline"
                    onClick={() => openInterventionNote({
                      planId: noteTarget.planId,
                      problemId: noteTarget.problemId,
                      goalId: noteTarget.goalId,
                      interventionId: intervention.id,
                      carePlan: noteTarget.carePlan,
                      goal: noteTarget.goal,
                      intervention: intervention.name,
                      time: intervention.documentationNoteTime || intervention.completedAt || "",
                      text: intervention.documentationNote || intervention.completionNote || intervention.worklistDetails?.notes || "",
                    })}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {noteTarget?.interventions?.length ? null : (
                <div className="py-2 text-sm text-muted-foreground">No interventions added for this goal</div>
              )}
            </div>
          </div>
          <textarea
            className="min-h-32 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
            value={noteText}
            onChange={(event) => setNoteText(event.target.value)}
            placeholder="Free text"
            autoFocus
          />
          <Button type="submit">Save note</Button>
        </form>
      </CenterModal>
      <CenterModal open={Boolean(interventionNoteTarget)} onOpenChange={(open) => !open && setInterventionNoteTarget(null)} title="Intervention note">
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            saveInterventionNote();
          }}
        >
          <div className="grid gap-2 text-xs sm:grid-cols-2">
            <div className="border border-[#000] p-2"><b>Time</b><br />{interventionNoteTarget?.time || nowStamp()}</div>
            <div className="border border-[#000] p-2"><b>Intervention</b><br />{interventionNoteTarget?.intervention}</div>
          </div>
          <textarea
            className="min-h-32 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
            value={interventionNoteText}
            onChange={(event) => setInterventionNoteText(event.target.value)}
            placeholder="Type intervention documentation here"
            autoFocus
          />
          <Button type="submit">Save intervention note</Button>
        </form>
      </CenterModal>
      <CenterModal open={Boolean(completionTargets.length)} onOpenChange={(open) => !open && setCompletionTargets([])} title="Complete">
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            saveCompletedInterventions();
          }}
        >
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground" htmlFor="completion-time">Time</label>
            <Input
              id="completion-time"
              value={completionTime}
              onChange={(event) => setCompletionTime(event.target.value)}
              placeholder="Current time"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold text-foreground">Goal and intervention name</div>
            <div className="max-h-48 space-y-2 overflow-auto rounded-md border border-input bg-background p-2 text-sm">
              {completionTargets.map((target) => (
                <div className="rounded border border-border p-2" key={target.interventionId}>
                  <div><b>Goal:</b> {target.goal}</div>
                  <div><b>Intervention:</b> {target.intervention}</div>
                </div>
              ))}
            </div>
          </div>
          <textarea
            className="min-h-32 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
            value={completionNote}
            onChange={(event) => setCompletionNote(event.target.value)}
            placeholder="Free text for Notes"
          />
          <Button type="submit">Save completion</Button>
        </form>
      </CenterModal>
      <WorklistModal
        target={worklistTarget}
        onClose={() => setWorklistTarget(null)}
        onTargetChange={(updates) => setWorklistTarget((current) => (current ? { ...current, ...updates } : current))}
        onSave={saveWorklist}
      />
    </NursingShell>
  );
}
