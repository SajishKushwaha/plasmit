"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as React from "react";
import { CheckCircle2, ClipboardList, Plus, Search, X } from "lucide-react";

import { AlertBanner } from "@/components/ui/alert-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  carePlanProgressNotes,
  carePlans,
  carePlanTemplates,
  type CareGoal,
  type CareIntervention,
  type CarePlan,
  type CareProblem,
  type CareProblemStatus,
  type GoalProgress,
} from "@/features/nursing/nursing-data";
import { FieldLabel, NursingPatientStrip, NursingShell, NursingStatus } from "@/features/nursing/nursing-shared";

type ProgressNote = (typeof carePlanProgressNotes)[number];
type ConfigTemplate = (typeof carePlanTemplates)[number];
type AddTarget = { type: "problem" | "goal" | "intervention"; planId: string; problemId?: string; goalId?: string };
type CompleteTarget = { planId: string; problemId: string; goalId: string; interventionId?: string; title: string };

function stamp() {
  return new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function CenterModal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(calc(100vw-2rem),440px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-border bg-surface shadow-soft outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
            <div>
              <Dialog.Title className="text-sm font-semibold text-foreground">{title}</Dialog.Title>
              {description ? <Dialog.Description className="mt-1 text-xs text-muted-foreground">{description}</Dialog.Description> : null}
            </div>
            <Dialog.Close asChild>
              <Button size="icon" variant="ghost" aria-label="Close modal">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="p-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function mapPlans(plans: CarePlan[], planId: string, update: (plan: CarePlan) => CarePlan) {
  return plans.map((plan) => plan.id === planId ? update(plan) : plan);
}

function InterventionRow({
  planId,
  problemId,
  goal,
  intervention,
  onWorklist,
  onComplete,
}: {
  planId: string;
  problemId: string;
  goal: CareGoal;
  intervention: CareIntervention;
  onWorklist: (planId: string, problemId: string, goalId: string, interventionId: string) => void;
  onComplete: (target: CompleteTarget) => void;
}) {
  return (
    <div className="grid gap-2 rounded-md border border-border bg-background p-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{intervention.name}</div>
        {intervention.lastNote ? <div className="mt-1 text-xs text-muted-foreground">{intervention.lastNote}</div> : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {intervention.worklist ? <Badge tone="info">Worklist</Badge> : null}
        {intervention.completed ? <Badge tone="success">Completed</Badge> : null}
        <Button size="sm" variant="outline" onClick={() => onWorklist(planId, problemId, goal.id, intervention.id)}>Add to worklist</Button>
        <Button size="sm" onClick={() => onComplete({ planId, problemId, goalId: goal.id, interventionId: intervention.id, title: intervention.name })}>Complete</Button>
      </div>
    </div>
  );
}

function GoalBlock({
  planId,
  problem,
  goal,
  onProgress,
  onAdd,
  onWorklist,
  onComplete,
}: {
  planId: string;
  problem: CareProblem;
  goal: CareGoal;
  onProgress: (planId: string, problemId: string, goalId: string, progress: GoalProgress) => void;
  onAdd: (target: AddTarget) => void;
  onWorklist: (planId: string, problemId: string, goalId: string, interventionId: string) => void;
  onComplete: (target: CompleteTarget) => void;
}) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-surface-muted p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="font-medium">{goal.name}</div>
          <div className="mt-1 text-xs text-muted-foreground">{goal.recentNote}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <select className="h-8 rounded-md border border-input bg-background px-2 text-xs" value={goal.progress} onChange={(event) => onProgress(planId, problem.id, goal.id, event.target.value as GoalProgress)}>
            <option>Pending</option>
            <option>Achieved</option>
            <option>Partially achieved</option>
            <option>Achieved and completed</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => onComplete({ planId, problemId: problem.id, goalId: goal.id, title: goal.name })}>Notes</Button>
          <Button size="sm" variant="outline" onClick={() => onAdd({ type: "intervention", planId, problemId: problem.id, goalId: goal.id })}><Plus className="h-4 w-4" />Intervention</Button>
        </div>
      </div>
      <div className="space-y-2">{goal.interventions.map((intervention) => <InterventionRow key={intervention.id} planId={planId} problemId={problem.id} goal={goal} intervention={intervention} onWorklist={onWorklist} onComplete={onComplete} />)}</div>
    </div>
  );
}

function ProblemBlock({
  plan,
  problem,
  onResolve,
  onProgress,
  onAdd,
  onWorklist,
  onComplete,
}: {
  plan: CarePlan;
  problem: CareProblem;
  onResolve: (planId: string, problemId: string, status: CareProblemStatus) => void;
  onProgress: (planId: string, problemId: string, goalId: string, progress: GoalProgress) => void;
  onAdd: (target: AddTarget) => void;
  onWorklist: (planId: string, problemId: string, goalId: string, interventionId: string) => void;
  onComplete: (target: CompleteTarget) => void;
}) {
  if (problem.status === "Resolved") return null;
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{problem.name}</CardTitle>
          <CardDescription>Problem status controls whether it appears in the active document care plan list.</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <select className="h-8 rounded-md border border-input bg-background px-2 text-xs" value={problem.status} onChange={(event) => onResolve(plan.id, problem.id, event.target.value as CareProblemStatus)}>
            <option>Active</option>
            <option>Adequate for discharge</option>
            <option>Resolved</option>
          </select>
          <Button size="sm" variant="outline" onClick={() => onAdd({ type: "goal", planId: plan.id, problemId: problem.id })}><Plus className="h-4 w-4" />Goal</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">{problem.goals.map((goal) => <GoalBlock key={goal.id} planId={plan.id} problem={problem} goal={goal} onProgress={onProgress} onAdd={onAdd} onWorklist={onWorklist} onComplete={onComplete} />)}</CardContent>
    </Card>
  );
}

function ProgressNotes({ notes }: { notes: ProgressNote[] }) {
  const [query, setQuery] = React.useState("");
  const filtered = notes.filter((note) => `${note.time} ${note.goal} ${note.intervention} ${note.note}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Care plan progress notes</CardTitle>
          <CardDescription>Filter documented notes by date, goal, intervention, or text.</CardDescription>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search notes" value={query} onChange={(event) => setQuery(event.target.value)} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {filtered.map((note) => (
          <div className="rounded-md border border-border p-3" key={note.id}>
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium"><Badge tone="muted">{note.time}</Badge>{note.goal}</div>
            <div className="mt-1 text-xs text-muted-foreground">{note.intervention}</div>
            <div className="mt-2 text-sm">{note.note}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Overview({ plan }: { plan: CarePlan }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {plan.problems.map((problem) => (
        <Card key={problem.id}>
          <CardHeader><CardTitle>{problem.name}</CardTitle><NursingStatus status={problem.status} /></CardHeader>
          <CardContent className="space-y-3">
            {problem.goals.map((goal) => (
              <div className="rounded-md border border-border p-3" key={goal.id}>
                <div className="flex items-center justify-between gap-2"><span className="font-medium">{goal.name}</span><NursingStatus status={goal.progress} /></div>
                <div className="mt-2 text-xs text-muted-foreground">{goal.recentNote}</div>
                <div className="mt-3 flex flex-wrap gap-1">{goal.interventions.map((item) => <Badge key={item.id} tone={item.completed ? "success" : item.worklist ? "info" : "muted"}>{item.name}</Badge>)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function NursingCarePlansPage() {
  const [plans, setPlans] = React.useState<CarePlan[]>(carePlans);
  const [notes, setNotes] = React.useState<ProgressNote[]>(carePlanProgressNotes);
  const [planId, setPlanId] = React.useState(carePlans[0].id);
  const [addTarget, setAddTarget] = React.useState<AddTarget | null>(null);
  const [addValue, setAddValue] = React.useState("");
  const [completeTarget, setCompleteTarget] = React.useState<CompleteTarget | null>(null);
  const [completeNote, setCompleteNote] = React.useState("");
  const [newPlanOpen, setNewPlanOpen] = React.useState(false);
  const [newPlanName, setNewPlanName] = React.useState("");
  const plan = plans.find((item) => item.id === planId) ?? plans[0];

  function updatePlan(targetPlanId: string, update: (plan: CarePlan) => CarePlan) {
    setPlans((current) => mapPlans(current, targetPlanId, update));
  }

  function resolveProblem(targetPlanId: string, problemId: string, status: CareProblemStatus) {
    updatePlan(targetPlanId, (current) => ({ ...current, problems: current.problems.map((problem) => problem.id === problemId ? { ...problem, status } : problem) }));
  }

  function updateProgress(targetPlanId: string, problemId: string, goalId: string, progress: GoalProgress) {
    updatePlan(targetPlanId, (current) => ({
      ...current,
      problems: current.problems.map((problem) => problem.id === problemId ? { ...problem, goals: problem.goals.map((goal) => goal.id === goalId ? { ...goal, progress, recentNote: `Progress updated to ${progress} at ${stamp()}.` } : goal) } : problem),
    }));
  }

  function markWorklist(targetPlanId: string, problemId: string, goalId: string, interventionId: string) {
    updatePlan(targetPlanId, (current) => ({
      ...current,
      problems: current.problems.map((problem) => problem.id === problemId ? { ...problem, goals: problem.goals.map((goal) => goal.id === goalId ? { ...goal, interventions: goal.interventions.map((item) => item.id === interventionId ? { ...item, worklist: true } : item) } : goal) } : problem),
    }));
  }

  function saveAddTarget() {
    if (!addTarget || !addValue.trim()) return;
    updatePlan(addTarget.planId, (current) => ({
      ...current,
      problems: addTarget.type === "problem"
        ? [...current.problems, { id: `p-${Date.now()}`, name: addValue, status: "Active", goals: [] }]
        : current.problems.map((problem) => {
          if (problem.id !== addTarget.problemId) return problem;
          if (addTarget.type === "goal") return { ...problem, goals: [...problem.goals, { id: `g-${Date.now()}`, name: addValue, progress: "Pending", recentNote: "New goal added.", interventions: [] }] };
          return { ...problem, goals: problem.goals.map((goal) => goal.id === addTarget.goalId ? { ...goal, interventions: [...goal.interventions, { id: `i-${Date.now()}`, name: addValue, completed: false, worklist: false }] } : goal) };
        }),
    }));
    setAddTarget(null);
    setAddValue("");
  }

  function saveComplete() {
    if (!completeTarget) return;
    const note = completeNote || "Completed without additional notes.";
    updatePlan(completeTarget.planId, (current) => ({
      ...current,
      problems: current.problems.map((problem) => problem.id === completeTarget.problemId ? {
        ...problem,
        goals: problem.goals.map((goal) => goal.id === completeTarget.goalId ? {
          ...goal,
          recentNote: note,
          interventions: goal.interventions.map((item) => !completeTarget.interventionId || item.id === completeTarget.interventionId ? { ...item, completed: true, lastNote: note } : item),
        } : goal),
      } : problem),
    }));
    setNotes((current) => [{ id: `n-${Date.now()}`, time: stamp(), goal: completeTarget.title, intervention: completeTarget.interventionId ? "Intervention documentation" : "Goal note", note }, ...current]);
    setCompleteTarget(null);
    setCompleteNote("");
  }

  function addNewPlan() {
    const name = newPlanName.trim();
    if (!name) return;
    const next: CarePlan = { id: `cp-${Date.now()}`, name, patient: "Aarav Sharma", visit: "IPD-1188", problems: [] };
    setPlans((current) => [next, ...current]);
    setPlanId(next.id);
    setNewPlanOpen(false);
    setNewPlanName("");
  }

  return (
    <NursingShell title="Nursing Care Plans" description="Care-plan documentation with problems, goals, interventions, notes, worklist, and overview." hideHeaderCopy>
      <NursingPatientStrip />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Visit care plan</span>
          <select className="h-9 w-full min-w-[320px] max-w-xl rounded-md border border-input bg-background px-2 text-sm sm:w-[520px]" value={plan?.id} onChange={(event) => setPlanId(event.target.value)}>
            {plans.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
          </select>
        </div>
        <Button size="sm" onClick={() => setNewPlanOpen(true)}><Plus className="h-4 w-4" />Add care plan</Button>
      </div>
      <Tabs defaultValue="document">
        <TabsList>
          <TabsTrigger value="document">Document care plan</TabsTrigger>
          <TabsTrigger value="notes">Care plan progress notes</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
        <TabsContent value="document">
          <div className="space-y-4">
            <AlertBanner icon={ClipboardList} tone="info" title={plan.name}>{plan.patient} • {plan.visit}. Add problems, goals, interventions, worklist tasks, and completion notes.</AlertBanner>
            <Button variant="outline" onClick={() => { setAddTarget({ type: "problem", planId: plan.id }); setAddValue(""); }}><Plus className="h-4 w-4" />Add problem</Button>
            {plan.problems.map((problem) => <ProblemBlock key={problem.id} plan={plan} problem={problem} onResolve={resolveProblem} onProgress={updateProgress} onAdd={(target) => { setAddTarget(target); setAddValue(""); }} onWorklist={markWorklist} onComplete={(target) => { setCompleteTarget(target); setCompleteNote(""); }} />)}
          </div>
        </TabsContent>
        <TabsContent value="notes"><ProgressNotes notes={notes} /></TabsContent>
        <TabsContent value="overview"><Overview plan={plan} /></TabsContent>
      </Tabs>
      <CenterModal open={newPlanOpen} onOpenChange={setNewPlanOpen} title="Add care plan" description="Create a care plan for this visit.">
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            addNewPlan();
          }}
        >
          <Input value={newPlanName} onChange={(event) => setNewPlanName(event.target.value)} placeholder="Care plan name" autoFocus />
          <Button className="w-full" type="submit">Add care plan</Button>
        </form>
      </CenterModal>
      <CenterModal open={Boolean(addTarget)} onOpenChange={(open) => !open && setAddTarget(null)} title={`Add ${addTarget?.type ?? "item"}`}>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            saveAddTarget();
          }}
        >
          <Input value={addValue} onChange={(event) => setAddValue(event.target.value)} placeholder={`Name of ${addTarget?.type ?? "item"}`} autoFocus />
          <Button className="w-full" type="submit">Add</Button>
        </form>
      </CenterModal>
      <CenterModal open={Boolean(completeTarget)} onOpenChange={(open) => !open && setCompleteTarget(null)} title="Document completion" description={completeTarget?.title}>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            saveComplete();
          }}
        >
          <Input value={stamp()} readOnly />
          <textarea className="min-h-36 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={completeNote} onChange={(event) => setCompleteNote(event.target.value)} placeholder="Notes" autoFocus />
          <Button className="w-full" type="submit">Complete and add note</Button>
        </form>
      </CenterModal>
    </NursingShell>
  );
}

export function NursingCarePlanConfigurationPage() {
  const [templates, setTemplates] = React.useState<ConfigTemplate[]>(carePlanTemplates);
  const [draft, setDraft] = React.useState<ConfigTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<ConfigTemplate | null>(null);

  function newTemplate() {
    setDraft({ id: `tpl-${Date.now()}`, name: "New care plan", problems: 0, goals: 0, interventions: 0, active: true });
  }

  function saveTemplate() {
    if (!draft) return;
    setTemplates((current) => current.some((item) => item.id === draft.id) ? current.map((item) => item.id === draft.id ? draft : item) : [draft, ...current]);
    setDraft(null);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    setTemplates((current) => current.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <NursingShell title="Care Plan Configuration" description="Reusable care plan templates with problem, goal, intervention counts and active state." hideHeaderCopy>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={newTemplate}><Plus className="h-4 w-4" />New care plan</Button>
            <div>
              <CardTitle>List of care plans</CardTitle>
              <CardDescription>Edit or delete reusable templates.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {templates.map((template) => (
            <div className="grid gap-2 rounded-md border border-border p-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center" key={template.id}>
              <div>
                <div className="font-medium">{template.name}</div>
                <div className="mt-1 flex flex-wrap gap-2"><Badge tone="muted">{template.problems} problems</Badge><Badge tone="muted">{template.goals} goals</Badge><Badge tone="muted">{template.interventions} interventions</Badge>{template.active ? <Badge tone="success">Active</Badge> : <Badge tone="muted">Inactive</Badge>}</div>
              </div>
              <div className="relative flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => { setDraft(template); setDeleteTarget(null); }}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => { setDeleteTarget(template); setDraft(null); }}>Delete</Button>
                {deleteTarget?.id === template.id ? (
                  <div className="absolute right-full top-0 z-40 mr-2 w-72 rounded-lg border border-border bg-surface p-3 text-sm shadow-soft">
                    <div className="font-semibold">Delete care plan?</div>
                    <div className="mt-1 text-xs text-muted-foreground">This will remove {template.name} from the local list.</div>
                    <div className="mt-3 flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                      <Button size="sm" variant="danger" onClick={confirmDelete}>Delete</Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Drawer open={Boolean(draft)} onOpenChange={(open) => !open && setDraft(null)} title="Edit care plan template">
        {draft ? (
          <div className="space-y-3">
            <FieldLabel label="Name of care plan" value={<Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />} />
            <FieldLabel label="Problem count" value={<Input type="number" value={draft.problems} onChange={(event) => setDraft({ ...draft, problems: Number(event.target.value) })} />} />
            <FieldLabel label="Goal count" value={<Input type="number" value={draft.goals} onChange={(event) => setDraft({ ...draft, goals: Number(event.target.value) })} />} />
            <FieldLabel label="Intervention count" value={<Input type="number" value={draft.interventions} onChange={(event) => setDraft({ ...draft, interventions: Number(event.target.value) })} />} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.active} onChange={() => setDraft({ ...draft, active: !draft.active })} />Active</label>
            <Button className="w-full" onClick={saveTemplate}><CheckCircle2 className="h-4 w-4" />Save</Button>
          </div>
        ) : null}
      </Drawer>
    </NursingShell>
  );
}
