"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type Table,
} from "@tanstack/react-table";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Eye,
  FlaskConical,
  FileText,
  Layers3,
  Image as ImageIcon,
  LayoutGrid,
  MoreVertical,
  Printer,
  Search,
  ScanSearch,
  Settings,
  ShieldCheck,
  X,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ResultDownloadDialog } from "@/features/diagnostics/results/components/ResultDownloadDialog";
import { ResultsGroupDownloadDialog } from "@/features/diagnostics/results/components/ResultsGroupDownloadDialog";
import { resultDepartments, resultRecords, resultStatuses } from "@/features/diagnostics/results/data/mockSidebarResults";
import type { ResultDepartment, ResultRecord, ResultStatus } from "@/features/diagnostics/results/types";

type DepartmentFilter = ResultDepartment | "all";
type StatusFilter = ResultStatus | "all";
type DateFilter = "all" | "today" | "yesterday" | "custom";
type AvailabilityFilter = "all" | "reports" | "images";
type PreviewMode = "summary" | "report" | "image" | "audit";
type QuickQueue = "pending" | "emergency" | null;
type HistoryQuickView = "today" | "yesterday" | null;
export type ResultsPatientContext = {
  ageSex?: string;
  name?: string;
  mrn?: string;
  uhid?: string;
  wardBed?: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-IN", {
  hour: "2-digit",
  minute: "2-digit",
});

const monthFormatter = new Intl.DateTimeFormat("en-IN", {
  month: "long",
  year: "numeric",
});

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const statusTone: Record<ResultStatus, "success" | "warning" | "info" | "critical"> = {
  "Sample Collected": "info",
  Processing: "warning",
  "Verification Pending": "warning",
  Completed: "success",
  Critical: "critical",
};

const priorityTone: Record<ResultRecord["priority"], "success" | "warning" | "critical"> = {
  Routine: "success",
  Urgent: "warning",
  Emergency: "critical",
};

function formatDateTime(value?: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  return `${dateFormatter.format(date)}, ${timeFormatter.format(date)}`;
}

function getDateKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function getLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isValidDateKey(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && getLocalDateKey(date) === value;
}

function shiftDateKey(dateKey: string, offsetDays: number) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function formatDateKeyLabel(dateKey: string) {
  return dateFormatter.format(new Date(`${dateKey}T00:00:00`));
}

function getDepartmentLabel(department: DepartmentFilter) {
  return resultDepartments.find((item) => item.id === department)?.label ?? "All Results";
}

function getStatusLabel(status: StatusFilter) {
  return status === "all" ? "All statuses" : status;
}

function getPatientInitials(patientName: string) {
  return patientName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getStatusIcon(status: StatusFilter) {
  if (status === "all") {
    return <LayoutGrid className="h-4 w-4 text-primary" />;
  }

  if (status === "Sample Collected") {
    return <FlaskConical className="h-4 w-4 text-slate-500" />;
  }

  if (status === "Processing") {
    return <Settings className="h-4 w-4 text-slate-500" />;
  }

  if (status === "Verification Pending") {
    return <Clock3 className="h-4 w-4 text-slate-500" />;
  }

  if (status === "Completed") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
  }

  return <ShieldCheck className="h-4 w-4 text-rose-500" />;
}

function getNextLaboratoryStatus(status: ResultStatus) {
  if (status === "Sample Collected") {
    return "Processing";
  }

  if (status === "Processing") {
    return "Verification Pending";
  }

  if (status === "Verification Pending") {
    return "Completed";
  }

  return null;
}

function getLaboratoryActionLabel(status: ResultStatus) {
  if (status === "Sample Collected") {
    return "Start Processing";
  }

  if (status === "Processing") {
    return "Send for Verification";
  }

  if (status === "Verification Pending") {
    return "Complete Report";
  }

  return "Workflow Complete";
}

export function ResultsSidebarView({
  initialDepartment = "all",
  defaultDepartment = initialDepartment,
  criticalOnly = false,
  patientContext,
}: {
  initialDepartment?: DepartmentFilter;
  defaultDepartment?: DepartmentFilter;
  criticalOnly?: boolean;
  patientContext?: ResultsPatientContext;
  viewTitle?: string;
  viewDescription?: string;
}) {
  const isDepartmentLocked = initialDepartment !== "all";
  const [department, setDepartment] = useState<DepartmentFilter>(defaultDepartment);
  const [status, setStatus] = useState<StatusFilter>(criticalOnly ? "Critical" : "all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [customResultDate, setCustomResultDate] = useState("");
  const [availability, setAvailability] = useState<AvailabilityFilter>("all");
  const [quickQueue, setQuickQueue] = useState<QuickQueue>(null);
  const [query, setQuery] = useState("");
  const [isCommandSearchFocused, setIsCommandSearchFocused] = useState(false);
  const [selectedId, setSelectedId] = useState(resultRecords[0]?.id ?? "");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("summary");
  const [isResultDetailsOpen, setIsResultDetailsOpen] = useState(false);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, ResultStatus>>({});
  const [reportReadyIds, setReportReadyIds] = useState<string[]>([]);
  const [acknowledgedIds, setAcknowledgedIds] = useState<string[]>([]);
  const [ackNote, setAckNote] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [downloadGroup, setDownloadGroup] = useState<{ title: string; results: ResultRecord[] } | null>(null);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [historyQuickView, setHistoryQuickView] = useState<HistoryQuickView>(null);
  const [isCustomDateDialogOpen, setIsCustomDateDialogOpen] = useState(false);
  const [isDateWiseHistoryOpen, setIsDateWiseHistoryOpen] = useState(false);
  const [dateWiseHistoryDate, setDateWiseHistoryDate] = useState("");
  const [historyPagination, setHistoryPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 4 });
  const [dateWisePagination, setDateWisePagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 5 });

  const isLaboratoryView = initialDepartment === "laboratory";
  const isUnifiedView = initialDepartment === "all" && !criticalOnly;
  const patientScopedRecords = useMemo(() => {
    if (!patientContext?.mrn && !patientContext?.name) {
      return resultRecords;
    }

    const normalizedName = patientContext.name?.trim().toLowerCase();

    return resultRecords
      .filter((result) => {
        const matchesMrn = patientContext.mrn ? result.mrn === patientContext.mrn : false;
        const matchesName = normalizedName ? result.patientName.toLowerCase() === normalizedName : false;
        return matchesMrn || matchesName;
      })
      .map((result) => ({
        ...result,
        ageSex: patientContext.ageSex ?? result.ageSex,
        mrn: patientContext.uhid ?? result.mrn,
        patientName: patientContext.name ?? result.patientName,
      }));
  }, [patientContext?.ageSex, patientContext?.mrn, patientContext?.name, patientContext?.uhid]);

  const recordsWithState = useMemo(
    () =>
      patientScopedRecords.map((result) => {
        const statusValue = statusOverrides[result.id] ?? result.status;
        const reportAvailable = result.reportAvailable || reportReadyIds.includes(result.id) || (result.department === "laboratory" && statusValue === "Completed");

        return {
          ...result,
          status: statusValue,
          reportAvailable,
        };
      }),
    [patientScopedRecords, reportReadyIds, statusOverrides],
  );

  const scopedRecords = useMemo(() => {
    return recordsWithState.filter((result) => {
      if (criticalOnly) {
        return result.status === "Critical";
      }

      if (initialDepartment !== "all") {
        return result.department === initialDepartment;
      }

      return true;
    });
  }, [criticalOnly, initialDepartment, recordsWithState]);

  const latestResultDateKey = useMemo(() => {
    return scopedRecords
      .map((result) => getDateKey(result.orderedAt))
      .sort((first, second) => second.localeCompare(first))[0] ?? null;
  }, [scopedRecords]);

  const previousResultDateKey = latestResultDateKey ? shiftDateKey(latestResultDateKey, -1) : null;

  const filteredResults = useMemo(() => {
    const search = query.trim().toLowerCase();

    return recordsWithState.filter((result) => {
      const matchesDepartment = department === "all" || result.department === department;
      const matchesStatus = status === "all" || result.status === status;
      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "today" && getDateKey(result.orderedAt) === latestResultDateKey) ||
        (dateFilter === "yesterday" && getDateKey(result.orderedAt) === previousResultDateKey) ||
        (dateFilter === "custom" && (!customResultDate || getDateKey(result.orderedAt) === customResultDate));
      const matchesAvailability = availability === "all" || (availability === "reports" ? result.reportAvailable : result.imageAvailable);
      const matchesQuickQueue =
        quickQueue === null ||
        (quickQueue === "pending" && (result.status === "Sample Collected" || result.status === "Processing" || result.status === "Verification Pending")) ||
        (quickQueue === "emergency" && (result.priority === "Emergency" || result.status === "Critical"));
      const matchesLockedDepartment = !isDepartmentLocked || result.department === initialDepartment;
      const matchesCriticalMode = !criticalOnly || result.status === "Critical";
      const matchesSearch =
        !search ||
        [result.patientName, result.mrn, result.id, result.testName, result.orderingDoctor, result.accessionNo, result.location]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(search));

      return matchesDepartment && matchesStatus && matchesDate && matchesAvailability && matchesQuickQueue && matchesLockedDepartment && matchesCriticalMode && matchesSearch;
    });
  }, [availability, criticalOnly, customResultDate, dateFilter, department, initialDepartment, isDepartmentLocked, latestResultDateKey, previousResultDateKey, query, quickQueue, recordsWithState, status]);

  const selectedResult = useMemo(() => {
    return filteredResults.find((result) => result.id === selectedId) ?? filteredResults[0] ?? null;
  }, [filteredResults, selectedId]);

  const shouldSplitResultHistory =
    isUnifiedView &&
    department === "all" &&
    status === "all" &&
    dateFilter === "all" &&
    availability === "all" &&
    quickQueue === null &&
    query.trim().length === 0;

  const activeQueueDateKey = useMemo(() => {
    if (!shouldSplitResultHistory || filteredResults.length === 0) {
      return null;
    }

    return filteredResults
      .map((result) => getDateKey(result.orderedAt))
      .sort((first, second) => second.localeCompare(first))[0];
  }, [filteredResults, shouldSplitResultHistory]);

  const sameDateResults = useMemo(() => {
    if (!activeQueueDateKey) {
      return filteredResults;
    }

    return filteredResults.filter((result) => getDateKey(result.orderedAt) === activeQueueDateKey);
  }, [activeQueueDateKey, filteredResults]);

  const historyResults = useMemo(() => {
    if (!activeQueueDateKey) {
      return [];
    }

    return filteredResults.filter((result) => getDateKey(result.orderedAt) !== activeQueueDateKey);
  }, [activeQueueDateKey, filteredResults]);

  const previousQueueDateKey = activeQueueDateKey ? shiftDateKey(activeQueueDateKey, -1) : null;

  const todayHistoryResults = sameDateResults;

  const yesterdayHistoryResults = useMemo(() => {
    if (!previousQueueDateKey) {
      return [];
    }

    return filteredResults.filter((result) => getDateKey(result.orderedAt) === previousQueueDateKey);
  }, [filteredResults, previousQueueDateKey]);

  const historyPanelResults = useMemo(() => {
    if (historyQuickView === "today") {
      return todayHistoryResults;
    }

    if (historyQuickView === "yesterday") {
      return yesterdayHistoryResults;
    }

    return historyResults;
  }, [historyQuickView, historyResults, todayHistoryResults, yesterdayHistoryResults]);

  const historyPanelCopy = useMemo(() => {
    if (historyQuickView === "today") {
      return {
        title: "Today History",
        description: activeQueueDateKey ? `Showing queue history for ${formatDateKeyLabel(activeQueueDateKey)}.` : "Showing the latest available result date.",
      };
    }

    if (historyQuickView === "yesterday") {
      return {
        title: "Yesterday History",
        description: previousQueueDateKey ? `Showing queue history for ${formatDateKeyLabel(previousQueueDateKey)}.` : "Showing the previous available result date.",
      };
    }

    return {
      title: "Test History",
      description: "Older results are separated from the live same-date queue.",
    };
  }, [activeQueueDateKey, historyQuickView, previousQueueDateKey]);

  const availableHistoryDates = useMemo(() => {
    const counts = filteredResults.reduce<Record<string, number>>((items, result) => {
      const dateKey = getDateKey(result.orderedAt);
      items[dateKey] = (items[dateKey] ?? 0) + 1;
      return items;
    }, {});

    return Object.entries(counts)
      .sort(([first], [second]) => second.localeCompare(first))
      .map(([dateKey, count]) => ({
        count,
        dateKey,
        label: formatDateKeyLabel(dateKey),
      }));
  }, [filteredResults]);

  const availableResultDates = useMemo(() => {
    const counts = recordsWithState.reduce<Record<string, number>>((items, result) => {
      const dateKey = getDateKey(result.orderedAt);
      items[dateKey] = (items[dateKey] ?? 0) + 1;
      return items;
    }, {});

    return Object.entries(counts)
      .sort(([first], [second]) => second.localeCompare(first))
      .map(([dateKey, count]) => ({
        count,
        dateKey,
        label: formatDateKeyLabel(dateKey),
      }));
  }, [recordsWithState]);

  const dateWiseHistoryResults = useMemo(() => {
    if (!dateWiseHistoryDate) {
      return filteredResults;
    }

    return filteredResults.filter((result) => getDateKey(result.orderedAt) === dateWiseHistoryDate);
  }, [dateWiseHistoryDate, filteredResults]);

  const visibleGroupedResults = useMemo(() => {
    return sameDateResults.reduce<Record<string, ResultRecord[]>>((groups, result) => {
      const label = dateFormatter.format(new Date(result.orderedAt));
      groups[label] = [...(groups[label] ?? []), result];
      return groups;
    }, {});
  }, [sameDateResults]);

  const historyColumns = useMemo<ColumnDef<ResultRecord>[]>(() => [{ id: "history", accessorKey: "id" }], []);
  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table is used here only for the separated test-history pagination state.
  const historyTable = useReactTable({
    data: historyPanelResults,
    columns: historyColumns,
    state: { pagination: historyPagination },
    onPaginationChange: setHistoryPagination,
    autoResetPageIndex: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const dateWiseColumns = useMemo<ColumnDef<ResultRecord>[]>(() => [{ id: "date-wise-history", accessorKey: "id" }], []);
  const dateWiseHistoryTable = useReactTable({
    data: dateWiseHistoryResults,
    columns: dateWiseColumns,
    state: { pagination: dateWisePagination },
    onPaginationChange: setDateWisePagination,
    autoResetPageIndex: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const statusCounts = useMemo(() => {
    return resultStatuses.reduce<Record<string, number>>((counts, item) => {
      counts[item] = item === "all" ? scopedRecords.length : scopedRecords.filter((result) => result.status === item).length;
      return counts;
    }, {});
  }, [scopedRecords]);

  const visibleStatusFilters = useMemo(() => resultStatuses.filter((item) => item !== "Critical"), []);

  const unifiedCounts = useMemo(
    () => ({
      all: recordsWithState.length,
      laboratory: recordsWithState.filter((result) => result.department === "laboratory").length,
      radiology: recordsWithState.filter((result) => result.department === "radiology").length,
      poct: recordsWithState.filter((result) => result.department === "poct").length,
      critical: recordsWithState.filter((result) => result.status === "Critical").length,
      reports: recordsWithState.filter((result) => result.reportAvailable).length,
      images: recordsWithState.filter((result) => result.imageAvailable).length,
      pending: recordsWithState.filter((result) => result.status === "Sample Collected" || result.status === "Processing" || result.status === "Verification Pending").length,
      processing: recordsWithState.filter((result) => result.status === "Processing").length,
      today: recordsWithState.filter((result) => getDateKey(result.orderedAt) === latestResultDateKey).length,
      verification: recordsWithState.filter((result) => result.status === "Verification Pending").length,
      emergency: recordsWithState.filter((result) => result.priority === "Emergency" || result.status === "Critical").length,
    }),
    [latestResultDateKey, recordsWithState],
  );

  const generatedReportRecords = useMemo(() => scopedRecords.filter((result) => result.reportAvailable), [scopedRecords]);

  const commandSearchSuggestions = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search || !/[a-z]/i.test(search)) {
      return [];
    }

    const seenPatients = new Set<string>();

    return recordsWithState
      .filter((result) => result.patientName.toLowerCase().includes(search))
      .sort((first, second) => {
        const firstStarts = first.patientName.toLowerCase().startsWith(search);
        const secondStarts = second.patientName.toLowerCase().startsWith(search);

        if (firstStarts !== secondStarts) {
          return firstStarts ? -1 : 1;
        }

        return first.patientName.localeCompare(second.patientName);
      })
      .filter((result) => {
        const key = result.patientName.toLowerCase();

        if (seenPatients.has(key)) {
          return false;
        }

        seenPatients.add(key);
        return true;
      })
      .slice(0, 6);
  }, [query, recordsWithState]);

  const showCommandSearchSuggestions = isCommandSearchFocused && commandSearchSuggestions.length > 0;

  function changeStatus(nextStatus: StatusFilter) {
    if (criticalOnly && nextStatus !== "Critical") {
      return;
    }

    setStatus(nextStatus);
    setQuickQueue(null);
    setPreviewMode("summary");
  }

  function selectCommandSearchSuggestion(result: ResultRecord) {
    setQuery(result.patientName);
    selectResult(result);
    setIsCommandSearchFocused(false);
  }

  function openReportGroupDownload(results: ResultRecord[], label: string) {
    if (results.length === 0) {
      setNotice(`No ${label.toLowerCase()} reports available for download.`);
      return;
    }

    setDownloadGroup({ title: `${label} Reports`, results });
  }

  function viewGeneratedReports() {
    setDepartment("all");
    setStatus("all");
    setDateFilter("all");
    setCustomResultDate("");
    setAvailability("reports");
    setQuickQueue(null);
    setQuery("");
    setPreviewMode("report");
    setNotice("Generated reports view applied.");
  }

  function openQuickHistory(view: HistoryQuickView) {
    setHistoryQuickView(view);
    setIsHistoryPanelOpen(true);
    setHistoryPagination((current) => ({ ...current, pageIndex: 0 }));
  }

  function changeDateWiseHistoryDate(nextDate: string) {
    setDateWiseHistoryDate(nextDate);
    setDateWisePagination((current) => ({ ...current, pageIndex: 0 }));
  }

  function applyCustomResultDate(nextDate: string) {
    setDateFilter("custom");
    setCustomResultDate(nextDate);
    setQuickQueue(null);
    setIsCustomDateDialogOpen(false);
  }

  function clearCustomResultDate() {
    setDateFilter("all");
    setCustomResultDate("");
    setQuickQueue(null);
    setIsCustomDateDialogOpen(false);
  }

  function openDateWiseHistory() {
    changeDateWiseHistoryDate(dateWiseHistoryDate || activeQueueDateKey || availableHistoryDates[0]?.dateKey || "");
    setIsDateWiseHistoryOpen(true);
  }

  function clearFilters() {
    setDepartment(defaultDepartment);
    setStatus(criticalOnly ? "Critical" : "all");
    setDateFilter("all");
    setCustomResultDate("");
    setAvailability("all");
    setQuickQueue(null);
    setQuery("");
    setPreviewMode("summary");
    setNotice("Filters reset.");
  }

  function applyUnifiedPreset(preset: "all" | ResultDepartment | "critical" | "reports" | "images" | "today" | "pending" | "verification" | "emergency") {
    setNotice(null);

    if (preset === "critical") {
      setDepartment("all");
      setStatus("Critical");
      setDateFilter("all");
      setCustomResultDate("");
      setAvailability("all");
      setQuickQueue(null);
    } else if (preset === "reports") {
      setDepartment("all");
      setStatus("all");
      setDateFilter("all");
      setCustomResultDate("");
      setAvailability("reports");
      setQuickQueue(null);
    } else if (preset === "images") {
      setDepartment("all");
      setStatus("all");
      setDateFilter("all");
      setCustomResultDate("");
      setAvailability("images");
      setQuickQueue(null);
    } else if (preset === "today") {
      setDepartment("all");
      setStatus("all");
      setDateFilter("today");
      setCustomResultDate("");
      setAvailability("all");
      setQuickQueue(null);
    } else if (preset === "pending") {
      setDepartment("all");
      setStatus("all");
      setDateFilter("all");
      setCustomResultDate("");
      setAvailability("all");
      setQuickQueue("pending");
    } else if (preset === "verification") {
      setDepartment("all");
      setStatus("Verification Pending");
      setDateFilter("all");
      setCustomResultDate("");
      setAvailability("all");
      setQuickQueue(null);
    } else if (preset === "emergency") {
      setDepartment("all");
      setStatus("all");
      setDateFilter("all");
      setCustomResultDate("");
      setAvailability("all");
      setQuickQueue("emergency");
      setQuery("");
    } else {
      setDepartment(preset);
      setStatus("all");
      setDateFilter("all");
      setCustomResultDate("");
      setAvailability("all");
      setQuickQueue(null);
      setQuery("");
    }

    if (preset !== "emergency") {
      setQuery("");
    }
    setPreviewMode("summary");
  }

  function selectResult(result: ResultRecord) {
    setSelectedId(result.id);
    setPreviewMode("summary");
    setIsResultDetailsOpen(true);
  }

  function printResult(result: ResultRecord) {
    setNotice(`Print preview opened for ${result.id}.`);
    window.print();
  }

  function notifyCriticalTeam(result: ResultRecord) {
    setNotice(`Critical notification sent to ${result.orderingDoctor} for ${result.patientName}.`);
  }

  function acknowledgeCritical(result: ResultRecord) {
    if (ackNote.trim().length < 8) {
      setNotice("Enter a short acknowledgement note before closing the critical alert.");
      return;
    }

    setAcknowledgedIds((current) => (current.includes(result.id) ? current : [...current, result.id]));
    setNotice(`Critical result ${result.id} acknowledged and added to audit trail.`);
    setAckNote("");
    setPreviewMode("audit");
  }

  function advanceLaboratoryWorkflow(result: ResultRecord) {
    const nextStatus = getNextLaboratoryStatus(result.status);

    if (!nextStatus) {
      setNotice(`${result.id} is already completed.`);
      return;
    }

    setStatusOverrides((current) => ({ ...current, [result.id]: nextStatus }));
    if (nextStatus === "Completed") {
      setReportReadyIds((current) => (current.includes(result.id) ? current : [...current, result.id]));
      setPreviewMode("report");
    } else {
      setPreviewMode("audit");
    }
    setNotice(`${result.testName} moved to ${nextStatus}.`);
  }

  function releaseLaboratoryReport(result: ResultRecord) {
    setStatusOverrides((current) => ({ ...current, [result.id]: "Completed" }));
    setReportReadyIds((current) => (current.includes(result.id) ? current : [...current, result.id]));
    setPreviewMode("report");
    setNotice(`${result.id} report marked ready for release.`);
  }

  const resultSearchControl = (
    <label className="relative block min-w-[260px] flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="h-10 rounded-lg border-border bg-surface pl-9 text-sm shadow-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
        placeholder="Search by UHID, MRN, patient"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
    </label>
  );

  const commandSearchControl = (
    <div className="relative block min-w-[260px] flex-1">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-primary/70" />
        <Input
          className="h-10 rounded-xl border-border/80 bg-background pl-10 text-sm font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(15,23,42,0.04)] transition placeholder:text-muted-foreground/75 focus:border-primary/35 focus:ring-4 focus:ring-primary/10"
          onBlur={() => setIsCommandSearchFocused(false)}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsCommandSearchFocused(true)}
          placeholder="Search by UHID, MRN, patient"
          value={query}
        />
      </label>

      {showCommandSearchSuggestions ? (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[70] overflow-hidden rounded-2xl border border-border/80 bg-background shadow-[0_18px_45px_rgba(79,70,229,0.16)]">
          <div className="border-b border-border/70 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Patient suggestions</div>
          <div className="max-h-72 overflow-y-auto p-1.5">
            {commandSearchSuggestions.map((result) => (
              <button
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                key={`command-search-${result.id}`}
                onClick={() => selectCommandSearchSuggestion(result)}
                onMouseDown={(event) => event.preventDefault()}
                type="button"
              >
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                  {getPatientInitials(result.patientName)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">{result.patientName}</span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {result.mrn} | {result.testName}
                  </span>
                </span>
                <Badge tone={statusTone[result.status]}>{result.status}</Badge>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-5">
      {notice ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-info/25 bg-info/10 px-4 py-3 text-sm text-info">
          <span>{notice}</span>
          <Button size="sm" variant="ghost" onClick={() => setNotice(null)}>
            Dismiss
          </Button>
        </div>
      ) : null}

      {downloadGroup ? (
        <ResultsGroupDownloadDialog
          onDownloaded={(format) => setNotice(`${downloadGroup.results.length} reports downloaded as ${format}.`)}
          onOpenChange={(open) => {
            if (!open) {
              setDownloadGroup(null);
            }
          }}
          open={Boolean(downloadGroup)}
          results={downloadGroup.results}
          title={downloadGroup.title}
        />
      ) : null}

      <CustomDateFilterDialog
        availableDates={availableResultDates}
        onApply={applyCustomResultDate}
        onClear={clearCustomResultDate}
        onOpenChange={setIsCustomDateDialogOpen}
        open={isCustomDateDialogOpen}
        value={customResultDate}
      />

      <DateWiseHistoryDialog
        availableDates={availableHistoryDates}
        dateValue={dateWiseHistoryDate}
        onDateChange={changeDateWiseHistoryDate}
        onOpenChange={setIsDateWiseHistoryOpen}
        onSelect={(result) => {
          selectResult(result);
          setIsDateWiseHistoryOpen(false);
        }}
        open={isDateWiseHistoryOpen}
        selectedId={selectedResult?.id}
        table={dateWiseHistoryTable}
        totalCount={dateWiseHistoryResults.length}
      />

      {isUnifiedView ? (
        <UnifiedWorkspacePanel
          activeDepartment={department}
          availability={availability}
          counts={unifiedCounts}
          onPreset={applyUnifiedPreset}
          status={status}
        />
      ) : null}

      {isUnifiedView ? (
        <div className="rounded-2xl border border-border/75 bg-background/90 p-2 shadow-[0_10px_26px_rgba(79,70,229,0.08)]">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="min-w-0 flex-1">{commandSearchControl}</div>
            <span className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5f6ff5] via-[#4f6df5] to-[#4038f2] px-5 text-xs font-bold uppercase tracking-wide text-white shadow-[0_8px_20px_rgba(79,70,229,0.28)] lg:w-auto">
              <Zap className="h-3.5 w-3.5" />
              Quick Search
            </span>
          </div>
        </div>
      ) : null}

      <Card className="overflow-visible rounded-2xl border-[#e6e8f7] bg-white shadow-[0_12px_30px_rgba(79,70,229,0.08)]">
        <CardContent className="space-y-2 p-2">
          {!isUnifiedView ? <div className="flex flex-wrap items-center gap-3">{resultSearchControl}</div> : null}

          <div className="grid items-center gap-1.5 lg:grid-cols-[1.02fr_1.2fr_0.94fr_1.36fr_0.9fr_1.4fr]">
            {visibleStatusFilters.map((item) => (
              <FilterChip active={status === item} disabled={criticalOnly} key={item} onClick={() => changeStatus(item)}>
                {getStatusIcon(item)}
                <span className="min-w-0 truncate">{getStatusLabel(item)}</span>
                <span className="ml-auto rounded-md bg-current/10 px-1.5 py-0.5 text-[11px] font-bold leading-none text-current">{statusCounts[item] ?? 0}</span>
              </FilterChip>
            ))}
            <StatusActionChip
              active={availability === "reports"}
              count={generatedReportRecords.length}
              label="Generated Reports"
              onDownload={() => openReportGroupDownload(generatedReportRecords, "Generated Reports")}
              onView={viewGeneratedReports}
            />
          </div>
        </CardContent>
      </Card>

      <ResultDetailsDialog
        ackNote={ackNote}
        acknowledged={selectedResult ? acknowledgedIds.includes(selectedResult.id) : false}
        onAckNoteChange={setAckNote}
        onAcknowledge={acknowledgeCritical}
        onAdvanceLaboratory={advanceLaboratoryWorkflow}
        onNotifyCritical={notifyCriticalTeam}
        onOpenChange={setIsResultDetailsOpen}
        onPrint={printResult}
        onReleaseLaboratory={releaseLaboratoryReport}
        onSetNotice={setNotice}
        onSetPreviewMode={setPreviewMode}
        open={Boolean(selectedResult && isResultDetailsOpen)}
        previewMode={previewMode}
        result={selectedResult}
      />

      <div className="grid min-w-0 gap-5">
        <Card className="min-w-0">
          <CardHeader className="px-5 py-4">
            <div>
              <CardTitle className="text-base">{isDepartmentLocked ? getDepartmentLabel(initialDepartment) : getDepartmentLabel(department)}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {shouldSplitResultHistory
                  ? `${sameDateResults.length} same-date records shown. Use Test History for ${historyResults.length} older tests.`
                  : `${filteredResults.length} records match the current filters`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {shouldSplitResultHistory && historyResults.length > 0 ? (
                <ResultHistoryDropdown
                  onDateWise={openDateWiseHistory}
                  onToday={() => openQuickHistory("today")}
                  onYesterday={() => openQuickHistory("yesterday")}
                  todayCount={todayHistoryResults.length}
                  totalCount={historyResults.length}
                  yesterdayCount={yesterdayHistoryResults.length}
                />
              ) : null}
              <Badge tone={criticalOnly ? "critical" : "info"}>{criticalOnly ? "Critical only" : "Live results"}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 md:p-5">
            {filteredResults.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-background px-4 py-10 text-center">
                <div className="text-sm font-semibold text-foreground">No results found</div>
                <p className="mt-1 text-xs text-muted-foreground">Change filters or search with a different patient, MRN, test, location, or order number.</p>
                <Button className="mt-4" variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                {Object.entries(visibleGroupedResults).map(([date, records]) => (
                  <section className="space-y-3" key={date}>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {date}
                    </div>
                    <div className="overflow-hidden rounded-xl border border-border">
                      <div className="hidden grid-cols-[1.25fr_0.9fr_0.82fr_0.75fr_0.95fr] gap-3 border-b border-border bg-surface-muted px-4 py-3 text-xs font-semibold text-muted-foreground lg:grid">
                        <span>Patient and test</span>
                        <span>{isLaboratoryView ? "Specimen" : "Department"}</span>
                        <span>Status</span>
                        <span>Priority</span>
                        <span className="text-right">{isLaboratoryView ? "Report" : "Availability"}</span>
                      </div>
                      {records.map((result) => (
                        <ResultQueueRow
                          acknowledged={acknowledgedIds.includes(result.id)}
                          isLaboratoryView={isLaboratoryView}
                          key={result.id}
                          onSelect={() => selectResult(result)}
                          result={result}
                          selected={selectedResult?.id === result.id}
                        />
                      ))}
                    </div>
                  </section>
                ))}

                {shouldSplitResultHistory && historyResults.length > 0 && isHistoryPanelOpen ? (
                  <TestHistoryPanel
                    description={historyPanelCopy.description}
                    historyTable={historyTable}
                    onClose={() => setIsHistoryPanelOpen(false)}
                    onSelect={selectResult}
                    selectedId={selectedResult?.id}
                    title={historyPanelCopy.title}
                    totalCount={historyPanelResults.length}
                  />
                ) : null}
              </>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}

function ResultHistoryDropdown({
  onDateWise,
  onToday,
  onYesterday,
  todayCount,
  totalCount,
  yesterdayCount,
}: {
  onDateWise: () => void;
  onToday: () => void;
  onYesterday: () => void;
  todayCount: number;
  totalCount: number;
  yesterdayCount: number;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button size="sm" type="button" variant="outline">
          Test History
          <Badge tone="muted">{totalCount}</Badge>
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          className="z-50 w-64 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-lg"
          sideOffset={8}
        >
          <DropdownMenu.Item
            className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm outline-none transition focus:bg-surface-muted"
            onSelect={onToday}
          >
            <span>
              <span className="block font-medium text-foreground">Today</span>
              <span className="block text-xs text-muted-foreground">Latest queue date</span>
            </span>
            <Badge tone="info">{todayCount}</Badge>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm outline-none transition focus:bg-surface-muted"
            onSelect={onYesterday}
          >
            <span>
              <span className="block font-medium text-foreground">Yesterday</span>
              <span className="block text-xs text-muted-foreground">Previous queue date</span>
            </span>
            <Badge tone="muted">{yesterdayCount}</Badge>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm outline-none transition focus:bg-surface-muted"
            onSelect={onDateWise}
          >
            <span>
              <span className="block font-medium text-foreground">Older Tests</span>
              <span className="block text-xs text-muted-foreground">Open custom history view</span>
            </span>
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function UnifiedWorkspacePanel({
  activeDepartment,
  availability,
  counts,
  onPreset,
  status,
}: {
  activeDepartment: DepartmentFilter;
  availability: AvailabilityFilter;
  counts: {
    all: number;
    laboratory: number;
    radiology: number;
    poct: number;
    critical: number;
    reports: number;
    images: number;
    pending: number;
    processing: number;
    today: number;
    verification: number;
    emergency: number;
  };
  onPreset: (preset: "all" | ResultDepartment | "critical" | "reports" | "images" | "today" | "pending" | "verification" | "emergency") => void;
  status: StatusFilter;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="px-5 py-4">
        <div>
          <CardTitle className="text-base">Unified Workspace</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">One operating console for lab results, radiology images, POCT values, and critical alerts.</p>
        </div>
        <Badge tone="info">Command view</Badge>
      </CardHeader>
      <CardContent className="space-y-4 p-4 md:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <WorkspaceTile
            active={activeDepartment === "all" && status === "all" && availability === "all"}
            icon={<Layers3 className="h-4 w-4" />}
            label="All Results"
            value={counts.all}
            description="Complete queue"
            onClick={() => onPreset("all")}
          />
          <WorkspaceTile
            active={activeDepartment === "laboratory"}
            icon={<FlaskConical className="h-4 w-4" />}
            label="Laboratory"
            value={counts.laboratory}
            description="Samples and reports"
            onClick={() => onPreset("laboratory")}
          />
          <WorkspaceTile
            active={activeDepartment === "radiology"}
            icon={<ScanSearch className="h-4 w-4" />}
            label="Radiology"
            value={counts.radiology}
            description="Images and reports"
            onClick={() => onPreset("radiology")}
          />
          <WorkspaceTile
            active={activeDepartment === "poct"}
            icon={<Zap className="h-4 w-4" />}
            label="POCT"
            value={counts.poct}
            description="Rapid results"
            onClick={() => onPreset("poct")}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function WorkspaceTile({
  active,
  description,
  icon,
  label,
  onClick,
  value,
}: {
  active?: boolean;
  description: string;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  value: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-background p-3 text-left transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "border-primary bg-primary/5 ring-1 ring-inset ring-primary/25" : "border-border",
      )}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-info/30 bg-info/10 text-info">
          {icon}
        </span>
        <span className="text-2xl font-semibold text-foreground">{value}</span>
      </span>
      <span className="mt-3 block text-sm font-semibold text-foreground">{label}</span>
      <span className="mt-1 block text-xs text-muted-foreground">{description}</span>
    </button>
  );
}

function FilterChip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative inline-flex h-10 w-full min-w-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-transparent bg-[#fbfbff] px-2.5 text-xs font-semibold text-[#4c5062] shadow-[0_6px_16px_rgba(40,45,90,0.045)] transition hover:bg-white hover:shadow-[0_8px_18px_rgba(79,70,229,0.075)] disabled:cursor-not-allowed disabled:opacity-45",
        active && "bg-white text-primary shadow-[0_8px_18px_rgba(79,70,229,0.10)] after:absolute after:inset-x-0 after:-bottom-[8px] after:h-[2px] after:rounded-full after:bg-primary",
      )}
    >
      {children}
    </button>
  );
}

function StatusActionChip({
  active,
  count,
  disabled,
  label,
  onDownload,
  onView,
}: {
  active: boolean;
  count: number;
  disabled?: boolean;
  label: string;
  onDownload: () => void;
  onView: () => void;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex h-10 w-full min-w-0 overflow-visible rounded-xl border border-transparent bg-[#fbfbff] text-xs font-semibold text-[#4c5062] shadow-[0_6px_16px_rgba(40,45,90,0.045)] transition hover:bg-white hover:shadow-[0_8px_18px_rgba(79,70,229,0.075)]",
        active && "bg-white text-primary shadow-[0_8px_18px_rgba(79,70,229,0.10)] after:absolute after:inset-x-0 after:-bottom-[8px] after:h-[2px] after:rounded-full after:bg-primary",
        disabled && "opacity-45",
      )}
    >
      <button
        className="inline-flex min-w-0 flex-1 items-center gap-1.5 px-2.5 transition hover:bg-current/5 disabled:cursor-not-allowed"
        disabled={disabled}
        onClick={onView}
        type="button"
      >
        <FileText className="h-4 w-4 shrink-0 text-slate-500" />
        <span className="min-w-0 truncate">{label}</span>
        <span className="ml-auto rounded-md bg-current/10 px-1.5 py-0.5 text-[11px] font-bold leading-none text-current">{count}</span>
      </button>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            aria-label={`${label} actions`}
            className="inline-flex w-7 items-center justify-center text-muted-foreground transition hover:bg-surface-muted hover:text-foreground disabled:cursor-not-allowed"
            disabled={disabled}
            type="button"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            className="z-[80] min-w-44 overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-xl"
            sideOffset={6}
          >
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground outline-none hover:bg-surface-muted focus:bg-surface-muted"
              onSelect={onView}
            >
              <Eye className="h-4 w-4 text-muted-foreground" />
              View Reports
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground outline-none hover:bg-surface-muted focus:bg-surface-muted"
              onSelect={onDownload}
            >
              <Download className="h-4 w-4 text-muted-foreground" />
              Download Reports
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </span>
  );
}

function ResultDetailsDialog({
  ackNote,
  acknowledged,
  onAckNoteChange,
  onAcknowledge,
  onAdvanceLaboratory,
  onNotifyCritical,
  onOpenChange,
  onPrint,
  onReleaseLaboratory,
  onSetNotice,
  onSetPreviewMode,
  open,
  previewMode,
  result,
}: {
  ackNote: string;
  acknowledged: boolean;
  onAckNoteChange: (value: string) => void;
  onAcknowledge: (result: ResultRecord) => void;
  onAdvanceLaboratory: (result: ResultRecord) => void;
  onNotifyCritical: (result: ResultRecord) => void;
  onOpenChange: (open: boolean) => void;
  onPrint: (result: ResultRecord) => void;
  onReleaseLaboratory: (result: ResultRecord) => void;
  onSetNotice: (notice: string | null) => void;
  onSetPreviewMode: (mode: PreviewMode) => void;
  open: boolean;
  previewMode: PreviewMode;
  result: ResultRecord | null;
}) {
  if (!result) {
    return null;
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[90] flex max-h-[90vh] w-[min(94vw,980px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border bg-background px-5 py-4">
            <div className="min-w-0">
              <Dialog.Title className="truncate text-lg font-semibold text-foreground">{result.patientName}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                {result.mrn} | {result.ageSex} | {result.visitType} | {result.testName}
              </Dialog.Description>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge tone={statusTone[result.status]}>{result.status}</Badge>
              <Dialog.Close asChild>
                <Button aria-label="Close result details" size="icon" type="button" variant="ghost">
                  <X className="h-4 w-4" />
                </Button>
              </Dialog.Close>
            </div>
          </div>

          <div className="space-y-4 overflow-y-auto p-4 md:p-5">
            <div className="grid grid-cols-4 gap-2 rounded-lg bg-surface-muted p-1">
              <PreviewTab active={previewMode === "summary"} onClick={() => onSetPreviewMode("summary")}>
                Summary
              </PreviewTab>
              <PreviewTab active={previewMode === "report"} onClick={() => onSetPreviewMode("report")}>
                Report
              </PreviewTab>
              <PreviewTab active={previewMode === "image"} onClick={() => onSetPreviewMode("image")}>
                Image
              </PreviewTab>
              <PreviewTab active={previewMode === "audit"} onClick={() => onSetPreviewMode("audit")}>
                Audit
              </PreviewTab>
            </div>

            {previewMode === "summary" ? <SummaryPanel result={result} /> : null}
            {previewMode === "report" ? <ReportPanel result={result} /> : null}
            {previewMode === "image" ? <ImagePanel result={result} /> : null}
            {previewMode === "audit" ? <AuditPanel acknowledged={acknowledged} ackNote={ackNote} result={result} /> : null}

            {result.department === "laboratory" ? (
              <LaboratoryWorkflowActions result={result} onAdvance={() => onAdvanceLaboratory(result)} onRelease={() => onReleaseLaboratory(result)} />
            ) : null}

            {result.status === "Critical" ? (
              <div className="space-y-3 rounded-lg border border-critical/30 bg-critical/10 p-3 text-critical">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <AlertTriangle className="h-4 w-4" />
                  Critical result action required
                </div>
                <p className="text-xs">Notify the clinical team and record acknowledgement before closing this alert.</p>
                <textarea
                  className="min-h-20 w-full resize-none rounded-md border border-critical/30 bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-critical/20"
                  onChange={(event) => onAckNoteChange(event.target.value)}
                  placeholder="Acknowledgement note"
                  value={ackNote}
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button variant="outline" onClick={() => onNotifyCritical(result)}>
                    <Bell className="h-4 w-4" />
                    Notify Team
                  </Button>
                  <Button onClick={() => onAcknowledge(result)} disabled={acknowledged}>
                    <ShieldCheck className="h-4 w-4" />
                    {acknowledged ? "Acknowledged" : "Acknowledge"}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-border bg-surface-muted px-4 py-3">
            <div className="grid gap-2 sm:grid-cols-4">
              <Button onClick={() => onSetPreviewMode("report")}>
                <FileText className="h-4 w-4" />
                View Report
              </Button>
              <Button variant="outline" onClick={() => onSetPreviewMode("image")}>
                <ImageIcon className="h-4 w-4" />
                View Image
              </Button>
              <Button variant="outline" onClick={() => onPrint(result)}>
                <Printer className="h-4 w-4" />
                Print
              </Button>
              <ResultDownloadDialog
                onDownloaded={(format) => onSetNotice(`${result.id} downloaded as ${format}.`)}
                result={result}
                trigger={
                  <Button disabled={!result.reportAvailable} title={result.reportAvailable ? "Download report" : "Report is not ready"} type="button" variant="outline">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                }
              />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ResultQueueRow({
  acknowledged,
  isLaboratoryView,
  onSelect,
  result,
  selected,
}: {
  acknowledged: boolean;
  isLaboratoryView: boolean;
  onSelect: () => void;
  result: ResultRecord;
  selected: boolean;
}) {
  return (
    <button
      aria-current={selected ? "true" : undefined}
      className={cn(
        "relative grid w-full gap-3 overflow-hidden border-b border-border bg-background px-4 py-4 text-left transition last:border-b-0 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:grid-cols-[1.25fr_0.9fr_0.82fr_0.75fr_0.95fr] lg:items-center",
        selected && "bg-primary/5 shadow-sm ring-1 ring-inset ring-primary/25",
      )}
      onClick={onSelect}
      type="button"
    >
      {selected ? <span className="absolute inset-y-0 left-0 w-1 bg-primary" /> : null}
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2">
          <span className="truncate text-base font-semibold text-foreground">{result.patientName}</span>
          {selected ? <Badge tone="info">Selected</Badge> : null}
          {acknowledged ? <Badge tone="success">Acknowledged</Badge> : null}
        </div>
        <div className="mt-1 truncate text-sm text-muted-foreground">
          {result.mrn} | {result.testName}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{result.id}</div>
      </div>
      <div className="min-w-0 text-sm text-muted-foreground">
        <div className="font-medium capitalize text-foreground">{isLaboratoryView ? result.specimen ?? "Lab specimen" : result.department}</div>
        <div className="mt-1 truncate text-xs">{isLaboratoryView ? result.location : formatDateTime(result.orderedAt)}</div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:hidden">Status</span>
        <Badge tone={statusTone[result.status]}>{result.status}</Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:hidden">Priority</span>
        <Badge tone={priorityTone[result.priority]}>{result.priority}</Badge>
      </div>
      <div className="flex justify-start gap-2 lg:justify-end">
        <AvailabilityIcon active={result.reportAvailable} label="Report" icon="report" />
        {!isLaboratoryView ? <AvailabilityIcon active={result.imageAvailable} label="Image" icon="image" /> : null}
        <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-border bg-background px-3 text-xs font-medium text-muted-foreground">
          {isLaboratoryView ? (result.reportAvailable ? "Ready" : "Pending") : "View"}
        </span>
      </div>
    </button>
  );
}

function TestHistoryPanel({
  description,
  historyTable,
  onClose,
  onSelect,
  selectedId,
  title,
  totalCount,
}: {
  description: string;
  historyTable: Table<ResultRecord>;
  onClose: () => void;
  onSelect: (result: ResultRecord) => void;
  selectedId?: string;
  title: string;
  totalCount: number;
}) {
  const currentPage = historyTable.getState().pagination.pageIndex + 1;
  const pageSize = historyTable.getState().pagination.pageSize;
  const pageCount = Math.max(historyTable.getPageCount(), 1);
  const pageStart = totalCount === 0 ? 0 : historyTable.getState().pagination.pageIndex * pageSize + 1;
  const pageEnd = totalCount === 0 ? 0 : Math.min(totalCount, pageStart + historyTable.getRowModel().rows.length - 1);

  return (
    <section className="rounded-xl border border-border bg-background p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="muted">{totalCount} older tests</Badge>
          <Button onClick={onClose} size="sm" type="button" variant="outline">
            Hide History
          </Button>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        {historyTable.getRowModel().rows.map((row) => {
          const result = row.original;

          return (
            <button
              className={cn(
                "grid w-full gap-3 rounded-lg border border-border bg-surface px-3 py-3 text-left transition hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:grid-cols-[1fr_auto] md:items-center",
                selectedId === result.id && "border-primary bg-primary/5 ring-1 ring-inset ring-primary/20",
              )}
              key={result.id}
              onClick={() => onSelect(result)}
              type="button"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">{result.patientName}</span>
                <span className="mt-1 block truncate text-xs text-muted-foreground">
                  {formatDateTime(result.orderedAt)} | {result.mrn} | {result.testName}
                </span>
              </span>
              <span className="flex flex-wrap items-center gap-2 md:justify-end">
                <Badge tone={statusTone[result.status]}>{result.status}</Badge>
                <Badge tone={priorityTone[result.priority]}>{result.priority}</Badge>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg border border-border bg-surface-muted p-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-sm font-semibold text-primary">
              {currentPage}
            </span>
            <div>
              <div className="text-sm font-semibold text-foreground">
                Showing {pageStart} to {pageEnd} of {totalCount} older tests
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                Page {currentPage} of {pageCount} | Test History pagination
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5">
              <span className="text-xs font-semibold text-muted-foreground">Rows per page</span>
              <div className="flex items-center gap-1">
                {[4, 8].map((size) => (
                  <Button
                    aria-label={`${size} rows per page`}
                    key={size}
                    onClick={() => {
                      historyTable.setPageSize(size);
                      historyTable.setPageIndex(0);
                    }}
                    size="sm"
                    type="button"
                    variant={pageSize === size ? "default" : "ghost"}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                aria-label="Go to first page"
                disabled={!historyTable.getCanPreviousPage()}
                onClick={() => historyTable.setPageIndex(0)}
                size="sm"
                type="button"
                variant="outline"
              >
                <ChevronsLeft className="h-4 w-4" />
                First Page
              </Button>
              <Button
                aria-label="Go to previous page"
                disabled={!historyTable.getCanPreviousPage()}
                onClick={() => historyTable.previousPage()}
                size="sm"
                type="button"
                variant="outline"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous Page
              </Button>
              <Button
                aria-label="Go to next page"
                disabled={!historyTable.getCanNextPage()}
                onClick={() => historyTable.nextPage()}
                size="sm"
                type="button"
                variant="outline"
              >
                Next Page
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                aria-label="Go to last page"
                disabled={!historyTable.getCanNextPage()}
                onClick={() => historyTable.setPageIndex(pageCount - 1)}
                size="sm"
                type="button"
                variant="outline"
              >
                Last Page
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CustomDateFilterDialog({
  availableDates,
  onApply,
  onClear,
  onOpenChange,
  open,
  value,
}: {
  availableDates: { count: number; dateKey: string; label: string }[];
  onApply: (dateKey: string) => void;
  onClear: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  value: string;
}) {
  const fallbackDate = availableDates[0]?.dateKey ?? getLocalDateKey(new Date());
  const [draftDate, setDraftDate] = useState(value || fallbackDate);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(`${value || fallbackDate}T00:00:00`));

  const dateCounts = useMemo(() => {
    return availableDates.reduce<Record<string, number>>((counts, item) => {
      counts[item.dateKey] = item.count;
      return counts;
    }, {});
  }, [availableDates]);

  const calendarCells = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = firstDay.getDay();

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(year, month, index - startOffset + 1);
      const dateKey = getLocalDateKey(date);

      return {
        date,
        dateKey,
        day: date.getDate(),
        inCurrentMonth: date.getMonth() === month,
      };
    });
  }, [visibleMonth]);

  const canApply = isValidDateKey(draftDate);
  const selectedLabel = canApply ? formatDateKeyLabel(draftDate) : "Enter a valid date";
  const todayKey = getLocalDateKey(new Date());

  function changeManualDate(nextDate: string) {
    setDraftDate(nextDate);
    if (isValidDateKey(nextDate)) {
      setVisibleMonth(new Date(`${nextDate}T00:00:00`));
    }
  }

  function moveMonth(offset: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[90] w-[min(88vw,340px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border border-border bg-surface shadow-2xl outline-none">
          <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <Dialog.Title className="text-base font-semibold text-foreground">Select Custom Date</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                Use the calendar or type a date manually for date-wise results.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button aria-label="Close custom date calendar" size="icon" type="button" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="space-y-3 p-3">
            <label className="block rounded-lg border border-border bg-background p-2.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Manual date</span>
              <Input
                className="mt-2 h-9"
                inputMode="numeric"
                onChange={(event) => changeManualDate(event.target.value)}
                pattern="\d{4}-\d{2}-\d{2}"
                placeholder="YYYY-MM-DD"
                value={draftDate}
              />
              <span className={cn("mt-2 block text-xs", canApply ? "text-muted-foreground" : "text-critical")}>{selectedLabel}</span>
            </label>

            {availableDates.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {availableDates.slice(0, 4).map((item) => (
                  <button
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-medium transition hover:bg-surface-muted",
                      draftDate === item.dateKey ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground",
                    )}
                    key={item.dateKey}
                    onClick={() => changeManualDate(item.dateKey)}
                    type="button"
                  >
                    {item.label} ({item.count})
                  </button>
                ))}
              </div>
            ) : null}

            <div className="rounded-xl border border-border bg-background p-2.5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <Button aria-label="Previous month" onClick={() => moveMonth(-1)} size="icon" type="button" variant="outline">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-semibold text-foreground">{monthFormatter.format(visibleMonth)}</div>
                <Button aria-label="Next month" onClick={() => moveMonth(1)} size="icon" type="button" variant="outline">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {weekdayLabels.map((day) => (
                  <span className="py-0.5" key={day}>
                    {day}
                  </span>
                ))}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-1">
                {calendarCells.map((cell) => {
                  const isSelected = draftDate === cell.dateKey;
                  const isToday = todayKey === cell.dateKey;
                  const count = dateCounts[cell.dateKey] ?? 0;

                  return (
                    <button
                      className={cn(
                        "relative flex h-8 items-center justify-center rounded-md border text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        cell.inCurrentMonth ? "border-border bg-surface text-foreground hover:bg-surface-muted" : "border-transparent bg-transparent text-muted-foreground/45",
                        isToday && "border-info/50 text-info",
                        isSelected && "border-primary bg-primary text-primary-foreground hover:bg-primary",
                      )}
                      key={cell.dateKey}
                      onClick={() => changeManualDate(cell.dateKey)}
                      type="button"
                    >
                      {cell.day}
                      {count > 0 ? (
                        <span
                          className={cn(
                            "absolute bottom-1 h-1.5 w-1.5 rounded-full",
                            isSelected ? "bg-primary-foreground" : "bg-primary",
                          )}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-border bg-surface-muted px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <Button onClick={onClear} type="button" variant="outline">
              Clear Date
            </Button>
            <div className="flex gap-2">
              <Dialog.Close asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button disabled={!canApply} onClick={() => onApply(draftDate)} type="button">
                Apply Date
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DateWiseHistoryDialog({
  availableDates,
  dateValue,
  onDateChange,
  onOpenChange,
  onSelect,
  open,
  selectedId,
  table,
  totalCount,
}: {
  availableDates: { count: number; dateKey: string; label: string }[];
  dateValue: string;
  onDateChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onSelect: (result: ResultRecord) => void;
  open: boolean;
  selectedId?: string;
  table: Table<ResultRecord>;
  totalCount: number;
}) {
  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageSize = table.getState().pagination.pageSize;
  const pageCount = Math.max(table.getPageCount(), 1);
  const pageStart = totalCount === 0 ? 0 : table.getState().pagination.pageIndex * pageSize + 1;
  const pageEnd = totalCount === 0 ? 0 : Math.min(totalCount, pageStart + table.getRowModel().rows.length - 1);
  const activeDateLabel = dateValue ? formatDateKeyLabel(dateValue) : "All dates";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/45 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[90] flex max-h-[88vh] w-[min(94vw,1040px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl outline-none">
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-foreground">All Tests History</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                Review detailed result history by selected date with paginated patient records.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button aria-label="Close date wise history" size="icon" type="button" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>

          <div className="space-y-4 overflow-y-auto p-5">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-foreground">Available dates</div>
                    <div className="text-xs text-muted-foreground">Choose a date bucket or keep all history visible.</div>
                  </div>
                  <Badge tone="info">{activeDateLabel}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => onDateChange("")}
                    size="sm"
                    type="button"
                    variant={dateValue === "" ? "default" : "outline"}
                  >
                    All Dates
                  </Button>
                  {availableDates.map((item) => (
                    <Button
                      key={item.dateKey}
                      onClick={() => onDateChange(item.dateKey)}
                      size="sm"
                      type="button"
                      variant={dateValue === item.dateKey ? "default" : "outline"}
                    >
                      {item.label}
                      <Badge tone={dateValue === item.dateKey ? "default" : "muted"}>{item.count}</Badge>
                    </Button>
                  ))}
                </div>
              </div>

              <label className="rounded-lg border border-border bg-background p-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Custom date</span>
                <Input
                  className="mt-2 h-10"
                  onChange={(event) => onDateChange(event.target.value)}
                  type="date"
                  value={dateValue}
                />
              </label>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-background">
              <div className="hidden grid-cols-[1.15fr_0.8fr_1fr_0.72fr_0.72fr] gap-3 border-b border-border bg-surface-muted px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:grid">
                <span>Patient and Test</span>
                <span>Department</span>
                <span>Order Details</span>
                <span>Status</span>
                <span className="text-right">Availability</span>
              </div>

              {table.getRowModel().rows.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <div className="text-sm font-semibold text-foreground">No history found</div>
                  <p className="mt-1 text-xs text-muted-foreground">Choose another date or clear the custom date filter.</p>
                </div>
              ) : (
                table.getRowModel().rows.map((row) => {
                  const result = row.original;

                  return (
                    <button
                      className={cn(
                        "grid w-full gap-3 border-b border-border px-4 py-4 text-left transition last:border-b-0 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:grid-cols-[1.15fr_0.8fr_1fr_0.72fr_0.72fr] lg:items-center",
                        selectedId === result.id && "bg-primary/5 ring-1 ring-inset ring-primary/25",
                      )}
                      key={`date-history-${result.id}`}
                      onClick={() => onSelect(result)}
                      type="button"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">{result.patientName}</span>
                        <span className="mt-1 block truncate text-xs text-muted-foreground">
                          {result.mrn} | {result.ageSex} | {result.testName}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">{result.id}</span>
                      </span>
                      <span className="min-w-0 text-sm">
                        <span className="block capitalize text-foreground">{result.department}</span>
                        <span className="mt-1 block truncate text-xs text-muted-foreground">{result.location}</span>
                      </span>
                      <span className="min-w-0 text-sm text-muted-foreground">
                        <span className="block truncate">{formatDateTime(result.orderedAt)}</span>
                        <span className="mt-1 block truncate text-xs">{result.orderingDoctor}</span>
                      </span>
                      <span className="flex flex-wrap gap-2">
                        <Badge tone={statusTone[result.status]}>{result.status}</Badge>
                        <Badge tone={priorityTone[result.priority]}>{result.priority}</Badge>
                      </span>
                      <span className="flex justify-start gap-2 lg:justify-end">
                        <AvailabilityIcon active={result.reportAvailable} label="Report" icon="report" />
                        {result.department !== "laboratory" ? <AvailabilityIcon active={result.imageAvailable} label="Image" icon="image" /> : null}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="border-t border-border bg-surface-muted p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-sm font-semibold text-primary">
                  {currentPage}
                </span>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    Showing {pageStart} to {pageEnd} of {totalCount} records
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    Page {currentPage} of {pageCount} | Date wise history
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Rows per page</span>
                  {[5, 10].map((size) => (
                    <Button
                      aria-label={`${size} rows per page`}
                      key={size}
                      onClick={() => {
                        table.setPageSize(size);
                        table.setPageIndex(0);
                      }}
                      size="sm"
                      type="button"
                      variant={pageSize === size ? "default" : "ghost"}
                    >
                      {size}
                    </Button>
                  ))}
                </div>
                <Button
                  aria-label="Go to first date wise page"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.setPageIndex(0)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <ChevronsLeft className="h-4 w-4" />
                  First Page
                </Button>
                <Button
                  aria-label="Go to previous date wise page"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous Page
                </Button>
                <Button
                  aria-label="Go to next date wise page"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Next Page
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  aria-label="Go to last date wise page"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.setPageIndex(pageCount - 1)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Last Page
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PreviewTab({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-9 rounded-md px-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-45",
        active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-background",
      )}
    >
      {children}
    </button>
  );
}

function LaboratoryWorkflowActions({
  result,
  onAdvance,
  onRelease,
}: {
  result: ResultRecord;
  onAdvance: () => void;
  onRelease: () => void;
}) {
  const nextStatus = getNextLaboratoryStatus(result.status);

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Laboratory workflow</div>
          <div className="mt-1 text-sm font-semibold text-foreground">{result.status}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            {nextStatus ? `Next step: ${nextStatus}` : "Result is ready for report viewing and delivery."}
          </p>
        </div>
        <Badge tone={statusTone[result.status]}>{result.status}</Badge>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Button onClick={onAdvance} disabled={!nextStatus || result.status === "Critical"}>
          <CheckCircle2 className="h-4 w-4" />
          {getLaboratoryActionLabel(result.status)}
        </Button>
        <Button variant="outline" onClick={onRelease} disabled={result.status === "Critical"}>
          <FileText className="h-4 w-4" />
          Mark Report Ready
        </Button>
      </div>
    </div>
  );
}

function AvailabilityIcon({ active, label, icon }: { active: boolean; label: string; icon: "report" | "image" }) {
  const Icon = icon === "report" ? FileText : ImageIcon;

  return (
    <span
      className={cn(
        "inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs font-medium",
        active ? "border-success/30 bg-success/10 text-success" : "border-border bg-background text-muted-foreground",
      )}
      title={`${label} ${active ? "available" : "not available"}`}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

function SummaryPanel({ result }: { result: ResultRecord }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-background p-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Selected test</div>
        <div className="mt-1 text-sm font-semibold text-foreground">{result.testName}</div>
        <p className="mt-2 text-sm text-muted-foreground">{result.resultSummary}</p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
        <InfoRow label="Order" value={result.id} />
        <InfoRow label="Doctor" value={result.orderingDoctor} />
        <InfoRow label="Ordered at" value={formatDateTime(result.orderedAt)} />
        <InfoRow label="Completed at" value={formatDateTime(result.completedAt)} />
        <InfoRow label="Location" value={result.location} />
        <InfoRow label="Specimen / Accession" value={result.specimen ?? result.accessionNo ?? "-"} />
      </div>

      <ResultValues result={result} />
    </div>
  );
}

function ResultValues({ result }: { result: ResultRecord }) {
  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Result values</div>
      <div className="overflow-hidden rounded-lg border border-border">
        {result.values.map((value) => (
          <div className="grid grid-cols-[1fr_auto] gap-3 border-b border-border px-3 py-2 last:border-b-0" key={`${result.id}-${value.name}`}>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-foreground">{value.name}</div>
              <div className="text-xs text-muted-foreground">{value.range ? `Range ${value.range}` : "Reference not applicable"}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-foreground">
                {value.value} {value.unit ?? ""}
              </div>
              {value.flag ? <Badge tone={value.flag === "Critical" ? "critical" : value.flag === "Normal" ? "success" : "warning"}>{value.flag}</Badge> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportPanel({ result }: { result: ResultRecord }) {
  if (!result.reportAvailable) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center">
        <FileText className="mx-auto h-7 w-7 text-muted-foreground" />
        <div className="mt-2 text-sm font-semibold text-foreground">Report is not ready</div>
        <p className="mt-1 text-xs text-muted-foreground">The result is still processing or awaiting verification.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="text-sm font-semibold text-foreground">Plasmit Hospital</div>
          <div className="text-xs text-muted-foreground">Diagnostic Result Report</div>
        </div>
        <Badge tone={statusTone[result.status]}>{result.status}</Badge>
      </div>
      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <InfoLine label="Patient" value={`${result.patientName} (${result.mrn})`} />
        <InfoLine label="Visit" value={`${result.ageSex} | ${result.visitType}`} />
        <InfoLine label="Test" value={result.testName} />
        <InfoLine label="Doctor" value={result.orderingDoctor} />
      </div>
      <div className="rounded-md border border-border bg-surface-muted p-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Interpretation</div>
        <p className="mt-1 text-sm text-foreground">{result.resultSummary}</p>
      </div>
      <ResultValues result={result} />
      <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span>Electronically verified report</span>
        <span>{formatDateTime(result.completedAt)}</span>
      </div>
    </div>
  );
}

function ImagePanel({ result }: { result: ResultRecord }) {
  if (!result.imageAvailable) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center">
        <ImageIcon className="mx-auto h-7 w-7 text-muted-foreground" />
        <div className="mt-2 text-sm font-semibold text-foreground">Images are not available</div>
        <p className="mt-1 text-xs text-muted-foreground">PACS image preview will appear after the study is completed and synced.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="aspect-[4/3] overflow-hidden rounded-lg border border-slate-800 bg-slate-950 p-3 text-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>{result.accessionNo ?? result.id}</span>
          <span>{result.testName}</span>
        </div>
        <div className="mt-3 grid h-[calc(100%-2rem)] place-items-center rounded-md border border-slate-700 bg-[linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:22px_22px]">
          <div className="rounded-md border border-slate-600 bg-slate-900/85 px-4 py-3 text-center">
            <ImageIcon className="mx-auto h-8 w-8 text-slate-300" />
            <div className="mt-2 text-sm font-semibold">PACS image preview</div>
            <div className="mt-1 text-xs text-slate-400">Series available for clinical viewing</div>
          </div>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        <InfoRow label="Accession" value={result.accessionNo ?? "-"} />
        <InfoRow label="Study" value={result.testName} />
        <InfoRow label="Location" value={result.location} />
      </div>
    </div>
  );
}

function AuditPanel({ result, acknowledged, ackNote }: { result: ResultRecord; acknowledged: boolean; ackNote: string }) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Timeline</div>
        {result.timeline.map((event) => (
          <div className="flex gap-3 rounded-lg border border-border bg-background p-3" key={`${result.id}-${event.label}`}>
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground">{event.label}</div>
              <div className="text-xs text-muted-foreground">
                {event.at} | {event.by}
              </div>
            </div>
          </div>
        ))}
        {acknowledged ? (
          <div className="flex gap-3 rounded-lg border border-success/30 bg-success/10 p-3">
            <ClipboardCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground">Critical acknowledgement recorded</div>
              <div className="text-xs text-muted-foreground">{ackNote || "Acknowledgement note saved in the audit trail."}</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
