"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { MessageSquareText, Plus, Search, Star, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  assessmentGroups,
  preferredAssessmentIds,
  type AssessmentGroup,
  type AssessmentRow,
  type NursingFieldType,
  type NursingSelectable,
} from "@/features/care-team/nursing/nursing-data";
import { FieldLabel, NursingPatientStrip, NursingShell, NursingStatus } from "@/features/care-team/nursing/nursing-shared";

type AssessmentValues = Record<string, string>;
type CommentTarget = { row: AssessmentRow; comment: string };
type MasterRow = {
  id: string;
  row: string;
  display: string;
  type: "Grouper" | "Content";
  active: boolean;
  fieldType?: NursingFieldType;
  selectable?: NursingSelectable;
  options?: string;
};

function sortAssessmentGroups(groups: AssessmentGroup[]) {
  return [...groups].sort((first, second) => first.displayName.localeCompare(second.displayName));
}

function timeColumnLabel(index: number) {
  return `TIME ${String(index + 1).padStart(2, "0")}`;
}

const nonNegativeAssessmentRows = new Set(["Urine assessment:Urine Volume (in ml)", "Urine assessment:Diaper weight (in ml)", "Stool assessment:Stool (ml)", "Emesis Assessment:Emesis (in ml)", "NG Aspiration assessment:Volume (ml)"]);

function scoreFromSelectedOption(value: string) {
  const score = Number(value.split("=").at(-1));
  return Number.isFinite(score) ? score : 0;
}

function formatDateTimeDisplay(value: string) {
  if (!value) return "";
  const [date = "", time = ""] = value.split("T");
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) return value.replace("T", "   ");
  return `${day}/${month}/${year}   ${time}`;
}

function DateTimeFieldWithSave({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [draftValue, setDraftValue] = React.useState(value);

  function openPicker() {
    setDraftValue(value);
    setOpen(true);
  }

  return (
    <div className="relative">
      <Input readOnly value={formatDateTimeDisplay(value)} onClick={openPicker} onFocus={openPicker} placeholder="Document" />
      {open ? (
        <div className="fixed left-1/2 top-1/2 z-50 w-72 -translate-x-1/2 -translate-y-1/2 rounded-md border border-border bg-surface p-3 shadow-soft">
          <Input type="datetime-local" value={draftValue} onChange={(event) => setDraftValue(event.target.value)} />
          <div className="mt-3 flex justify-end">
            <Button
              size="sm"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(draftValue);
                setOpen(false);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AssessmentField({ row, value, onChange }: { row: AssessmentRow; value: string; onChange: (value: string) => void }) {
  const disallowNegativeValue = nonNegativeAssessmentRows.has(`${row.group}:${row.label}`);
  const showDateTimeSave = row.group === "Oxygen therapy Assessment" && (row.label === "Start" || row.label === "End") && row.fieldType === "Date and time";

  if (row.fieldType === "Dropdown") {
    return (
      <select className="h-9 w-full min-w-[150px] rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select</option>
        {row.options?.map((option) => <option key={option}>{option}</option>)}
      </select>
    );
  }
  if (row.fieldType === "Calculated") {
    return <div className="rounded-md border border-info/30 bg-info/10 px-2 py-2 text-sm text-info">{value || row.formula || "Auto calculated"}</div>;
  }
  if (showDateTimeSave) {
    return <DateTimeFieldWithSave value={value} onChange={onChange} />;
  }
  return (
    <Input
      min={disallowNegativeValue ? 0 : undefined}
      type={row.fieldType === "Number" ? "number" : row.fieldType === "Date and time" ? "datetime-local" : "text"}
      value={value}
      onChange={(event) => {
        const nextValue = event.target.value;
        onChange(disallowNegativeValue && Number(nextValue) < 0 ? "" : nextValue);
      }}
      placeholder="Document"
    />
  );
}

function AssessmentTable({
  group,
  times,
  showNow,
  values,
  comments,
  onAddColumn,
  onDeleteColumn,
  onDeleteNow,
  onRenameColumn,
  onValueChange,
  onComment,
}: {
  group: AssessmentGroup;
  times: string[];
  showNow: boolean;
  values: AssessmentValues;
  comments: Record<string, string>;
  onAddColumn: () => void;
  onDeleteColumn: (time: string) => void;
  onDeleteNow: () => void;
  onRenameColumn: (oldTime: string, newTime: string) => void;
  onValueChange: (rowId: string, time: string, value: string) => void;
  onComment: (row: AssessmentRow) => void;
}) {
  const [deleteTime, setDeleteTime] = React.useState<string | null>(null);
  const [draftTime, setDraftTime] = React.useState("");
  const deletingHasData = deleteTime ? group.rows.some((row) => Boolean(values[`${row.id}-${deleteTime}`]?.trim())) : false;
  const nowHasData = group.rows.some((row) => Boolean(values[`${row.id}-NOW`]?.trim()));
  const canDelete = times.length > 1;
  const draftTimeTrimmed = draftTime.trim();
  const duplicateDraftTime = Boolean(deleteTime && draftTimeTrimmed && draftTimeTrimmed !== deleteTime && times.includes(draftTimeTrimmed));

  function getMorseFallScore(time: string) {
    return ["ri4", "ri5", "ri6", "ri7", "ri8", "ri9"].reduce((total, rowId) => total + scoreFromSelectedOption(values[`${rowId}-${time}`] ?? ""), 0);
  }

  function getAssessmentValue(row: AssessmentRow, time: string) {
    if (group.id === "grp-fall" && row.id === "ri10") {
      return `r4+r5+r6+r7+r8+r9 = ${getMorseFallScore(time)}`;
    }
    return values[`${row.id}-${time}`] ?? "";
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{group.displayName}</CardTitle>
          <CardDescription>Time-based documentation grid configured from assessment master rows.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[1040px] border-collapse text-sm">
            <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="border-b border-border px-3 py-2 text-left">Content row</th>
                {times.map((time) => (
                  <th className="relative border-b border-border px-3 py-2 text-left" key={time}>
                    <button
                      className="rounded px-1 py-0.5 text-left hover:bg-background"
                      onClick={() => {
                        const nextTime = deleteTime === time ? null : time;
                        setDeleteTime(nextTime);
                        setDraftTime(nextTime ?? "");
                      }}
                    >
                      {time}
                    </button>
                    {deleteTime === time ? (
                      <div className="absolute left-2 top-9 z-40 w-80 rounded-lg border border-border bg-surface p-3 normal-case tracking-normal text-foreground shadow-soft">
                        <div className="text-sm font-semibold">Edit {time}</div>
                        <label className="mt-3 block text-xs font-medium text-muted-foreground">
                          Time label
                          <Input className="mt-1 h-8" value={draftTime} onChange={(event) => setDraftTime(event.target.value)} placeholder="Enter time or label" />
                        </label>
                        {duplicateDraftTime ? <div className="mt-1 text-xs text-danger">This time column already exists.</div> : null}
                        <div className="mt-1 text-xs text-muted-foreground">
                          {!canDelete ? "At least one TIME column is required." : deletingHasData ? "This column has documented values. Deleting will remove those values." : "This column has no documented values."}
                        </div>
                        <div className="mt-3 flex flex-wrap justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setDeleteTime(null); setDraftTime(""); }}>Cancel</Button>
                          <Button
                            size="sm"
                            disabled={!draftTimeTrimmed || duplicateDraftTime}
                            onClick={() => {
                              onRenameColumn(time, draftTimeTrimmed);
                              setDeleteTime(null);
                              setDraftTime("");
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={!canDelete}
                            onClick={() => {
                              onDeleteColumn(time);
                              setDeleteTime(null);
                              setDraftTime("");
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </th>
                ))}
                {showNow ? (
                  <th className="relative border-b border-border px-3 py-2 text-left">
                    <button className="rounded px-1 py-0.5 text-left hover:bg-background" onClick={() => setDeleteTime(deleteTime === "NOW" ? null : "NOW")}>NOW</button>
                    {deleteTime === "NOW" ? (
                      <div className="absolute left-2 top-9 z-40 w-72 rounded-lg border border-border bg-surface p-3 normal-case tracking-normal text-foreground shadow-soft">
                        <div className="text-sm font-semibold">Delete NOW?</div>
                        <div className="mt-1 text-xs text-muted-foreground">{nowHasData ? "NOW column has documented values. Deleting will remove those values." : "NOW column has no documented values."}</div>
                        <div className="mt-3 flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => setDeleteTime(null)}>Cancel</Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => {
                              onDeleteNow();
                              setDeleteTime(null);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </th>
                ) : null}
                <th className="border-b border-border px-3 py-2 text-left">
                  <Button size="sm" onClick={onAddColumn}><Plus className="h-4 w-4" />Add column</Button>
                </th>
                <th className="border-b border-border px-3 py-2 text-left">Comment</th>
              </tr>
            </thead>
            <tbody>
              {group.rows.map((row) => (
                <tr className="border-b border-border last:border-b-0 hover:bg-surface-muted/60" key={row.id}>
                  <td className="px-3 py-2 align-top font-medium">{row.label}</td>
                  {times.map((time) => (
                    <td className="px-3 py-2 align-top" key={time}>
                      <AssessmentField row={row} value={getAssessmentValue(row, time)} onChange={(value) => onValueChange(row.id, time, value)} />
                    </td>
                  ))}
                  {showNow ? (
                    <td className="px-3 py-2 align-top">
                      <AssessmentField row={row} value={getAssessmentValue(row, "NOW")} onChange={(value) => onValueChange(row.id, "NOW", value)} />
                    </td>
                  ) : null}
                  <td className="px-3 py-2 align-top text-xs text-muted-foreground">New time slot</td>
                  <td className="px-3 py-2 align-top">
                    <div className="min-w-[160px] space-y-2">
                      <Button size="sm" variant={comments[row.id] ? "default" : "outline"} title={comments[row.id] || "Add comment"} onClick={() => onComment(row)}>
                        <MessageSquareText className="h-4 w-4" />{comments[row.id] ? "Edit" : "Add"}
                      </Button>
                      {comments[row.id] ? <div className="max-w-[220px] rounded-md border border-border bg-surface-muted p-2 text-xs text-muted-foreground">{comments[row.id]}</div> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function NursingAssessmentsPage() {
  const sortedGroups = React.useMemo(() => sortAssessmentGroups(assessmentGroups), []);
  const [selectedGroupId, setSelectedGroupId] = React.useState(sortedGroups[0].id);
  const [assessmentSearch, setAssessmentSearch] = React.useState(sortedGroups[0].displayName);
  const [assessmentSearchOpen, setAssessmentSearchOpen] = React.useState(false);
  const [times, setTimes] = React.useState(["TIME 01", "TIME 02", "TIME 03", "TIME 04"]);
  const [showNow, setShowNow] = React.useState(true);
  const [values, setValues] = React.useState<AssessmentValues>({});
  const [comments, setComments] = React.useState<Record<string, string>>({});
  const [preferenceIds, setPreferenceIds] = React.useState(preferredAssessmentIds);
  const [commentTarget, setCommentTarget] = React.useState<CommentTarget | null>(null);
  const selected = sortedGroups.find((group) => group.id === selectedGroupId) ?? sortedGroups[0];
  const preferences = sortedGroups.filter((group) => preferenceIds.includes(group.id));
  const filteredAssessmentGroups = sortedGroups.filter((group) => group.displayName.toLowerCase().includes(assessmentSearch.toLowerCase()) || group.name.toLowerCase().includes(assessmentSearch.toLowerCase()));

  function togglePreference(groupId: string) {
    setPreferenceIds((ids) => ids.includes(groupId) ? ids.filter((id) => id !== groupId) : [...ids, groupId]);
  }

  function addColumn() {
    setTimes((current) => [...current, timeColumnLabel(current.length)]);
  }

  function deleteColumn(time: string) {
    setTimes((current) => current.filter((item) => item !== time));
    setValues((current) => {
      const next = { ...current };
      Object.keys(next).forEach((key) => {
        if (key.endsWith(`-${time}`)) delete next[key];
      });
      return next;
    });
  }

  function renameColumn(oldTime: string, newTime: string) {
    if (!newTime || oldTime === newTime || times.includes(newTime)) return;
    setTimes((current) => current.map((time) => time === oldTime ? newTime : time));
    setValues((current) => {
      const next = { ...current };
      Object.keys(current).forEach((key) => {
        if (!key.endsWith(`-${oldTime}`)) return;
        const renamedKey = `${key.slice(0, -oldTime.length)}${newTime}`;
        next[renamedKey] = current[key];
        delete next[key];
      });
      return next;
    });
  }

  function deleteNow() {
    setShowNow(false);
    setValues((current) => {
      const next = { ...current };
      Object.keys(next).forEach((key) => {
        if (key.endsWith("-NOW")) delete next[key];
      });
      return next;
    });
  }

  return (
    <NursingShell
      title="Nursing Assessments"
      description="Clinical assessment documentation with configurable rows, comments, preferences, and intake/output flags."
    >
      <NursingPatientStrip />
      <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Assessment</CardTitle>
            <CardDescription>Select group or open a preference.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                value={assessmentSearch}
                onChange={(event) => {
                  setAssessmentSearch(event.target.value);
                  setAssessmentSearchOpen(true);
                }}
                onFocus={() => setAssessmentSearchOpen(true)}
                onClick={() => {
                  setAssessmentSearch("");
                  setAssessmentSearchOpen(true);
                }}
                placeholder="Search assessment"
              />
              {assessmentSearchOpen ? (
                <div className="absolute z-40 mt-1 max-h-72 w-full overflow-auto rounded-md border border-border bg-surface shadow-soft">
                  {filteredAssessmentGroups.filter((group) => group.active).map((group) => (
                    <button
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-surface-muted"
                      key={group.id}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        setSelectedGroupId(group.id);
                        setAssessmentSearch(group.displayName);
                        setAssessmentSearchOpen(false);
                      }}
                    >
                      {group.displayName}
                    </button>
                  ))}
                  {!filteredAssessmentGroups.length ? <div className="px-3 py-2 text-sm text-muted-foreground">No assessment found</div> : null}
                </div>
              ) : null}
            </div>
            <Button className="w-full" variant={preferenceIds.includes(selected.id) ? "default" : "outline"} onClick={() => togglePreference(selected.id)}>
              <Star className="h-4 w-4" />{preferenceIds.includes(selected.id) ? "Preferred" : "Add to preference"}
            </Button>
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preference list</div>
                  {preferences.map((group) => (
                <div className="flex items-center gap-2" key={group.id}>
                  <button className="min-w-0 flex-1 rounded-md border border-border p-2 text-left text-sm hover:bg-surface-muted" onClick={() => { setSelectedGroupId(group.id); setAssessmentSearch(group.displayName); }}>{group.displayName}</button>
                  <Button size="icon" variant="ghost" onClick={() => togglePreference(group.id)} aria-label={`Remove ${group.displayName}`}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <AssessmentTable
          group={selected}
          times={times}
          showNow={showNow}
          values={values}
          comments={comments}
          onAddColumn={addColumn}
          onDeleteColumn={deleteColumn}
          onDeleteNow={deleteNow}
          onRenameColumn={renameColumn}
          onValueChange={(rowId, time, value) => setValues((current) => ({ ...current, [`${rowId}-${time}`]: value }))}
          onComment={(row) => setCommentTarget({ row, comment: comments[row.id] ?? "" })}
        />
      </div>
      <Drawer open={Boolean(commentTarget)} onOpenChange={(open) => !open && setCommentTarget(null)} title="Assessment comment" description={commentTarget?.row.label}>
        <div className="space-y-3">
          <textarea className="min-h-36 w-full rounded-md border border-input bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring/20" value={commentTarget?.comment ?? ""} onChange={(event) => setCommentTarget((target) => target ? { ...target, comment: event.target.value } : target)} />
          <div className="flex flex-wrap gap-2">
            <Button className="flex-1" onClick={() => {
              if (!commentTarget) return;
              setComments((current) => ({ ...current, [commentTarget.row.id]: commentTarget.comment }));
              setCommentTarget(null);
            }}>Save comment</Button>
            <Button variant="outline" onClick={() => {
              if (!commentTarget) return;
              setComments((current) => {
                const next = { ...current };
                delete next[commentTarget.row.id];
                return next;
              });
              setCommentTarget(null);
            }}>Clear</Button>
          </div>
        </div>
      </Drawer>
    </NursingShell>
  );
}

function buildMasterRows(): MasterRow[] {
  return sortAssessmentGroups(assessmentGroups).flatMap((group) => [
    { id: group.id, row: group.name, display: group.displayName, type: "Grouper" as const, active: group.active },
    ...group.rows.map((row) => ({ id: row.id, row: row.label, display: row.label, type: "Content" as const, active: true, fieldType: row.fieldType, selectable: row.selectable, options: row.options?.join(", ") ?? "" })),
  ]);
}

function ExampleList() {
  const rows = sortAssessmentGroups(assessmentGroups).flatMap((group) => group.rows.map((row, index) => ({ group: index === 0 ? group.name : "", row })));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nursing assessments example list</CardTitle>
        <CardDescription>Configured clinical content rows and dropdown values.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[1080px] border-collapse text-xs">
            <thead className="bg-surface-muted text-muted-foreground">
              <tr>{["Group", "Content row", "Field type", "Selectable", "Option, value", "Formula", "Comment"].map((head) => <th className="border-b border-border px-3 py-2 text-left" key={head}>{head}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map(({ group, row }) => (
                <tr className="border-b border-border last:border-b-0 hover:bg-surface-muted/60" key={row.id}>
                  <td className="px-3 py-2 align-top font-medium">{group}</td>
                  <td className="px-3 py-2 align-top">{row.label}</td>
                  <td className="px-3 py-2 align-top">{row.fieldType}</td>
                  <td className="px-3 py-2 align-top">{row.selectable === "None" ? "" : row.selectable}</td>
                  <td className="px-3 py-2 align-top">{row.options?.join(", ")}</td>
                  <td className="px-3 py-2 align-top">{row.formula}</td>
                  <td className="px-3 py-2 align-top">{row.commentBox ? "Yes" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function NursingAssessmentConfigurationPage() {
  const [rows, setRows] = React.useState<MasterRow[]>(buildMasterRows());
  const [search, setSearch] = React.useState("");
  const [draft, setDraft] = React.useState<MasterRow | null>(null);
  const filtered = rows.filter((row) => `${row.id} ${row.row} ${row.display}`.toLowerCase().includes(search.toLowerCase()));

  function openNew(type: MasterRow["type"]) {
    setDraft({ id: `${type === "Grouper" ? "grp" : "row"}-${Date.now().toString().slice(-4)}`, row: "", display: "", type, active: true, fieldType: "Dropdown", selectable: "Single", options: "" });
  }

  function saveDraft() {
    if (!draft) return;
    setRows((current) => current.some((row) => row.id === draft.id) ? current.map((row) => row.id === draft.id ? draft : row) : [draft, ...current]);
    setDraft(null);
  }

  return (
    <NursingShell title="Assessment Configuration" description="Configure grouper rows, content rows, field types, dropdown options, comments, and intake/output flags.">
      <Tabs defaultValue="master">
        <TabsList>
          <TabsTrigger value="master">Assessments master</TabsTrigger>
          <TabsTrigger value="examples">Example list</TabsTrigger>
        </TabsList>
        <TabsContent value="master">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Assessments Master</CardTitle>
                <CardDescription>Only active rows appear in nursing documentation.</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={() => openNew("Content")}><Plus className="h-4 w-4" />Add row</Button>
                <div className="relative min-w-0 flex-1 max-w-xs">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-8" placeholder="Search row ID or name" value={search} onChange={(event) => setSearch(event.target.value)} />
                </div>
                <Button variant="outline" onClick={() => openNew("Grouper")}>New grouper</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[900px] border-collapse text-sm">
                  <thead className="bg-surface-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <tr>{["Row ID", "Row name", "Display name", "Type", "Active", "Edit"].map((head) => <th className="border-b border-border px-3 py-2 text-left" key={head}>{head}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr className="border-b border-border last:border-b-0 hover:bg-surface-muted/60" key={row.id}>
                        <td className="px-3 py-2">{row.id}</td>
                        <td className="px-3 py-2">{row.row}</td>
                        <td className="px-3 py-2">{row.display}</td>
                        <td className="px-3 py-2"><NursingStatus status={row.type} /></td>
                        <td className="px-3 py-2"><input type="checkbox" checked={row.active} onChange={() => setRows((current) => current.map((item) => item.id === row.id ? { ...item, active: !item.active } : item))} /></td>
                        <td className="px-3 py-2"><Button size="sm" variant="outline" onClick={() => setDraft(row)}>Edit</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="examples"><ExampleList /></TabsContent>
      </Tabs>
      <Dialog.Root open={Boolean(draft)} onOpenChange={(open) => !open && setDraft(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[1px]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[88dvh] w-[min(calc(100vw-2rem),560px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-border bg-surface shadow-soft outline-none">
            <div className="flex items-start justify-between gap-4 border-b border-border bg-surface px-4 py-3">
              <div>
                <Dialog.Title className="text-sm font-semibold text-foreground">{draft?.type === "Grouper" ? "Edit grouper row" : "Edit content row"}</Dialog.Title>
                <Dialog.Description className="mt-1 text-xs text-muted-foreground">Configure the assessment master row and save your changes.</Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <Button size="icon" variant="ghost" aria-label="Close modal">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>
            <div className="max-h-[calc(88dvh-62px)] overflow-auto p-4">
              {draft ? (
                <div className="space-y-3">
                  <Input value={draft.id} onChange={(event) => setDraft({ ...draft, id: event.target.value })} placeholder="Row ID" />
                  <Input value={draft.row} onChange={(event) => setDraft({ ...draft, row: event.target.value })} placeholder="Row name" />
                  <Input value={draft.display} onChange={(event) => setDraft({ ...draft, display: event.target.value })} placeholder="Display name" />
                  <FieldLabel label="Type" value={<select className="h-9 w-full rounded-md border border-input bg-background px-2" value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as MasterRow["type"] })}><option>Grouper</option><option>Content</option></select>} />
                  {draft.type === "Content" ? (
                    <>
                      <FieldLabel label="Field type" value={<select className="h-9 w-full rounded-md border border-input bg-background px-2" value={draft.fieldType} onChange={(event) => setDraft({ ...draft, fieldType: event.target.value as NursingFieldType })}><option>Dropdown</option><option>Free text</option><option>Number</option><option>Calculated</option><option>Date and time</option></select>} />
                      <FieldLabel label="Selectable" value={<select className="h-9 w-full rounded-md border border-input bg-background px-2" value={draft.selectable} onChange={(event) => setDraft({ ...draft, selectable: event.target.value as NursingSelectable })}><option>Single</option><option>Multiple</option><option>None</option></select>} />
                      <Input value={draft.options ?? ""} onChange={(event) => setDraft({ ...draft, options: event.target.value })} placeholder="Dropdown options comma separated" />
                    </>
                  ) : null}
                  {rows.some((row) => row.id === draft.id) ? (
                    <div className="rounded-md border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
                      <div className="font-semibold">Delete this configuration?</div>
                      <p className="mt-1 text-xs text-danger-foreground">This will permanently remove the selected assessment row or grouper.</p>
                      <Button size="sm" variant="danger" onClick={() => {
                        setRows((current) => current.filter((row) => row.id !== draft.id));
                        setDraft(null);
                      }}>
                        Delete configuration
                      </Button>
                    </div>
                  ) : null}
                  <Button className="w-full" onClick={saveDraft}>Save configuration</Button>
                </div>
              ) : null}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </NursingShell>
  );
}
