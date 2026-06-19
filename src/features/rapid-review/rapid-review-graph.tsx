"use client";

import * as React from "react";
import { Activity, BarChart3, CalendarDays, ChevronLeft, ChevronRight, Clock, HeartPulse, RefreshCcw, Search, Table2, UsersRound } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NativeSelect } from "@/features/admin/admin-shared";
import { cn } from "@/lib/utils";
import type { StatusTone } from "@/types";
import {
  adultObservationRiskPalette,
  gcsScoreLabel,
  getRiskLevel,
  inferFio2FromOxygenSupport,
  rapidLevelTone,
  rapidZoneTone,
  type AdultObservationRiskLevel,
  type AdultObservationVitalType,
  type RapidObservationSet,
  type RapidReviewPatient,
} from "./rapid-review-data";

type ReviewGraphMetricId =
  | "respiratoryRate"
  | "oxygenSaturation"
  | "oxygenFlowRate"
  | "fio2"
  | "bloodPressure"
  | "bloodPressureDiastolic"
  | "pulseRate"
  | "monitorHeartRate"
  | "temperature"
  | "consciousnessSedation"
  | "painScore"
  | "bloodGlucose"
  | "fluidIntake"
  | "urineOutput";

type ReviewGraphMetric = {
  id: ReviewGraphMetricId;
  vitalType: AdultObservationVitalType;
  label: string;
  shortLabel: string;
  unit: string;
  normalText: string;
  extractor: (observation: RapidObservationSet) => number | null;
  display: (observation: RapidObservationSet) => string;
  riskExtractor?: (observation: RapidObservationSet) => AdultObservationRiskLevel;
};

type ReviewGraphPoint = {
  date: string;
  hour: string;
  time: string;
  xLabel: string;
  value: number | null;
  displayValue: string;
  fio2: string;
  risk: AdultObservationRiskLevel;
};

type CombinedReviewGraphPoint = {
  date: string;
  time: string;
  xLabel: string;
  displays: Partial<Record<ReviewGraphMetricId, string>>;
  risks: Partial<Record<ReviewGraphMetricId, AdultObservationRiskLevel>>;
} & Partial<Record<ReviewGraphMetricId, number | null>>;

type AllVitalsGraphSection = {
  title: string;
  description: string;
  metrics: ReviewGraphMetricId[];
};

const reviewGraphLineColor = "#2563eb";
const allVitalsGraphView = "All vitals graph";
const reviewMetricColors: Record<ReviewGraphMetricId, string> = {
  respiratoryRate: "#e66100",
  oxygenSaturation: "#0072b2",
  oxygenFlowRate: "#8f5a11",
  fio2: "#009e73",
  bloodPressure: "#d55e00",
  bloodPressureDiastolic: "#cc79a7",
  pulseRate: "#d00000",
  monitorHeartRate: "#0057b8",
  temperature: "#b00020",
  consciousnessSedation: "#6f2dbd",
  painScore: "#111827",
  bloodGlucose: "#00a6a6",
  fluidIntake: "#1f9d55",
  urineOutput: "#6d4c41",
};

const reviewGraphMetrics: ReviewGraphMetric[] = [
  {
    id: "respiratoryRate",
    vitalType: "respiratoryRate",
    label: "Respiratory Rate",
    shortLabel: "RR",
    unit: "/min",
    normalText: "Normal 16-20 /min",
    extractor: (observation) => parseObservationNumber(observation.respiratoryRate),
    display: (observation) => observation.respiratoryRate,
  },
  {
    id: "oxygenSaturation",
    vitalType: "oxygenSaturation",
    label: "O2 Saturation",
    shortLabel: "SpO2",
    unit: "%",
    normalText: "Normal >= 98%",
    extractor: (observation) => parseObservationNumber(observation.spo2),
    display: (observation) => observation.spo2,
  },
  {
    id: "oxygenFlowRate",
    vitalType: "oxygenFlowRate",
    label: "O2 Flow Rate",
    shortLabel: "O2 Flow",
    unit: "L/min",
    normalText: "Normal 0 L/min",
    extractor: (observation) => oxygenFlowValue(observation.oxygenFlow),
    display: (observation) => observation.oxygenFlow,
  },
  {
    id: "fio2",
    vitalType: "fio2",
    label: "FiO2",
    shortLabel: "FiO2",
    unit: "%",
    normalText: "Room air 21%, rising oxygen need is higher risk",
    extractor: (observation) => parseObservationNumber(fio2Value(observation)),
    display: (observation) => fio2Value(observation),
  },
  {
    id: "bloodPressure",
    vitalType: "bloodPressure",
    label: "BP Systolic",
    shortLabel: "BP sys",
    unit: "mmHg",
    normalText: "Systolic normal 91-159",
    extractor: (observation) => systolicValue(observation.bloodPressure),
    display: (observation) => observation.bloodPressure,
  },
  {
    id: "bloodPressureDiastolic",
    vitalType: "bloodPressure",
    label: "BP Diastolic",
    shortLabel: "BP dia",
    unit: "mmHg",
    normalText: "Diastolic normal 60-89",
    extractor: (observation) => diastolicValue(observation.bloodPressure),
    display: (observation) => {
      const value = diastolicValue(observation.bloodPressure);
      return value === null ? "--" : `${value} mmHg`;
    },
    riskExtractor: (observation) => diastolicRiskLevel(observation.bloodPressure),
  },
  {
    id: "pulseRate",
    vitalType: "pulseRate",
    label: "Pulse Rate",
    shortLabel: "Pulse",
    unit: "/min",
    normalText: "Normal 60-99 /min",
    extractor: (observation) => parseObservationNumber(observation.pulse),
    display: (observation) => observation.pulse,
  },
  {
    id: "monitorHeartRate",
    vitalType: "monitorHeartRate",
    label: "Monitor Heart Rate",
    shortLabel: "HR",
    unit: "bpm",
    normalText: "Normal 60-99 bpm",
    extractor: (observation) => parseObservationNumber(monitorHeartRateValue(observation)),
    display: (observation) => monitorHeartRateValue(observation),
  },
  {
    id: "temperature",
    vitalType: "temperature",
    label: "Temperature",
    shortLabel: "Temp",
    unit: "deg C",
    normalText: "Normal 36.1-37.5 deg C",
    extractor: (observation) => parseObservationNumber(observation.temperature),
    display: (observation) => observation.temperature,
  },
  {
    id: "consciousnessSedation",
    vitalType: "consciousnessSedation",
    label: "GCS Score",
    shortLabel: "GCS",
    unit: "score",
    normalText: "GCS up to 15",
    extractor: (observation) => gcsGraphValue(observation.consciousness),
    display: (observation) => {
      const value = gcsGraphValue(observation.consciousness);
      return value === null ? gcsScoreLabel(observation.consciousness) : `${value}/15 - ${gcsScoreLabel(observation.consciousness)}`;
    },
    riskExtractor: (observation) => getRiskLevel("consciousnessSedation", observation.consciousness),
  },
  {
    id: "painScore",
    vitalType: "painScore",
    label: "Pain Score",
    shortLabel: "Pain",
    unit: "/10",
    normalText: "Normal 0-3",
    extractor: (observation) => parseObservationNumber(observation.painScore),
    display: (observation) => observation.painScore,
  },
  {
    id: "bloodGlucose",
    vitalType: "intervention",
    label: "Blood Glucose",
    shortLabel: "Glucose",
    unit: "mg/dL",
    normalText: "India and foreign reference bands shown in graph",
    extractor: bloodGlucoseValue,
    display: (observation) => `${bloodGlucoseValue(observation)} mg/dL`,
    riskExtractor: (observation) => glucoseRiskLevel(bloodGlucoseValue(observation)),
  },
  {
    id: "fluidIntake",
    vitalType: "intervention",
    label: "Fluid Intake",
    shortLabel: "Intake",
    unit: "ml/hr",
    normalText: "Sample hourly intake for graph review",
    extractor: rapidReviewFluidIntakeValue,
    display: (observation) => {
      const intake = rapidReviewFluidIntakeValue(observation);
      return intake === null ? "--" : `${intake} ml/hr`;
    },
  },
  {
    id: "urineOutput",
    vitalType: "intervention",
    label: "Urine Output",
    shortLabel: "Urine",
    unit: "ml/hr",
    normalText: "Normal >= 40 ml/hr, low < 30 ml/hr",
    extractor: (observation) => parseObservationNumber(observation.urineOutput),
    display: (observation) => observation.urineOutput,
    riskExtractor: (observation) => urineOutputRiskLevel(observation.urineOutput),
  },
];

const allVitalsGraphSections: AllVitalsGraphSection[] = [
  {
    title: "Respiration",
    description: "Respiratory rate, oxygen saturation, oxygen flow, and FiO2 trend.",
    metrics: ["respiratoryRate", "oxygenSaturation", "oxygenFlowRate", "fio2"],
  },
  {
    title: "CVS",
    description: "Pulse, monitor heart rate, systolic blood pressure, and diastolic blood pressure trends.",
    metrics: ["pulseRate", "monitorHeartRate", "bloodPressure", "bloodPressureDiastolic"],
  },
  {
    title: "Infection",
    description: "Temperature trend with risk markers.",
    metrics: ["temperature"],
  },
  {
    title: "Neuro / Pain",
    description: "GCS plotted below 15 and pain score plotted below 10 with 3-point y-axis intervals.",
    metrics: ["consciousnessSedation", "painScore"],
  },
  {
    title: "Glucose",
    description: "Blood glucose trend with India and foreign reference legends.",
    metrics: ["bloodGlucose"],
  },
  {
    title: "Intake / Output",
    description: "Hourly intake and urine output trend from rapid review observations.",
    metrics: ["fluidIntake", "urineOutput"],
  },
];

const coreVitalsGraphSection: AllVitalsGraphSection = {
  title: "Vitals Graph",
  description: "Core respiratory, cardiovascular, and temperature trends in the selected date and time range.",
  metrics: ["respiratoryRate", "oxygenSaturation", "pulseRate", "monitorHeartRate", "bloodPressure", "bloodPressureDiastolic", "temperature"],
};

const rollingVitalsTimeIntervals = ["Last 3 hours", "Last 6 hours", "Last 12 hours", "Last 24 hours", "Last 48 hours"];
const patientVitalsTimeIntervals = ["All times", ...rollingVitalsTimeIntervals];

export function RapidReviewGraphTab({ patients, defaultViewMode = "Graph + table" }: { patients: RapidReviewPatient[]; defaultViewMode?: string }) {
  const [metricId, setMetricId] = React.useState<ReviewGraphMetricId>("respiratoryRate");
  const [patientId, setPatientId] = React.useState(patients[0]?.id ?? "");
  const [viewMode, setViewMode] = React.useState(defaultViewMode);
  const [search, setSearch] = React.useState("");
  const [dateMode, setDateMode] = React.useState("All dates");
  const [singleDate, setSingleDate] = React.useState("");
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [timeMode, setTimeMode] = React.useState("All times");
  const [timeFrom, setTimeFrom] = React.useState("");
  const [timeTo, setTimeTo] = React.useState("");

  const metric = reviewGraphMetrics.find((item) => item.id === metricId) ?? reviewGraphMetrics[0];
  const selectedPatient = patients.find((patient) => patient.id === patientId) ?? patients[0];
  const patientDates = selectedPatient ? uniqueObservationDates(selectedPatient.observationHistory) : [];
  const latestDataDate = latestAvailableDate(patientDates);
  const filteredObservations = selectedPatient
    ? selectedPatient.observationHistory
      .filter((observation) => observationMatchesDateFilter(observation, dateMode, singleDate, dateFrom, dateTo, latestDataDate))
      .filter((observation) => observationMatchesTimeFilter(observation, timeMode, timeFrom, timeTo))
      .sort((a, b) => observationDateTimeSortValue(a).localeCompare(observationDateTimeSortValue(b)))
    : [];
  const patientMatches = React.useMemo(() => {
    return patients.filter((patient) => {
      const searchText = `${patient.patientName} ${patient.uhid} ${patient.bed} ${patient.ward} ${patient.consultant}`;
      return searchText.toLowerCase().includes(search.toLowerCase());
    });
  }, [patients, search]);
  const isAllVitalsGraph = viewMode === allVitalsGraphView;
  const graphData = buildReviewGraphData(filteredObservations, metric);
  const summary = buildReviewGraphSummary(filteredObservations, metric);
  const combinedGraphData = buildCombinedReviewGraphData(filteredObservations);
  const combinedSummary = buildCombinedReviewGraphSummary(filteredObservations);
  const activeSummary = isAllVitalsGraph ? combinedSummary : summary;
  const filterSummary = `${dateFilterSummary(dateMode, singleDate, dateFrom, dateTo, latestDataDate)} | ${timeFilterSummary(timeMode, timeFrom, timeTo)}`;

  function updateDateMode(value: string) {
    setDateMode(value);
    if (value === "Single date" && !singleDate) setSingleDate(latestDataDate || todayDateValue());
    if (value === "Custom range" && !dateFrom && !dateTo) {
      const defaultDate = latestDataDate || todayDateValue();
      setDateFrom(defaultDate);
      setDateTo(defaultDate);
    }
  }

  if (!patients.length) {
    return <EmptyState icon={BarChart3} title="No patients available" description="No rapid review observations are available for graph review." />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Review Graph</CardTitle>
            <CardDescription>Select one patient and review focused vital trends or the complete combined clinical trend.</CardDescription>
          </div>
          <Badge tone="info">Patient-wise</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(260px,1.35fr)_minmax(240px,1fr)_180px] lg:items-end">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">Search patient</span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  className="h-9 w-full rounded-md border border-input bg-background px-9 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Search name, UHID, bed, ward..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">Patient filter</span>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
                value={patientId}
                onChange={(event) => setPatientId(event.target.value)}
              >
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.patientName} - {patient.uhid} - {patient.bed}
                  </option>
                ))}
              </select>
            </label>
            <NativeSelect
              label="View"
              value={viewMode}
              onChange={setViewMode}
              options={["Graph + table", "Graph only", "Table only", allVitalsGraphView]}
            />
          </div>

          <ReviewGraphDateFilter
            dateFrom={dateFrom}
            dateMode={dateMode}
            dateTo={dateTo}
            latestDataDate={latestDataDate}
            onDateFrom={setDateFrom}
            onDateMode={updateDateMode}
            onDateTo={setDateTo}
            onSingleDate={setSingleDate}
            onTimeFrom={setTimeFrom}
            onTimeMode={setTimeMode}
            onTimeTo={setTimeTo}
            singleDate={singleDate}
            timeFrom={timeFrom}
            timeMode={timeMode}
            timeTo={timeTo}
          />

          {search.trim() ? (
            <div className="rounded-md border border-border bg-surface-muted p-3">
              <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Matching patients</div>
              <div className="flex flex-wrap gap-2">
                {patientMatches.length ? patientMatches.map((patient) => (
                  <Button
                    key={patient.id}
                    size="sm"
                    variant={patient.id === selectedPatient?.id ? "default" : "outline"}
                    onClick={() => setPatientId(patient.id)}
                  >
                    {patient.patientName} - {patient.bed}
                  </Button>
                )) : <span className="text-sm text-muted-foreground">No patient matched this search.</span>}
              </div>
            </div>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {reviewGraphMetrics.map((item) => (
              <button
                className={cn(
                  "rounded-md border p-3 text-left transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-ring/20",
                  isAllVitalsGraph
                    ? "border-primary/40 bg-primary/5"
                    : item.id === metric.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background",
                )}
                key={item.id}
                onClick={() => setMetricId(item.id)}
                type="button"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{item.label}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{item.normalText}</div>
                  </div>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <GraphStatCard label="Selected vital" value={isAllVitalsGraph ? "All graphs" : metric.shortLabel} context={isAllVitalsGraph ? `${allVitalsGraphSections.length} panels` : metric.unit} tone="info" icon={BarChart3} />
        <GraphStatCard label="Total entries" value={activeSummary.totalEntries} context={filterSummary} tone="success" icon={Table2} />
        <GraphStatCard label="High/Critical" value={activeSummary.highRiskCount + activeSummary.criticalCount} context={`${activeSummary.criticalCount} critical`} tone={activeSummary.criticalCount ? "critical" : activeSummary.highRiskCount ? "danger" : "success"} icon={HeartPulse} />
        <GraphStatCard label="Patient" value={selectedPatient?.patientName ?? "-"} context={selectedPatient ? `${selectedPatient.bed}, ${selectedPatient.ward}` : "Focused"} tone="info" icon={UsersRound} />
      </div>

      {isAllVitalsGraph && selectedPatient ? (
        <AllVitalsGraphDashboard patient={selectedPatient} data={combinedGraphData} dateSummary={filterSummary} />
      ) : viewMode !== "Table only" && selectedPatient ? (
        <ReviewGraphPanel patient={selectedPatient} data={graphData} metric={metric} dateSummary={filterSummary} />
      ) : null}

      {!isAllVitalsGraph && viewMode !== "Graph only" && selectedPatient ? (
        <ReviewGraphTable patient={selectedPatient} observations={filteredObservations} metric={metric} dateSummary={filterSummary} />
      ) : null}
    </div>
  );
}

export function PatientVitalsGraph({ patient }: { patient: RapidReviewPatient }) {
  return <VitalsGraphWorkspace data={buildCombinedReviewGraphData(patient.observationHistory)} showGraphTabs />;
}

export function PatientVitalsAllGraphOnly({ patient }: { patient: RapidReviewPatient }) {
  return <VitalsGraphWorkspace data={buildCombinedReviewGraphData(patient.observationHistory)} showAllGraphOnly />;
}

function ReviewGraphDateFilter({
  dateMode,
  onDateMode,
  singleDate,
  onSingleDate,
  dateFrom,
  onDateFrom,
  dateTo,
  onDateTo,
  latestDataDate,
  timeMode,
  onTimeMode,
  timeFrom,
  onTimeFrom,
  timeTo,
  onTimeTo,
}: {
  dateMode: string;
  onDateMode: (mode: string) => void;
  singleDate: string;
  onSingleDate: (date: string) => void;
  dateFrom: string;
  onDateFrom: (date: string) => void;
  dateTo: string;
  onDateTo: (date: string) => void;
  latestDataDate: string;
  timeMode: string;
  onTimeMode: (mode: string) => void;
  timeFrom: string;
  onTimeFrom: (time: string) => void;
  timeTo: string;
  onTimeTo: (time: string) => void;
}) {
  const modes = ["All dates", "Latest record date", "Today", "Yesterday", "Last 7 days", "Last 30 days", "Single date", "Custom range"];
  const timeModes = ["All times", "Morning 06-13", "Afternoon 14-17", "Evening 18-21", "Night 22-05", "Business hours", "Custom time range"];
  const invalidRange = dateMode === "Custom range" && Boolean(dateFrom && dateTo && dateFrom > dateTo);

  return (
    <div className="rounded-md border border-border bg-surface-muted p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase text-muted-foreground">Date filter</div>
          <div className="mt-1 text-sm text-foreground">{dateFilterSummary(dateMode, singleDate, dateFrom, dateTo, latestDataDate)}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {modes.map((mode) => (
            <Button
              key={mode}
              size="sm"
              variant={dateMode === mode ? "default" : "outline"}
              onClick={() => onDateMode(mode)}
            >
              {mode}
            </Button>
          ))}
        </div>
      </div>

      {dateMode === "Single date" ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-[180px_auto] sm:items-end">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">Select date</span>
            <input
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
              type="date"
              value={singleDate}
              onChange={(event) => onSingleDate(event.target.value)}
            />
          </label>
          <Button variant="outline" onClick={() => onSingleDate(latestDataDate || todayDateValue())}>
            Latest record date
          </Button>
        </div>
      ) : null}

      {dateMode === "Custom range" ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-[180px_180px_auto] sm:items-end">
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">From date</span>
            <input
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
              type="date"
              value={dateFrom}
              onChange={(event) => onDateFrom(event.target.value)}
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium text-foreground">To date</span>
            <input
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
              type="date"
              value={dateTo}
              onChange={(event) => onDateTo(event.target.value)}
            />
          </label>
          <Button variant="outline" onClick={() => {
            onDateFrom("");
            onDateTo("");
          }}>
            Reset range
          </Button>
        </div>
      ) : null}

      {invalidRange ? (
        <div className="mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          From date cannot be after To date.
        </div>
      ) : null}

      <div className="mt-4 border-t border-border pt-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase text-muted-foreground">Time filter</div>
            <div className="mt-1 text-sm text-foreground">{timeFilterSummary(timeMode, timeFrom, timeTo)}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {timeModes.map((mode) => (
              <Button
                key={mode}
                size="sm"
                variant={timeMode === mode ? "default" : "outline"}
                onClick={() => onTimeMode(mode)}
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>

        {timeMode === "Custom time range" ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-[180px_180px_auto] sm:items-end">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">From time</span>
              <input
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
                type="time"
                value={timeFrom}
                onChange={(event) => onTimeFrom(event.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">To time</span>
              <input
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
                type="time"
                value={timeTo}
                onChange={(event) => onTimeTo(event.target.value)}
              />
            </label>
            <Button variant="outline" onClick={() => {
              onTimeFrom("");
              onTimeTo("");
            }}>
              <RefreshCcw className="h-4 w-4" />
              Reset time
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ReviewGraphPanel({
  patient,
  data,
  metric,
  dateSummary,
}: {
  patient: RapidReviewPatient;
  data: ReviewGraphPoint[];
  metric: ReviewGraphMetric;
  dateSummary: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{metric.label} - Date / Time Trend</CardTitle>
          <CardDescription>{patient.patientName} - {patient.uhid} - {patient.bed}. {dateSummary}.</CardDescription>
        </div>
        <StatusPill tone="info">{metric.unit}</StatusPill>
      </CardHeader>
      <CardContent>
        <ReviewGraphRiskLegend />
        <div className="h-[360px]">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={data} margin={{ left: -16, right: 16, top: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="xLabel" tick={{ fontSize: 11 }} interval="preserveStartEnd" minTickGap={24} />
              <YAxis tick={{ fontSize: 11 }} width={52} />
              <Tooltip content={<ReviewGraphTooltip metric={metric} />} />
              <Legend />
              <Line
                activeDot={renderActiveReviewGraphDot}
                connectNulls
                dataKey="value"
                dot={renderReviewGraphDot}
                name={`${patient.patientName} (${metric.shortLabel})`}
                stroke={reviewGraphLineColor}
                strokeWidth={2}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewGraphRiskLegend() {
  const levels: AdultObservationRiskLevel[] = ["critical", "highRisk", "warning", "normal"];

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {levels.map((level) => {
        const palette = adultObservationRiskPalette[level];
        return (
          <span
            className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium"
            key={level}
            style={{ backgroundColor: palette.background, borderColor: palette.border, color: palette.text }}
          >
            <span className="h-2.5 w-2.5 rounded-full border" style={{ backgroundColor: palette.background, borderColor: palette.text }} />
            {palette.label}
          </span>
        );
      })}
    </div>
  );
}

function ReviewGraphTooltip({ active, payload, metric }: { active?: boolean; payload?: Array<{ payload?: ReviewGraphPoint }>; metric: ReviewGraphMetric }) {
  if (!active) return null;
  const point = payload?.[0]?.payload;
  if (!point) return null;
  const palette = adultObservationRiskPalette[point.risk];

  return (
    <div className="rounded-md border border-border bg-background p-3 text-xs shadow-lg">
      <div className="font-semibold text-foreground">{formatDateLabel(point.date)} - {point.time}</div>
      <div className="mt-1 text-muted-foreground">{metric.label}: <span className="font-semibold text-foreground">{point.displayValue}</span></div>
      {metric.id === "oxygenSaturation" ? (
        <div className="mt-1 text-muted-foreground">FiO2: <span className="font-semibold text-foreground">{point.fio2}</span></div>
      ) : null}
      <div className="mt-2 inline-flex rounded-full border px-2 py-0.5 font-medium" style={{ backgroundColor: palette.background, borderColor: palette.border, color: palette.text }}>
        {palette.label}
      </div>
    </div>
  );
}

type ReviewGraphDotProps = {
  active?: boolean;
  cx?: number;
  cy?: number;
  payload?: ReviewGraphPoint;
};

function renderReviewGraphDot(props: unknown) {
  return <ReviewGraphDot {...(props as ReviewGraphDotProps)} />;
}

function renderActiveReviewGraphDot(props: unknown) {
  return <ReviewGraphDot {...(props as ReviewGraphDotProps)} active />;
}

function ReviewGraphDot({ active, cx, cy, payload }: ReviewGraphDotProps) {
  if (typeof cx !== "number" || typeof cy !== "number" || payload?.value === null) return null;

  const palette = adultObservationRiskPalette[payload?.risk ?? "empty"];
  return (
    <circle
      cx={cx}
      cy={cy}
      fill={palette.background}
      r={active ? 6 : 4}
      stroke={palette.text}
      strokeWidth={active ? 2.5 : 2}
    />
  );
}

function ReviewGraphTable({
  patient,
  observations,
  metric,
  dateSummary,
}: {
  patient: RapidReviewPatient;
  observations: RapidObservationSet[];
  metric: ReviewGraphMetric;
  dateSummary: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{metric.label} - Date / Time Data</CardTitle>
          <CardDescription>{patient.patientName} patient-wise table. Date filter: {dateSummary}.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[1080px] border-collapse text-sm">
            <thead className="bg-surface-muted text-xs uppercase text-muted-foreground">
              <tr>
                <th className="sticky left-0 z-10 border-b border-r border-border bg-surface-muted px-3 py-2 text-left">Date</th>
                <th className="border-b border-r border-border px-3 py-2 text-left">Time</th>
                <th className="border-b border-r border-border px-3 py-2 text-left">Value</th>
                <th className="border-b border-r border-border px-3 py-2 text-left">Risk</th>
                <th className="border-b border-r border-border px-3 py-2 text-left">Response</th>
                <th className="border-b border-r border-border px-3 py-2 text-left">Entered by</th>
                <th className="border-b border-r border-border px-3 py-2 text-left">Note</th>
              </tr>
            </thead>
            <tbody>
              {observations.length ? observations.map((observation) => {
                const value = metric.display(observation);
                const risk = metricRiskLevel(metric, observation);
                return (
                  <tr className="border-b border-border last:border-0" key={observation.id}>
                    <td className="sticky left-0 z-10 whitespace-nowrap border-r border-border bg-background px-3 py-2 font-medium">{formatDateLabel(observationDateValue(observation))}</td>
                    <td className="whitespace-nowrap border-r border-border px-3 py-2">
                      <div className="font-medium">{observationTimeLabel(observation)}</div>
                      <div className="text-xs text-muted-foreground">{observation.shift ?? "Shift not set"}</div>
                    </td>
                    <td className="border-r border-border px-3 py-2 font-semibold" style={riskCellStyle(risk)}>{value}</td>
                    <td className="border-r border-border px-3 py-2">
                      <Badge tone={riskBadgeTone(risk)}>{adultObservationRiskPalette[risk].label}</Badge>
                    </td>
                    <td className="border-r border-border px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        <Badge tone={rapidZoneTone(observation.dominantZone)}>{observation.dominantZone}</Badge>
                        <StatusPill tone={rapidLevelTone(observation.responseLevel)}>{observation.responseLevel}</StatusPill>
                      </div>
                    </td>
                    <td className="border-r border-border px-3 py-2 text-muted-foreground">{observation.recordedBy}</td>
                    <td className="min-w-[260px] border-r border-border px-3 py-2 text-muted-foreground">{observation.note}</td>
                  </tr>
                );
              }) : (
                <tr>
                  <td className="px-3 py-8 text-center text-muted-foreground" colSpan={7}>No graph data matched the selected date and time filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function AllVitalsGraphDashboard({
  patient,
  data,
  dateSummary,
}: {
  patient: RapidReviewPatient;
  data: CombinedReviewGraphPoint[];
  dateSummary: string;
}) {
  const [activeSection, setActiveSection] = React.useState(allVitalsGraphSections[0]?.title ?? "");

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-surface-muted px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">All Vitals Graph</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {patient.patientName} - {patient.uhid} - {patient.bed}. {dateSummary}. Each section uses a normalized 0-100 trend scale so different vitals can be compared together.
            </p>
          </div>
          <StatusPill tone="info">{reviewGraphMetrics.length} vitals</StatusPill>
        </div>
      </div>

      <Tabs className="space-y-4" onValueChange={setActiveSection} value={activeSection}>
        <TabsList aria-label="All vitals graph categories">
          {allVitalsGraphSections.map((section) => (
            <TabsTrigger key={section.title} value={section.title}>
              {section.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {allVitalsGraphSections.map((section) => (
          <TabsContent key={section.title} value={section.title}>
            <AllVitalsGraphSectionCard data={data} section={section} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function VitalsGraphWorkspace({
  data,
  showAllGraphOnly = false,
  showGraphTabs = false,
}: {
  data: CombinedReviewGraphPoint[];
  showAllGraphOnly?: boolean;
  showGraphTabs?: boolean;
}) {
  const availableDates = Array.from(new Set(data.map((point) => point.date))).sort();
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  const [endTime, setEndTime] = React.useState("");
  const [timeInterval, setTimeInterval] = React.useState("All times");
  const [activeGraphSection, setActiveGraphSection] = React.useState("All");
  const dateFilteredData = data.filter((point) => {
    if (startDate && point.date < startDate) return false;
    if (endDate && point.date > endDate) return false;
    return true;
  });
  const latestDateTime = Math.max(...dateFilteredData.map(graphPointDateTimeValue).filter(Number.isFinite));
  const filteredData = dateFilteredData.filter((point) => graphPointMatchesTimeInterval(point, timeInterval, startTime, endTime, latestDateTime));
  const invalidDateRange = Boolean(startDate && endDate && startDate > endDate);
  const visibleData = invalidDateRange ? [] : filteredData;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full sm:w-[290px]">
              <DateRangeCalendar
                endDate={endDate}
                maxDate={availableDates.at(-1)}
                minDate={availableDates[0]}
                onChange={(start, end) => {
                  setStartDate(start);
                  setEndDate(end);
                }}
                startDate={startDate}
              />
            </div>
            <label className="w-full space-y-1 text-sm sm:w-[220px]">
              <span className="font-medium text-foreground">Time interval</span>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
                onChange={(event) => setTimeInterval(event.target.value)}
                value={timeInterval}
              >
                {patientVitalsTimeIntervals.map((interval) => (
                  <option key={interval} value={interval}>{interval}</option>
                ))}
              </select>
            </label>
            {timeInterval === "Custom time range" ? (
              <div className="w-full sm:w-[260px]">
                <TimeRangePicker
                  endTime={endTime}
                  onChange={(start, end) => {
                    setStartTime(start);
                    setEndTime(end);
                  }}
                  startTime={startTime}
                />
              </div>
            ) : null}
          </div>
          <div className="mt-3 border-t border-border pt-3">
            {/* <div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Date-wise time interval</div>
            <div className="flex flex-wrap gap-2">
              {rollingVitalsTimeIntervals.map((interval) => (
                <Button
                  key={interval}
                  onClick={() => setTimeInterval(interval)}
                  size="sm"
                  type="button"
                  variant={timeInterval === interval ? "default" : "outline"}
                >
                  {interval.replace("Last ", "")}
                </Button>
              ))}
            </div> */}
          </div>
          {invalidDateRange ? (
            <div className="mt-3 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
              Start date cannot be after end date.
            </div>
          ) : null}
        </CardContent>
      </Card>
      {showAllGraphOnly ? (
        <VitalsGraphOneReference data={visibleData} />
      ) : showGraphTabs ? (
        <Tabs className="space-y-4" onValueChange={setActiveGraphSection} value={activeGraphSection}>
          <TabsList aria-label="Patient vitals graph categories">
            {/* <TabsTrigger value="All1">All1</TabsTrigger> */}
            <TabsTrigger value="All">All</TabsTrigger>
            {allVitalsGraphSections.map((section) => (
              <TabsTrigger key={section.title} value={section.title}>
                {section.title}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="All1">
            <AllVitalsGraphSections data={visibleData} />
          </TabsContent>
          <TabsContent value="All">
            <VitalsGraphOneReference data={visibleData} />
          </TabsContent>
          {allVitalsGraphSections.map((section) => (
            <TabsContent key={section.title} value={section.title}>
              <VitalsGraphOneReference data={visibleData} onlySection={section.title} />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <AllVitalsGraphSectionCard data={visibleData} section={coreVitalsGraphSection} />
      )}
    </div>
  );
}

type VitalsGraphOnePoint = {
  date: string;
  time: string;
  xLabel: string;
  pulseRate: number | null;
  monitorHeartRate: number | null;
  bloodPressure: number | null;
  bloodPressureDiastolic: number | null;
  respiratoryRate: number | null;
  oxygenSaturation: number | null;
  oxygenFlowRate: number | null;
  fio2: number | null;
  temperature: number | null;
  consciousnessSedation: number | null;
  painScore: number | null;
  bloodGlucose: number | null;
  bloodGlucoseForeign: number | null;
  fluidIntake: number | null;
  urineOutput: number | null;
  displays: CombinedReviewGraphPoint["displays"];
  risks: CombinedReviewGraphPoint["risks"];
};

type VitalsGraphOneLegend = {
  active?: boolean;
  color: string;
  description: string;
  label: string;
  onClick?: () => void;
};

function VitalsGraphOneReference({ data, graphOnly = false, onlySection }: { data: CombinedReviewGraphPoint[]; graphOnly?: boolean; onlySection?: string }) {
  const [activeGlucoseGraph, setActiveGlucoseGraph] = React.useState<"india" | "foreign">("india");
  const chartData = buildVitalsGraphOneData(data);
  const activeGlucoseConfig = activeGlucoseGraph === "india"
    ? {
      color: reviewMetricColor("bloodGlucose"),
      dataKey: "bloodGlucose" as const,
      domain: [0, 300] as [number, number],
      label: "India 70-140 mg/dL",
      max: 140,
      min: 70,
      name: "Glucose",
      ticks: [0, 60, 120, 180, 240, 300],
      yAxisId: "india" as const,
    }
    : {
      color: "#8b5cf6",
      dataKey: "bloodGlucoseForeign" as const,
      domain: [0, 18] as [number, number],
      label: "Foreign 4.4-10 mmol/L",
      max: 10,
      min: 4.4,
      name: "Foreign graph",
      ticks: [0, 3, 6, 9, 12, 15, 18],
      yAxisId: "foreign" as const,
    };

  if (!chartData.length) {
    return <EmptyState icon={BarChart3} title="Vitals Graph 1 unavailable" description="No observation data matched the selected date and time filter." />;
  }

  const content = (
    <>
        <div className={cn("space-y-4", graphOnly ? "p-0" : "p-4")}>
          {(!onlySection || onlySection === "CVS") && (
            <VitalsGraphOneSection
              graphOnly={graphOnly}
              legends={[
                vitalsGraphOneLegend("pulseRate"),
                vitalsGraphOneLegend("monitorHeartRate"),
                vitalsGraphOneLegend("bloodPressure"),
                vitalsGraphOneLegend("bloodPressureDiastolic"),
              ]}
              subtitle="Pulse, monitor heart rate, systolic blood pressure, and diastolic blood pressure trends."
              title="CVS"
            >
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={chartData} margin={{ left: -8, right: 14, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="xLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" minTickGap={26} />
                  <YAxis domain={[30, 220]} tick={{ fontSize: 10 }} width={44} />
                  <Tooltip content={<VitalsGraphOneTooltip />} />
                  <Line connectNulls dataKey="pulseRate" dot={{ r: 3 }} name="Pulse" stroke={reviewMetricColor("pulseRate")} strokeWidth={3} type="monotone" />
                  <Line connectNulls dataKey="monitorHeartRate" dot={{ r: 3 }} name="HR" stroke={reviewMetricColor("monitorHeartRate")} strokeDasharray="7 4" strokeWidth={2.8} type="monotone" />
                  <Line connectNulls dataKey="bloodPressure" dot={{ r: 3 }} name="BP sys" stroke={reviewMetricColor("bloodPressure")} strokeWidth={3} type="monotone" />
                  <Line connectNulls dataKey="bloodPressureDiastolic" dot={{ r: 3 }} name="BP dia" stroke={reviewMetricColor("bloodPressureDiastolic")} strokeWidth={2.8} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </VitalsGraphOneSection>
          )}

          {(!onlySection || onlySection === "Respiration") && (
            <VitalsGraphOneSection
              graphOnly={graphOnly}
              legends={[
                vitalsGraphOneLegend("respiratoryRate"),
                vitalsGraphOneLegend("oxygenSaturation"),
                vitalsGraphOneLegend("oxygenFlowRate"),
                vitalsGraphOneLegend("fio2"),
              ]}
              subtitle="Respiratory rate, oxygen saturation, oxygen flow, and FiO2 trend."
              title="Respiration"
            >
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={chartData} margin={{ left: -8, right: -8, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="xLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" minTickGap={26} />
                  <YAxis domain={[0, 45]} tick={{ fontSize: 10 }} width={44} yAxisId="rate" />
                  <YAxis domain={[0, 100]} orientation="right" tick={{ fontSize: 10 }} width={38} yAxisId="spo2" />
                  <Tooltip content={<VitalsGraphOneTooltip />} />
                  <ReferenceArea fill="#16a34a" fillOpacity={0.06} y1={95} y2={100} yAxisId="spo2" />
                  <Line connectNulls dataKey="respiratoryRate" dot={{ r: 3 }} name="RR" stroke={reviewMetricColor("respiratoryRate")} strokeWidth={3} type="monotone" yAxisId="rate" />
                  <Line connectNulls dataKey="oxygenFlowRate" dot={{ r: 3 }} name="O2 Flow" stroke={reviewMetricColor("oxygenFlowRate")} strokeDasharray="7 4" strokeWidth={2.8} type="monotone" yAxisId="rate" />
                  <Line connectNulls dataKey="oxygenSaturation" dot={{ r: 3 }} name="SpO2" stroke={reviewMetricColor("oxygenSaturation")} strokeWidth={3.2} type="monotone" yAxisId="spo2" />
                  <Line connectNulls dataKey="fio2" dot={{ r: 3 }} name="FiO2" stroke={reviewMetricColor("fio2")} strokeDasharray="4 4" strokeWidth={2.8} type="monotone" yAxisId="spo2" />
                </LineChart>
              </ResponsiveContainer>
            </VitalsGraphOneSection>
          )}

          {(!onlySection || onlySection === "Infection") && (
            <VitalsGraphOneSection
              graphOnly={graphOnly}
              legends={[vitalsGraphOneLegend("temperature")]}
              subtitle="Temperature trend with risk markers."
              title="Infection"
            >
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={chartData} margin={{ left: -8, right: 14, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="xLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" minTickGap={26} />
                  <YAxis domain={[34, 42]} tick={{ fontSize: 10 }} width={44} />
                  <Tooltip content={<VitalsGraphOneTooltip />} />
                  <ReferenceArea fill="#16a34a" fillOpacity={0.06} y1={36.1} y2={37.5} />
                  <Line connectNulls dataKey="temperature" dot={{ r: 3 }} name="Temp" stroke={reviewMetricColor("temperature")} strokeWidth={3.2} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </VitalsGraphOneSection>
          )}

          {(!onlySection || onlySection === "Neuro / Pain") && (
            <VitalsGraphOneSection
              graphOnly={graphOnly}
              legends={[
                vitalsGraphOneLegend("consciousnessSedation"),
                vitalsGraphOneLegend("painScore"),
              ]}
              subtitle="GCS plotted below 15 and pain score plotted below 10 with 3-point y-axis intervals."
              title="Neuro / Pain"
            >
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={chartData} margin={{ left: -8, right: 14, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="xLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" minTickGap={26} />
                  <YAxis domain={[0, 15]} tick={{ fontSize: 10 }} ticks={[0, 3, 6, 9, 12, 15]} width={44} />
                  <Tooltip content={<VitalsGraphOneTooltip />} />
                  <Line connectNulls dataKey="consciousnessSedation" dot={{ r: 3 }} name="GCS" stroke={reviewMetricColor("consciousnessSedation")} strokeWidth={3} type="monotone" />
                  <Line connectNulls dataKey="painScore" dot={{ r: 3 }} name="Pain" stroke={reviewMetricColor("painScore")} strokeDasharray="7 4" strokeWidth={2.8} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </VitalsGraphOneSection>
          )}

          {(!onlySection || onlySection === "Glucose") && (
            <VitalsGraphOneSection
              graphOnly={graphOnly}
              legends={[
                vitalsGraphOneLegend("bloodGlucose", "Blood glucose trend (mg/dL)"),
                { active: activeGlucoseGraph === "india", color: "#10b981", description: "Target band 70-140 mg/dL", label: "India graph", onClick: () => setActiveGlucoseGraph("india") },
                { active: activeGlucoseGraph === "foreign", color: "#8b5cf6", description: "Target band 4.4-10 mmol/L", label: "Foreign graph", onClick: () => setActiveGlucoseGraph("foreign") },
              ]}
              subtitle="Blood glucose trend with India and foreign reference legends."
              title="Glucose"
            >
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={chartData} margin={{ left: -8, right: -8, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="xLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" minTickGap={26} />
                  <YAxis domain={activeGlucoseConfig.domain} tick={{ fontSize: 10 }} ticks={activeGlucoseConfig.ticks} width={44} yAxisId={activeGlucoseConfig.yAxisId} />
                  <Tooltip content={<VitalsGraphOneTooltip />} />
                  <ReferenceArea fill={activeGlucoseConfig.color} fillOpacity={0.08} y1={activeGlucoseConfig.min} y2={activeGlucoseConfig.max} yAxisId={activeGlucoseConfig.yAxisId} />
                  <ReferenceLine label={{ value: activeGlucoseConfig.label, fill: activeGlucoseConfig.color, fontSize: 10, position: "insideTopRight" }} stroke={activeGlucoseConfig.color} strokeDasharray="4 4" y={activeGlucoseConfig.max} yAxisId={activeGlucoseConfig.yAxisId} />
                  <Line connectNulls dataKey={activeGlucoseConfig.dataKey} dot={{ r: 3 }} name={activeGlucoseConfig.name} stroke={activeGlucoseConfig.color} strokeWidth={3.2} type="monotone" yAxisId={activeGlucoseConfig.yAxisId} />
                </LineChart>
              </ResponsiveContainer>
            </VitalsGraphOneSection>
          )}

          {(!onlySection || onlySection === "Intake / Output") && (
            <VitalsGraphOneSection
              graphOnly={graphOnly}
              legends={[
                vitalsGraphOneLegend("fluidIntake"),
                vitalsGraphOneLegend("urineOutput"),
              ]}
              subtitle="Hourly intake and urine output trend from rapid review observations."
              title="Intake / Output"
            >
              <ResponsiveContainer height="100%" width="100%">
                <LineChart data={chartData} margin={{ left: -8, right: 14, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="xLabel" tick={{ fontSize: 10 }} interval="preserveStartEnd" minTickGap={26} />
                  <YAxis domain={[0, 180]} tick={{ fontSize: 10 }} width={44} />
                  <Tooltip content={<VitalsGraphOneTooltip />} />
                  <ReferenceArea fill="#16a34a" fillOpacity={0.06} y1={40} y2={120} />
                  <ReferenceLine label={{ value: "Review below 30", fill: "#b91c1c", fontSize: 10, position: "insideTopRight" }} stroke="#dc2626" strokeDasharray="4 4" y={30} />
                  <Line connectNulls dataKey="fluidIntake" dot={{ r: 3 }} name="Intake" stroke={reviewMetricColor("fluidIntake")} strokeDasharray="7 4" strokeWidth={2.8} type="monotone" />
                  <Line connectNulls dataKey="urineOutput" dot={{ r: 3 }} name="Urine" stroke={reviewMetricColor("urineOutput")} strokeWidth={3.2} type="monotone" />
                </LineChart>
              </ResponsiveContainer>
            </VitalsGraphOneSection>
          )}

        </div>
    </>
  );

  if (graphOnly) {
    return <div className="space-y-4">{content}</div>;
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">{content}</CardContent>
    </Card>
  );
}

function VitalsGraphOneSection({
  graphOnly = false,
  title,
  subtitle,
  legends,
  children,
}: {
  graphOnly?: boolean;
  title: string;
  subtitle: string;
  legends: VitalsGraphOneLegend[];
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid overflow-hidden rounded-md border border-border", !graphOnly && "lg:grid-cols-[190px_minmax(0,1fr)]")}>
      {graphOnly ? (
        <div className="border-b border-border bg-surface-muted px-3 py-2">
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        </div>
      ) : null}
      {!graphOnly ? (
        <div className="border-b border-border bg-surface-muted p-4 lg:border-b-0 lg:border-r">
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          <p className="mt-1 text-xs leading-4 text-muted-foreground">{subtitle}</p>
          <div className="mt-4 space-y-2.5">
            {legends.map((legend) => {
              const content = (
                <>
                <span className="mt-0.5 h-4 w-6 shrink-0 rounded-sm border border-slate-900/20 shadow-sm" style={{ backgroundColor: legend.color }} />
                <span className="min-w-0">
                  <span className="block font-semibold text-foreground">{legend.label}</span>
                  <span className="block text-muted-foreground">{legend.description}</span>
                </span>
                </>
              );

              if (legend.onClick) {
                return (
                  <button
                    className={cn(
                      "flex w-full items-start gap-2.5 rounded-lg border p-2 text-left text-xs transition focus:outline-none focus:ring-2 focus:ring-ring/20",
                      legend.active ? "border-primary bg-background shadow-sm" : "border-transparent hover:border-border hover:bg-background/70",
                    )}
                    key={legend.label}
                    onClick={legend.onClick}
                    type="button"
                  >
                    {content}
                  </button>
                );
              }

              return (
                <div className="flex items-start gap-2.5 text-xs" key={legend.label}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      <div className={cn("min-w-0 p-3", graphOnly ? "h-[220px]" : "h-[250px]")}>
        {children}
      </div>
    </div>
  );
}

function VitalsGraphOneTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload?: VitalsGraphOnePoint; name?: string; value?: number | null; color?: string }> }) {
  if (!active) return null;
  const point = payload?.[0]?.payload;
  if (!point) return null;

  return (
    <div className="min-w-[180px] rounded-md border border-border bg-background p-3 text-xs shadow-lg">
      <div className="font-semibold text-foreground">{formatDateLabel(point.date)} - {point.time}</div>
      <div className="mt-2 space-y-1.5">
        {payload?.filter((entry) => entry.value !== null && entry.value !== undefined).map((entry) => (
          <div className="flex items-center justify-between gap-4" key={entry.name}>
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}
            </span>
            <span className="font-semibold text-foreground">{entry.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function vitalsGraphOneLegend(metricId: ReviewGraphMetricId, description?: string): VitalsGraphOneLegend {
  const metric = reviewGraphMetrics.find((item) => item.id === metricId);
  return {
    color: reviewMetricColor(metricId),
    description: description ?? `${metric?.label ?? metricId}${metric?.unit ? ` (${metric.unit})` : ""}`,
    label: metric?.shortLabel ?? metricId,
  };
}

function AllVitalsGraphSections({
  data,
  graphOnly = false,
}: {
  data: CombinedReviewGraphPoint[];
  graphOnly?: boolean;
}) {
  return (
    <div className="space-y-4">
      {allVitalsGraphSections.map((section) => (
        <AllVitalsGraphSectionCard data={data} graphOnly={graphOnly} key={section.title} section={section} />
      ))}
    </div>
  );
}

function DateRangeCalendar({
  startDate,
  endDate,
  minDate,
  maxDate,
  onChange,
}: {
  startDate: string;
  endDate: string;
  minDate?: string;
  maxDate?: string;
  onChange: (startDate: string, endDate: string) => void;
}) {
  const initialDate = endDate || startDate || maxDate || todayDateValue();
  const initialParts = dateValueParts(initialDate);
  const [open, setOpen] = React.useState(false);
  const [visibleMonth, setVisibleMonth] = React.useState(initialParts.month);
  const [visibleYear, setVisibleYear] = React.useState(initialParts.year);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const firstDayOffset = new Date(visibleYear, visibleMonth, 1).getDay();
  const totalDays = new Date(visibleYear, visibleMonth + 1, 0).getDate();
  const displayValue = startDate
    ? `${formatDateLabel(startDate)}${endDate ? ` - ${formatDateLabel(endDate)}` : " - Select end date"}`
    : "Select start and end date";

  React.useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  function moveMonth(direction: -1 | 1) {
    const next = new Date(visibleYear, visibleMonth + direction, 1);
    setVisibleMonth(next.getMonth());
    setVisibleYear(next.getFullYear());
  }

  function selectDate(value: string) {
    if (!startDate || endDate) {
      onChange(value, "");
      return;
    }
    if (value < startDate) {
      onChange(value, startDate);
    } else {
      onChange(startDate, value);
    }
    setOpen(false);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="space-y-1 text-sm">
        <span className="font-medium text-foreground">Date range</span>
        <button
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-left text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <span className={cn(!startDate && "text-muted-foreground")}>{displayValue}</span>
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        </button>
      </label>

      {open ? (
        <div className="absolute left-0 top-full z-50 mt-2 w-[min(100%,360px)] rounded-lg border border-border bg-surface p-3 shadow-soft">
          <div className="flex items-center justify-between gap-2">
            <Button aria-label="Previous month" onClick={() => moveMonth(-1)} size="icon" type="button" variant="ghost">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-semibold text-foreground">{monthNames[visibleMonth]} {visibleYear}</div>
            <Button aria-label="Next month" onClick={() => moveMonth(1)} size="icon" type="button" variant="ghost">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-muted-foreground">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day}>{day}</span>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOffset }).map((_, index) => <span key={`blank-${index}`} />)}
            {Array.from({ length: totalDays }).map((_, index) => {
              const day = index + 1;
              const value = `${visibleYear}-${String(visibleMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const disabled = Boolean((minDate && value < minDate) || (maxDate && value > maxDate));
              const boundary = value === startDate || value === endDate;
              const inRange = Boolean(startDate && endDate && value > startDate && value < endDate);
              return (
                <button
                  className={cn(
                    "h-8 rounded-md text-xs font-medium transition",
                    !disabled && !boundary && !inRange && "hover:bg-surface-muted",
                    inRange && "bg-primary/10 text-primary",
                    boundary && "bg-primary text-primary-foreground",
                    disabled && "cursor-not-allowed text-muted-foreground/35",
                  )}
                  disabled={disabled}
                  key={value}
                  onClick={() => selectDate(value)}
                  type="button"
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <span className="text-xs text-muted-foreground">{startDate && !endDate ? "Now select end date" : "Select start date, then end date"}</span>
            <Button onClick={() => onChange("", "")} size="sm" type="button" variant="ghost">Clear</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function dateValueParts(value: string) {
  const date = new Date(`${value}T00:00:00`);
  const fallback = Number.isNaN(date.getTime()) ? new Date() : date;
  return { month: fallback.getMonth(), year: fallback.getFullYear() };
}

function TimeRangePicker({
  startTime,
  endTime,
  onChange,
}: {
  startTime: string;
  endTime: string;
  onChange: (startTime: string, endTime: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const displayValue = startTime || endTime
    ? `${startTime || "00:00"} - ${endTime || "23:59"}`
    : "Select start and end time";

  React.useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="space-y-1 text-sm">
        <span className="font-medium text-foreground">Time range</span>
        <button
          className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-left text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <span className={cn(!startTime && !endTime && "text-muted-foreground")}>{displayValue}</span>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </button>
      </label>

      {open ? (
        <div className="absolute left-0 top-full z-50 mt-2 w-full min-w-[280px] rounded-lg border border-border bg-surface p-4 shadow-soft">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">Start time</span>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
                onChange={(event) => onChange(event.target.value, endTime)}
                type="time"
                value={startTime}
              />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-medium text-foreground">End time</span>
              <input
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
                onChange={(event) => onChange(startTime, event.target.value)}
                type="time"
                value={endTime}
              />
            </label>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <Button onClick={() => onChange("", "")} size="sm" type="button" variant="ghost">Clear</Button>
            <Button onClick={() => setOpen(false)} size="sm" type="button">Done</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AllVitalsGraphSectionCard({
  section,
  data,
  graphOnly = false,
}: {
  section: AllVitalsGraphSection;
  data: CombinedReviewGraphPoint[];
  graphOnly?: boolean;
}) {
  if (section.metrics.includes("urineOutput")) {
    return <AllVitalsFluidBalanceSectionCard data={data} graphOnly={graphOnly} section={section} />;
  }
  if (section.metrics.includes("bloodGlucose")) {
    return <AllVitalsGlucoseSectionCard data={data} graphOnly={graphOnly} section={section} />;
  }

  const sectionMetrics = section.metrics
    .map((metricId) => reviewGraphMetrics.find((metric) => metric.id === metricId))
    .filter((metric): metric is ReviewGraphMetric => Boolean(metric));
  const yAxisConfig = combinedGraphYAxisConfig(section);
  const graphContent = data.length ? (
    <div className="h-[310px]">
      <ResponsiveContainer height="100%" width="100%">
        <LineChart data={data} margin={{ left: -10, right: 18, top: 12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="xLabel" height={graphOnly ? 12 : undefined} tick={graphOnly ? false : { fontSize: 11 }} interval="preserveStartEnd" minTickGap={24} />
          <YAxis domain={yAxisConfig.domain} ticks={yAxisConfig.ticks} tick={graphOnly ? false : { fontSize: 11 }} width={graphOnly ? 12 : 48} />
          <Tooltip content={<CombinedReviewGraphTooltip />} />
          {graphOnly ? null : <Legend />}
          {sectionMetrics.map((metric) => (
            <Line
              activeDot={(props) => <CombinedReviewGraphDot {...(props as unknown as CombinedReviewGraphDotProps)} active metric={metric} />}
              connectNulls
              dataKey={metric.id}
              dot={(props) => <CombinedReviewGraphDot {...(props as unknown as CombinedReviewGraphDotProps)} metric={metric} />}
              key={metric.id}
              name={metric.shortLabel}
              stroke={reviewMetricColor(metric.id)}
              strokeWidth={metric.id === "bloodPressure" || metric.id === "bloodPressureDiastolic" || metric.id === "oxygenSaturation" ? 2.4 : 2}
              type="monotone"
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <EmptyState icon={BarChart3} title={`${section.title} graph unavailable`} description="No observation data matched the selected date and time filter." />
  );

  if (graphOnly) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          {graphContent}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="grid gap-0 p-0 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="border-b border-border bg-surface-muted p-4 lg:border-b-0 lg:border-r">
          <h3 className="text-2xl font-semibold text-foreground">{section.title}</h3>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{section.description}</p>
          <div className="mt-5">
            <p className="text-sm font-semibold text-foreground">Legend</p>
            <div className="mt-3 space-y-3">
              {sectionMetrics.map((metric) => (
                <div className="flex items-start gap-3 text-sm" key={metric.id}>
                  <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-white shadow-sm" style={{ backgroundColor: reviewMetricColor(metric.id) }} />
                  <span className="min-w-0">
                    <span className="block font-medium text-foreground">{metric.shortLabel}</span>
                    <span className="block text-xs leading-4 text-muted-foreground">{metric.label} {metric.unit ? `(${metric.unit})` : ""}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0 p-4">
          {graphContent}
        </div>
      </CardContent>
    </Card>
  );
}

function AllVitalsGlucoseSectionCard({
  section,
  data,
  graphOnly = false,
}: {
  section: AllVitalsGraphSection;
  data: CombinedReviewGraphPoint[];
  graphOnly?: boolean;
}) {
  const glucoseMetric = reviewGraphMetrics.find((item) => item.id === "bloodGlucose");
  const glucoseStandards = [
    { id: "india", label: "India", min: 70, max: 140, unit: "mg/dL", domain: [0, 300] as [number, number], ticks: [0, 60, 120, 180, 240, 300], color: "#10b981", fill: "#d1fae5", text: "#047857" },
    { id: "foreign", label: "Foreign", min: 4.4, max: 10, unit: "mmol/L", domain: [0, 18] as [number, number], ticks: [0, 3, 6, 9, 12, 15, 18], color: "#8b5cf6", fill: "#ede9fe", text: "#6d28d9" },
  ] as const;
  const [activeStandardId, setActiveStandardId] = React.useState<(typeof glucoseStandards)[number]["id"]>("india");
  const activeStandard = glucoseStandards.find((item) => item.id === activeStandardId) ?? glucoseStandards[0];
  const glucoseData = data.map((point) => {
    const glucoseMgDl = typeof point.bloodGlucose === "number" ? point.bloodGlucose : null;
    if (activeStandard.id === "india" || glucoseMgDl === null) return point;
    const glucoseMmol = mgDlToMmolL(glucoseMgDl);
    return {
      ...point,
      bloodGlucose: glucoseMmol,
      displays: {
        ...point.displays,
        bloodGlucose: `${glucoseMmol.toFixed(1)} mmol/L`,
      },
    };
  });
  const graphContent = data.length ? (
    <div className="h-[310px]">
      <ResponsiveContainer height="100%" width="100%">
        <LineChart data={glucoseData} margin={{ left: -10, right: 18, top: 12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <ReferenceArea fill={activeStandard.color} fillOpacity={0.1} ifOverflow="extendDomain" y1={activeStandard.min} y2={activeStandard.max} />
          <ReferenceLine label={graphOnly ? undefined : { value: `${activeStandard.label} ${activeStandard.min}-${activeStandard.max} ${activeStandard.unit}`, fill: activeStandard.text, fontSize: 10, position: "insideTopRight" }} stroke={activeStandard.color} strokeDasharray="4 4" y={activeStandard.max} />
          <XAxis dataKey="xLabel" height={graphOnly ? 12 : undefined} tick={graphOnly ? false : { fontSize: 11 }} interval="preserveStartEnd" minTickGap={24} />
          <YAxis domain={activeStandard.domain} ticks={activeStandard.ticks} tick={graphOnly ? false : { fontSize: 11 }} width={graphOnly ? 12 : 48} />
          <Tooltip content={<CombinedReviewGraphTooltip />} />
          {graphOnly ? null : <Legend />}
          <Line
            activeDot={(props) => <CombinedReviewGraphDot {...(props as unknown as CombinedReviewGraphDotProps)} active metric={glucoseMetric ?? reviewGraphMetrics[0]} />}
            connectNulls
            dataKey="bloodGlucose"
            dot={(props) => <CombinedReviewGraphDot {...(props as unknown as CombinedReviewGraphDotProps)} metric={glucoseMetric ?? reviewGraphMetrics[0]} />}
            name={glucoseMetric?.shortLabel ?? "Glucose"}
            stroke={reviewMetricColor("bloodGlucose")}
            strokeWidth={2.4}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <EmptyState icon={BarChart3} title={`${section.title} graph unavailable`} description="No observation data matched the selected date and time filter." />
  );

  if (graphOnly) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          {graphContent}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="grid gap-0 p-0 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="border-b border-border bg-surface-muted p-4 lg:border-b-0 lg:border-r">
          <h3 className="text-2xl font-semibold text-foreground">{section.title}</h3>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{section.description}</p>
          <div className="mt-5">
            <p className="text-sm font-semibold text-foreground">Legend</p>
            <div className="mt-3 space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border border-white shadow-sm" style={{ backgroundColor: reviewMetricColor("bloodGlucose") }} />
                <span className="min-w-0">
                  <span className="block font-medium text-foreground">{glucoseMetric?.shortLabel ?? "Glucose"}</span>
                  <span className="block text-xs leading-4 text-muted-foreground">Blood glucose trend ({activeStandard.unit})</span>
                </span>
              </div>
              {glucoseStandards.map((standard) => {
                const active = standard.id === activeStandard.id;
                return (
                  <button
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border p-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-ring/20",
                      active ? "border-primary bg-white shadow-sm" : "border-border bg-transparent hover:bg-white/70",
                    )}
                    key={standard.id}
                    onClick={() => setActiveStandardId(standard.id)}
                    type="button"
                  >
                    <span className="mt-1 h-3 w-6 shrink-0 rounded-sm border" style={{ backgroundColor: standard.fill, borderColor: standard.color }} />
                    <span className="min-w-0">
                      <span className="block font-medium text-foreground">{standard.label} graph</span>
                      <span className="block text-xs leading-4 text-muted-foreground">Target band {standard.min}-{standard.max} {standard.unit}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="min-w-0 p-4">
          {graphContent}
        </div>
      </CardContent>
    </Card>
  );
}

function AllVitalsFluidBalanceSectionCard({
  section,
  data,
  graphOnly = false,
}: {
  section: AllVitalsGraphSection;
  data: CombinedReviewGraphPoint[];
  graphOnly?: boolean;
}) {
  const intakeMetric = reviewGraphMetrics.find((item) => item.id === "fluidIntake");
  const outputMetric = reviewGraphMetrics.find((item) => item.id === "urineOutput");
  const graphContent = data.length ? (
    <RapidReviewIntakeOutputGraph data={data} showLabels={!graphOnly} />
  ) : (
    <EmptyState icon={BarChart3} title={`${section.title} graph unavailable`} description="No observation data matched the selected date and time filter." />
  );

  if (graphOnly) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          {graphContent}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="grid gap-0 p-0 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="border-b border-border bg-surface-muted p-4 lg:border-b-0 lg:border-r">
          <h3 className="text-2xl font-semibold text-foreground">{section.title}</h3>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{section.description}</p>
          <div className="mt-5">
            <p className="text-sm font-semibold text-foreground">Legend</p>
            <div className="mt-3 space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border border-white bg-sky-500 shadow-sm" />
                <span className="min-w-0">
                  <span className="block font-medium text-foreground">{intakeMetric?.shortLabel ?? "Intake"}</span>
                  <span className="block text-xs leading-4 text-muted-foreground">Fluid intake above baseline ({intakeMetric?.unit ?? "ml/hr"})</span>
                </span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 h-4 w-4 shrink-0 rounded-sm border border-white bg-emerald-500 shadow-sm" />
                <span className="min-w-0">
                  <span className="block font-medium text-foreground">{outputMetric?.shortLabel ?? "Output"}</span>
                  <span className="block text-xs leading-4 text-muted-foreground">Urine output below baseline ({outputMetric?.unit ?? "ml/hr"})</span>
                </span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <span className="mt-2 h-0 w-8 shrink-0 border-t border-dashed border-slate-400" />
                <span className="min-w-0">
                  <span className="block font-medium text-foreground">Baseline</span>
                  <span className="block text-xs leading-4 text-muted-foreground">Zero reference line</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="min-w-0 p-4">
          {graphContent}
        </div>
      </CardContent>
    </Card>
  );
}

function RapidReviewIntakeOutputGraph({ data, showLabels = true }: { data: CombinedReviewGraphPoint[]; showLabels?: boolean }) {
  const width = Math.max(640, data.length * 56);
  const height = 260;
  const pad = 34;
  const labelSpace = 24;
  const baseline = Math.round((height - labelSpace) / 2);
  const plotWidth = width - pad * 2;
  const intakePlotHeight = baseline - pad - 10;
  const outputPlotHeight = height - labelSpace - baseline - 10;
  const intakeValues = data.map((point) => parseObservationNumber(String(point.displays.fluidIntake ?? "")) ?? 0);
  const outputValues = data.map((point) => parseObservationNumber(String(point.displays.urineOutput ?? "")) ?? 0);
  const maxVolume = Math.max(40, ...intakeValues, ...outputValues);

  return (
    <div className="overflow-x-auto rounded-md border border-border bg-background p-3">
      <svg className="block" height={height} role="img" viewBox={`0 0 ${width} ${height}`} width={width}>
        <line stroke="#cbd5e1" strokeDasharray="4 4" x1={pad} x2={width - pad} y1={baseline} y2={baseline} />
        {data.map((point, index) => {
          const x = pad + (data.length <= 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth);
          const intake = intakeValues[index] ?? 0;
          const output = outputValues[index] ?? 0;
          const intakeHeight = intake > 0 ? Math.max(4, (intake / maxVolume) * intakePlotHeight) : 0;
          const outputHeight = output > 0 ? Math.max(4, (output / maxVolume) * outputPlotHeight) : 0;
          const risk = point.risks.urineOutput ?? "empty";
          const palette = adultObservationRiskPalette[risk];
          return (
            <g key={`${point.date}-${point.time}-${index}`}>
              <rect fill="#0ea5e9" height={intakeHeight} rx="4" width="16" x={x - 20} y={baseline - intakeHeight} />
              <rect fill="#10b981" height={outputHeight} rx="4" width="16" x={x + 4} y={baseline} />
              <circle cx={x} cy={baseline + outputHeight + 7} fill={palette.background} r="4" stroke={palette.text} strokeWidth="1.5" />
              {showLabels ? <text fill="#475569" fontSize="10" textAnchor="middle" x={x} y={height - 8}>{point.time}</text> : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

type CombinedReviewGraphTooltipEntry = {
  color?: string;
  dataKey?: string | number;
  name?: string;
  payload?: CombinedReviewGraphPoint;
  value?: number | null;
};

function CombinedReviewGraphTooltip({ active, payload }: { active?: boolean; payload?: CombinedReviewGraphTooltipEntry[] }) {
  if (!active) return null;
  const point = payload?.[0]?.payload;
  if (!point) return null;
  const visibleEntries = (payload ?? []).filter((entry) => typeof entry.value === "number");

  return (
    <div className="max-h-[360px] min-w-[260px] overflow-auto rounded-md border border-border bg-background p-3 text-xs shadow-lg">
      <div className="font-semibold text-foreground">{formatDateLabel(point.date)} - {point.time}</div>
      <div className="mt-2 space-y-1">
        {visibleEntries.map((entry) => {
          const metricId = String(entry.dataKey) as ReviewGraphMetricId;
          const metric = reviewGraphMetrics.find((item) => item.id === metricId);
          if (!metric) return null;
          const risk = point.risks[metric.id] ?? "empty";
          const palette = adultObservationRiskPalette[risk];
          return (
            <div className="flex items-center justify-between gap-4" key={metric.id}>
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                {metric.shortLabel}
              </span>
              <span className="font-semibold text-foreground">{point.displays[metric.id] ?? "--"}</span>
              <span className="rounded-full border px-2 py-0.5 font-medium" style={{ backgroundColor: palette.background, borderColor: palette.border, color: palette.text }}>
                {palette.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type CombinedReviewGraphDotProps = {
  active?: boolean;
  cx?: number;
  cy?: number;
  metric: ReviewGraphMetric;
  payload?: CombinedReviewGraphPoint;
  stroke?: string;
  value?: number | null;
};

function CombinedReviewGraphDot({ active, cx, cy, metric, payload, stroke, value }: CombinedReviewGraphDotProps) {
  const metricValue = typeof value === "number" ? value : payload?.[metric.id];
  if (typeof cx !== "number" || typeof cy !== "number" || typeof metricValue !== "number") return null;

  const risk = payload?.risks[metric.id] ?? "empty";
  const palette = adultObservationRiskPalette[risk];
  return (
    <circle
      cx={cx}
      cy={cy}
      fill={stroke ?? palette.text}
      r={active ? 5 : 3.2}
      stroke={palette.text}
      strokeWidth={active ? 2.4 : 1.8}
    />
  );
}

function GraphStatCard({
  label,
  value,
  context,
  tone,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  context: string;
  tone: StatusTone;
  icon: typeof Activity;
}) {
  return (
    <Card className="min-h-[116px] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="mt-2 truncate text-2xl font-semibold tracking-tight text-foreground">{value}</div>
        </div>
        <div className="rounded-md border border-border bg-surface-muted p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="mt-4">
        <StatusPill tone={tone}>{context}</StatusPill>
      </div>
    </Card>
  );
}

function buildVitalsGraphOneData(data: CombinedReviewGraphPoint[]): VitalsGraphOnePoint[] {
  return data.slice(-14).map((point) => ({
    date: point.date,
    time: point.time,
    xLabel: `${formatDateShortLabel(point.date)} ${point.time}`,
    pulseRate: parseObservationNumber(point.displays.pulseRate ?? ""),
    monitorHeartRate: parseObservationNumber(point.displays.monitorHeartRate ?? ""),
    bloodPressure: systolicValue(point.displays.bloodPressure ?? ""),
    bloodPressureDiastolic: diastolicValue(point.displays.bloodPressure ?? ""),
    respiratoryRate: parseObservationNumber(point.displays.respiratoryRate ?? ""),
    oxygenSaturation: parseObservationNumber(point.displays.oxygenSaturation ?? ""),
    oxygenFlowRate: oxygenFlowValue(point.displays.oxygenFlowRate ?? ""),
    fio2: parseObservationNumber(point.displays.fio2 ?? ""),
    temperature: parseObservationNumber(point.displays.temperature ?? ""),
    consciousnessSedation: parseObservationNumber(point.displays.consciousnessSedation ?? ""),
    painScore: parseObservationNumber(point.displays.painScore ?? ""),
    bloodGlucose: parseObservationNumber(point.displays.bloodGlucose ?? ""),
    bloodGlucoseForeign: typeof point.bloodGlucose === "number" ? mgDlToMmolL(point.bloodGlucose) : null,
    fluidIntake: parseObservationNumber(point.displays.fluidIntake ?? ""),
    urineOutput: parseObservationNumber(point.displays.urineOutput ?? ""),
    displays: point.displays,
    risks: point.risks,
  }));
}

function reviewMetricColor(metricId: ReviewGraphMetricId) {
  return reviewMetricColors[metricId];
}

function combinedGraphYAxisConfig(section: AllVitalsGraphSection): { domain: [number, number]; ticks?: number[] } {
  if (section.title === "Neuro / Pain") return { domain: [0, 18], ticks: [0, 3, 6, 9, 12, 15] };
  return { domain: [0, 100] };
}

function metricRiskLevel(metric: ReviewGraphMetric, observation: RapidObservationSet) {
  if (metric.riskExtractor) return metric.riskExtractor(observation);
  const value = metric.extractor(observation);
  const displayValue = metric.display(observation);
  return getRiskLevel(metric.vitalType, metric.vitalType === "pulseRhythm" ? displayValue : value ?? displayValue);
}

function urineOutputRiskLevel(value: string | number | null | undefined): AdultObservationRiskLevel {
  const numericValue = typeof value === "number" ? value : parseObservationNumber(String(value ?? ""));
  if (numericValue === null) return "empty";
  if (numericValue < 15) return "critical";
  if (numericValue < 30) return "highRisk";
  if (numericValue < 40) return "warning";
  return "normal";
}

function glucoseRiskLevel(value: number | null): AdultObservationRiskLevel {
  if (value === null) return "empty";
  if (value <= 54 || value >= 300) return "critical";
  if (value < 70 || value > 250) return "highRisk";
  if (value > 180) return "warning";
  return "normal";
}

function bloodGlucoseValue(observation: RapidObservationSet) {
  const painScore = parseObservationNumber(observation.painScore) ?? 3;
  const temperature = parseObservationNumber(observation.temperature) ?? 36.8;
  const oxygenLoad = oxygenFlowValue(observation.oxygenFlow) ?? 0;
  const minutes = observationTimeMinutes(observation) ?? 0;
  const hour = Math.floor(minutes / 60);
  const mealLoad = hour >= 7 && hour <= 9 ? 18 : hour >= 12 && hour <= 14 ? 28 : hour >= 18 && hour <= 20 ? 24 : 0;
  const responseLoad = observation.responseLevel === "MER Call" ? 68 : observation.responseLevel === "MDT Review" ? 42 : observation.responseLevel === "RN Review" ? 24 : 8;
  const feverLoad = temperature > 38 ? 22 : temperature > 37.5 ? 12 : 0;
  const glucose = 82 + responseLoad + mealLoad + painScore * 5 + oxygenLoad * 3 + feverLoad;
  return Math.round(Math.max(62, Math.min(320, glucose)));
}

function mgDlToMmolL(value: number) {
  return value / 18;
}

function rapidReviewFluidIntakeValue(observation: RapidObservationSet) {
  const urine = parseObservationNumber(observation.urineOutput);
  if (urine === null) return null;
  const oxygenFlow = oxygenFlowValue(observation.oxygenFlow) ?? 0;
  const painScore = parseObservationNumber(observation.painScore) ?? 0;
  const minutes = observationTimeMinutes(observation) ?? 0;
  const hourFactor = (Math.floor(minutes / 60) % 4) * 8;
  const riskLoad = observation.responseLevel === "MER Call" ? 48 : observation.responseLevel === "MDT Review" ? 34 : observation.responseLevel === "RN Review" ? 20 : 8;
  const renalGuard = urine < 30 ? 12 : urine < 40 ? 22 : 34;
  return Math.round(Math.min(160, Math.max(35, renalGuard + riskLoad + hourFactor + oxygenFlow * 4 + painScore * 2)));
}

function buildReviewGraphData(observations: RapidObservationSet[], metric: ReviewGraphMetric): ReviewGraphPoint[] {
  return observations.map((observation) => {
    const value = metric.extractor(observation);
    const displayValue = metric.display(observation);
    const date = observationDateValue(observation);
    const time = observationTimeLabel(observation);
    return {
      date,
      hour: observationHourKey(observation),
      time,
      xLabel: `${formatDateShortLabel(date)} ${time}`,
      value,
      displayValue,
      fio2: fio2Value(observation),
      risk: metricRiskLevel(metric, observation),
    };
  });
}

function buildReviewGraphSummary(observations: RapidObservationSet[], metric: ReviewGraphMetric) {
  return observations.reduce(
    (summary, observation) => {
      const risk = metricRiskLevel(metric, observation);
      summary.totalEntries += 1;
      if (risk === "critical") summary.criticalCount += 1;
      if (risk === "highRisk") summary.highRiskCount += 1;
      return summary;
    },
    { criticalCount: 0, highRiskCount: 0, totalEntries: 0 },
  );
}

function buildCombinedReviewGraphData(observations: RapidObservationSet[]): CombinedReviewGraphPoint[] {
  return observations.map((observation) => {
    const date = observationDateValue(observation);
    const time = observationTimeLabel(observation);
    const point: CombinedReviewGraphPoint = {
      date,
      time,
      xLabel: `${formatDateShortLabel(date)} ${time}`,
      displays: {},
      risks: {},
    };

    reviewGraphMetrics.forEach((metric) => {
      const rawValue = metric.extractor(observation);
      const displayValue = metric.display(observation);
      const risk = metricRiskLevel(metric, observation);
      point[metric.id] = normalizeReviewGraphValue(metric.id, rawValue);
      point.displays[metric.id] = displayValue;
      point.risks[metric.id] = risk;
    });

    return point;
  });
}

function buildCombinedReviewGraphSummary(observations: RapidObservationSet[]) {
  return observations.reduce(
    (summary, observation) => {
      summary.totalEntries += 1;
      reviewGraphMetrics.forEach((metric) => {
        const risk = metricRiskLevel(metric, observation);
        if (risk === "critical") summary.criticalCount += 1;
        if (risk === "highRisk") summary.highRiskCount += 1;
      });
      return summary;
    },
    { criticalCount: 0, highRiskCount: 0, totalEntries: 0 },
  );
}

function uniqueObservationDates(observations: RapidObservationSet[]) {
  return Array.from(new Set(observations.map((observation) => observationDateValue(observation)))).sort((a, b) => b.localeCompare(a));
}

function observationMatchesDateFilter(
  observation: RapidObservationSet,
  mode: string,
  singleDate: string,
  dateFrom: string,
  dateTo: string,
  latestDataDate: string,
) {
  const date = observationDateValue(observation);
  const today = todayDateValue();
  if (mode === "All dates") return true;
  if (mode === "Latest record date") return Boolean(latestDataDate) && date === latestDataDate;
  if (mode === "Today") return date === today;
  if (mode === "Yesterday") return date === addDaysToDateValue(today, -1);
  if (mode === "Last 7 days") return date >= addDaysToDateValue(today, -6) && date <= today;
  if (mode === "Last 30 days") return date >= addDaysToDateValue(today, -29) && date <= today;
  if (mode === "Single date") return singleDate ? date === singleDate : true;
  if (mode === "Custom range") {
    if (dateFrom && dateTo && dateFrom > dateTo) return false;
    return (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo);
  }
  return true;
}

function observationMatchesTimeFilter(observation: RapidObservationSet, mode: string, timeFrom: string, timeTo: string) {
  const minutes = observationTimeMinutes(observation);
  if (minutes === null) return true;
  if (mode === "All times") return true;
  if (mode === "Morning 06-13") return minutesWithinRange(minutes, 6 * 60, 13 * 60 + 59);
  if (mode === "Afternoon 14-17") return minutesWithinRange(minutes, 14 * 60, 17 * 60 + 59);
  if (mode === "Evening 18-21") return minutesWithinRange(minutes, 18 * 60, 21 * 60 + 59);
  if (mode === "Night 22-05") return minutesWithinRange(minutes, 22 * 60, 5 * 60 + 59);
  if (mode === "Business hours") return minutesWithinRange(minutes, 9 * 60, 17 * 60 + 59);
  if (mode === "Custom time range") {
    const from = timeToMinutes(timeFrom);
    const to = timeToMinutes(timeTo);
    if (from === null && to === null) return true;
    if (from !== null && to === null) return minutes >= from;
    if (from === null && to !== null) return minutes <= to;
    if (from === to) return true;
    return minutesWithinRange(minutes, from ?? 0, to ?? 0);
  }
  return true;
}

function graphPointMatchesTimeInterval(point: CombinedReviewGraphPoint, interval: string, timeFrom: string, timeTo: string, latestDateTime: number) {
  const rollingHours = rollingTimeIntervalHours(interval);
  if (rollingHours) {
    const pointDateTime = graphPointDateTimeValue(point);
    if (!Number.isFinite(pointDateTime) || !Number.isFinite(latestDateTime)) return true;
    return pointDateTime >= latestDateTime - rollingHours * 60 * 60 * 1000 && pointDateTime <= latestDateTime;
  }

  const minutes = timeToMinutes(point.time);
  if (minutes === null || interval === "All times") return true;
  if (interval === "Morning 06-13") return minutesWithinRange(minutes, 6 * 60, 13 * 60 + 59);
  if (interval === "Afternoon 14-17") return minutesWithinRange(minutes, 14 * 60, 17 * 60 + 59);
  if (interval === "Evening 18-21") return minutesWithinRange(minutes, 18 * 60, 21 * 60 + 59);
  if (interval === "Night 22-05") return minutesWithinRange(minutes, 22 * 60, 5 * 60 + 59);
  if (interval === "Business hours") return minutesWithinRange(minutes, 9 * 60, 17 * 60 + 59);
  if (interval === "Custom time range") {
    const from = timeToMinutes(timeFrom);
    const to = timeToMinutes(timeTo);
    if (from === null && to === null) return true;
    if (from !== null && to === null) return minutes >= from;
    if (from === null && to !== null) return minutes <= to;
    if (from === to) return true;
    return minutesWithinRange(minutes, from ?? 0, to ?? 0);
  }
  return true;
}

function rollingTimeIntervalHours(interval: string) {
  const match = interval.match(/^Last (3|6|12|24|48) hours$/);
  return match ? Number(match[1]) : null;
}

function graphPointDateTimeValue(point: Pick<CombinedReviewGraphPoint, "date" | "time">) {
  const value = new Date(`${point.date}T${point.time}:00`).getTime();
  return Number.isFinite(value) ? value : Number.NaN;
}

function formatGraphPointDateTime(value: number) {
  const date = new Date(value);
  return `${formatDateLabel(dateToValue(date))} ${date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })}`;
}

function dateFilterSummary(mode: string, singleDate: string, dateFrom: string, dateTo: string, latestDataDate: string) {
  if (mode === "Latest record date") return latestDataDate ? formatDateLabel(latestDataDate) : "Latest record date";
  if (mode === "Single date") return singleDate ? formatDateLabel(singleDate) : "Single date";
  if (mode === "Custom range") {
    if (dateFrom && dateTo && dateFrom > dateTo) return "Invalid date range";
    if (dateFrom && dateTo) return `${formatDateLabel(dateFrom)} to ${formatDateLabel(dateTo)}`;
    if (dateFrom) return `From ${formatDateLabel(dateFrom)}`;
    if (dateTo) return `Until ${formatDateLabel(dateTo)}`;
    return "Custom range";
  }
  return mode;
}

function timeFilterSummary(mode: string, timeFrom: string, timeTo: string) {
  if (mode === "Custom time range") {
    if (timeFrom && timeTo) return `${timeFrom} to ${timeTo}`;
    if (timeFrom) return `From ${timeFrom}`;
    if (timeTo) return `Until ${timeTo}`;
    return "Custom time range";
  }
  return mode;
}

function latestAvailableDate(dates: string[]) {
  return dates[0] ?? "";
}

function observationDateValue(observation: RapidObservationSet) {
  return observation.observationDate ?? "2026-05-24";
}

function observationTimeLabel(observation: RapidObservationSet) {
  const match = observation.recordedAt.match(/(\d{1,2}:\d{2})/);
  return match?.[1] ?? observation.recordedAt.replace("Today ", "");
}

function formatDateLabel(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = Number(match[2]) - 1;
  return `${Number(match[3])} ${monthNames[monthIndex] ?? match[2]} ${match[1]}`;
}

function formatDateShortLabel(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;
  return `${Number(match[3])}/${match[2]}`;
}

function observationDateTimeSortValue(observation: RapidObservationSet) {
  return `${observationDateValue(observation)} ${observationTimeLabel(observation)}`;
}

function todayDateValue() {
  return dateToValue(new Date());
}

function addDaysToDateValue(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  return dateToValue(date);
}

function dateToValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function observationTimeMinutes(observation: RapidObservationSet) {
  return timeToMinutes(observationTimeLabel(observation));
}

function timeToMinutes(value: string) {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function minutesWithinRange(value: number, from: number, to: number) {
  if (from <= to) return value >= from && value <= to;
  return value >= from || value <= to;
}

function observationHourKey(observation: RapidObservationSet) {
  const hour = Number.parseInt(observationTimeLabel(observation).split(":")[0] ?? "", 10);
  return Number.isFinite(hour) ? `${hour.toString().padStart(2, "0")}:00` : "00:00";
}

function parseObservationNumber(value: string) {
  const match = value.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function gcsGraphValue(value: string) {
  const consciousnessScore = parseObservationNumber(value);
  if (consciousnessScore === null) return null;
  return Math.max(3, Math.min(15, 15 - consciousnessScore));
}

function systolicValue(value: string) {
  const systolic = Number.parseFloat(value.split("/")[0] ?? "");
  return Number.isFinite(systolic) ? systolic : null;
}

function diastolicValue(value: string) {
  const diastolic = Number.parseFloat(value.split("/")[1] ?? "");
  return Number.isFinite(diastolic) ? diastolic : null;
}

function diastolicRiskLevel(value: string): AdultObservationRiskLevel {
  const diastolic = diastolicValue(value);
  if (diastolic === null) return "empty";
  if (diastolic >= 120 || diastolic <= 40) return "critical";
  if ((diastolic >= 100 && diastolic <= 119) || (diastolic >= 41 && diastolic <= 49)) return "highRisk";
  if ((diastolic >= 90 && diastolic <= 99) || (diastolic >= 50 && diastolic <= 59)) return "warning";
  return "normal";
}

function oxygenFlowValue(value: string) {
  const lower = value.toLowerCase();
  if (lower === "air" || lower.includes("room air")) return 0;
  return parseObservationNumber(value);
}

function normalizeReviewGraphValue(metricId: ReviewGraphMetricId, value: number | null) {
  if (value === null) return null;
  if (metricId === "respiratoryRate") return scaleToPercent(value, 8, 40);
  if (metricId === "oxygenSaturation") return scaleToPercent(value, 80, 100);
  if (metricId === "oxygenFlowRate") return scaleToPercent(value, 0, 15);
  if (metricId === "fio2") return scaleToPercent(value, 21, 100);
  if (metricId === "bloodPressure") return scaleToPercent(value, 70, 220);
  if (metricId === "bloodPressureDiastolic") return scaleToPercent(value, 40, 130);
  if (metricId === "pulseRate" || metricId === "monitorHeartRate") return scaleToPercent(value, 40, 180);
  if (metricId === "temperature") return scaleToPercent(value, 34, 42);
  if (metricId === "consciousnessSedation" || metricId === "painScore") return value;
  if (metricId === "bloodGlucose") return value;
  if (metricId === "fluidIntake") return scaleToPercent(value, 0, 180);
  if (metricId === "urineOutput") return scaleToPercent(value, 0, 100);
  return value;
}

function scaleToPercent(value: number, min: number, max: number) {
  if (max <= min) return value;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

function fio2Value(observation: RapidObservationSet) {
  return observation.fio2 ?? inferFio2FromOxygenSupport(observation.oxygenFlow, observation.deliveryMethod);
}

function monitorHeartRateValue(observation: RapidObservationSet) {
  return observation.monitorHeartRate?.trim() ? observation.monitorHeartRate : observation.pulse;
}

function riskCellStyle(risk: AdultObservationRiskLevel): React.CSSProperties {
  const palette = adultObservationRiskPalette[risk];
  return {
    backgroundColor: palette.background,
    color: palette.text,
  };
}

function riskBadgeTone(risk: AdultObservationRiskLevel): StatusTone {
  if (risk === "critical") return "critical";
  if (risk === "highRisk") return "danger";
  if (risk === "warning") return "warning";
  if (risk === "normal") return "success";
  return "muted";
}
