"use client";

import { useMemo, useState } from "react";
import { LayoutTemplate, Search, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModalityBadge } from "@/features/diagnostics/radiology/components/ModalityBadge";
import { RadiologyStatsCard } from "@/features/diagnostics/radiology/components/RadiologyStatsCard";
import { radiologyModalities } from "@/features/diagnostics/radiology/data/modalities";
import { radiologists } from "@/features/diagnostics/radiology/data/radiologists";
import { reportTemplates } from "@/features/diagnostics/radiology/data/reports";
import { radiologyTechnicians } from "@/features/diagnostics/radiology/data/technicians";
import { radiologyTests } from "@/features/diagnostics/radiology/data/tests";
import { formatCurrency } from "@/features/diagnostics/radiology/utils/formatters";

function ConfigurationFilter({
  search,
  modalityId,
  onSearchChange,
  onModalityChange,
}: {
  search: string;
  modalityId: string;
  onSearchChange: (value: string) => void;
  onModalityChange: (value: string) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1.4fr_1fr]">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search name, code, room, staff, specialization"
            value={search}
          />
        </label>
        <select
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          onChange={(event) => onModalityChange(event.target.value)}
          value={modalityId}
        >
          <option value="ALL">All modalities</option>
          {radiologyModalities.map((modality) => (
            <option key={modality.id} value={modality.id}>
              {modality.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function RadiologyReportTemplatesView() {
  type ReportTemplate = (typeof reportTemplates)[number];
  const [templates, setTemplates] = useState<ReportTemplate[]>(reportTemplates);
  const [search, setSearch] = useState("");
  const [modalityId, setModalityId] = useState("ALL");
  const [selectedTemplateId, setSelectedTemplateId] = useState(reportTemplates[0]?.id ?? "");
  const [sectionName, setSectionName] = useState("");

  const filteredTemplates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return templates.filter((template) => {
      const matchesModality = modalityId === "ALL" || template.modalityId === modalityId;
      const text = [template.name, template.lastUpdated, ...template.sections].join(" ").toLowerCase();
      const matchesSearch = normalizedSearch.length === 0 || text.includes(normalizedSearch);

      return matchesModality && matchesSearch;
    });
  }, [modalityId, search, templates]);

  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId) ?? filteredTemplates[0];

  function duplicateTemplate(template: ReportTemplate) {
    const copyNumber = templates.filter((item) => item.id.startsWith(`${template.id}-copy`)).length + 1;
    const duplicateId = `${template.id}-copy-${copyNumber}`;
    const duplicate = {
      ...template,
      id: duplicateId,
      name: `${template.name} Copy ${copyNumber}`,
      lastUpdated: "Local draft",
    };
    setTemplates((current) => [duplicate, ...current]);
    setSelectedTemplateId(duplicateId);
  }

  function addSection() {
    const trimmedSectionName = sectionName.trim();
    if (!selectedTemplate || trimmedSectionName.length === 0) {
      return;
    }

    setTemplates((current) =>
      current.map((template) =>
        template.id === selectedTemplate.id
          ? { ...template, sections: [...template.sections, trimmedSectionName], lastUpdated: "Local draft" }
          : template,
      ),
    );
    setSectionName("");
  }

  function removeSection(section: string) {
    if (!selectedTemplate) {
      return;
    }

    setTemplates((current) =>
      current.map((template) =>
        template.id === selectedTemplate.id
          ? { ...template, sections: template.sections.filter((item) => item !== section), lastUpdated: "Local draft" }
          : template,
      ),
    );
  }

  return (
    <div className="space-y-5">
      <RadiologyStatsCard icon={<LayoutTemplate className="h-5 w-5" />} subtext="Filtered structured reporting templates" title="Templates" value={filteredTemplates.length} />
      <ConfigurationFilter modalityId={modalityId} onModalityChange={setModalityId} onSearchChange={setSearch} search={search} />
      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-4">
          {filteredTemplates.map((template) => (
          <article
            className={[
              "rounded-lg border bg-surface p-4 shadow-sm",
              selectedTemplate?.id === template.id ? "border-primary ring-2 ring-primary/15" : "border-border",
            ].join(" ")}
            key={template.id}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-foreground">{template.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">Updated {template.lastUpdated}</p>
              </div>
              <ModalityBadge modalityId={template.modalityId} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {template.sections.map((section) => (
                <span className="rounded-full border border-border bg-surface-muted px-2.5 py-1 text-xs text-muted-foreground" key={section}>
                  {section}
                </span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={() => setSelectedTemplateId(template.id)} size="sm" variant="outline">
                Select
              </Button>
              <Button onClick={() => duplicateTemplate(template)} size="sm" variant="outline">
                Duplicate
              </Button>
            </div>
          </article>
          ))}
        </div>
        <aside className="rounded-lg border border-border bg-surface p-4 shadow-sm">
          {selectedTemplate ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">{selectedTemplate.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Template builder preview. Add or remove sections for the selected template here.</p>
                </div>
                <ModalityBadge modalityId={selectedTemplate.modalityId} />
              </div>
              <div className="mt-4 space-y-2">
                {selectedTemplate.sections.map((section) => (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-muted px-3 py-2 text-sm" key={section}>
                    <span className="font-medium text-foreground">{section}</span>
                    <Button onClick={() => removeSection(section)} size="sm" variant="ghost">
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <input
                  className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                  onChange={(event) => setSectionName(event.target.value)}
                  placeholder="New section name"
                  value={sectionName}
                />
                <Button onClick={addSection} type="button">
                  Add
                </Button>
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Select a template to edit sections.</div>
          )}
        </aside>
      </section>
    </div>
  );
}

export function RadiologyMastersView() {
  const [search, setSearch] = useState("");
  const [modalityId, setModalityId] = useState("ALL");

  const normalizedSearch = search.trim().toLowerCase();
  const filteredModalities = radiologyModalities.filter((modality) => {
    const matchesModality = modalityId === "ALL" || modality.id === modalityId;
    const matchesSearch = [modality.name, modality.code, modality.room, modality.machine, modality.location].join(" ").toLowerCase().includes(normalizedSearch);
    return matchesModality && (normalizedSearch.length === 0 || matchesSearch);
  });
  const filteredTests = radiologyTests.filter((test) => {
    const matchesModality = modalityId === "ALL" || test.modalityId === modalityId;
    const matchesSearch = [test.name, test.code, test.bodyPart, test.preparation].join(" ").toLowerCase().includes(normalizedSearch);
    return matchesModality && (normalizedSearch.length === 0 || matchesSearch);
  });
  const filteredTechnicians = radiologyTechnicians.filter((technician) => {
    const matchesModality = modalityId === "ALL" || technician.modalities.includes(modalityId);
    const matchesSearch = [technician.name, technician.shift, technician.phone, technician.status].join(" ").toLowerCase().includes(normalizedSearch);
    return matchesModality && (normalizedSearch.length === 0 || matchesSearch);
  });
  const filteredRadiologists = radiologists.filter((radiologist) => {
    const matchesModality = modalityId === "ALL" || radiologist.modalities.includes(modalityId);
    const matchesSearch = [radiologist.name, radiologist.specialization, radiologist.shift, radiologist.status].join(" ").toLowerCase().includes(normalizedSearch);
    return matchesModality && (normalizedSearch.length === 0 || matchesSearch);
  });

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-surface p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold text-foreground">Radiology Masters</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">Filter modalities, tests, technicians, and radiologist roster configuration.</p>
      </section>
      <ConfigurationFilter modalityId={modalityId} onModalityChange={setModalityId} onSearchChange={setSearch} search={search} />
      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">Modalities ({filteredModalities.length})</h2>
          <div className="mt-3 space-y-3">
            {filteredModalities.map((modality) => (
              <div className="rounded-lg border border-border bg-surface-muted p-3 text-sm" key={modality.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{modality.name}</p>
                  <ModalityBadge modalityId={modality.id} />
                </div>
                <p className="mt-1 text-muted-foreground">{modality.room} - {modality.machine}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">Tests ({filteredTests.length})</h2>
          <div className="mt-3 space-y-3">
            {filteredTests.map((test) => (
              <div className="rounded-lg border border-border bg-surface-muted p-3 text-sm" key={test.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-foreground">{test.name}</p>
                  <span className="font-semibold text-foreground">{formatCurrency(test.price)}</span>
                </div>
                <p className="mt-1 text-muted-foreground">{test.code} - {test.durationMinutes} min - TAT {test.reportingTatMinutes} min</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">Technicians ({filteredTechnicians.length})</h2>
          <div className="mt-3 grid gap-3">
            {filteredTechnicians.map((technician) => (
              <div className="rounded-lg border border-border bg-surface-muted p-3 text-sm" key={technician.id}>
                <p className="font-medium text-foreground">{technician.name}</p>
                <p className="text-muted-foreground">{technician.shift} - {technician.status}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
          <h2 className="text-base font-semibold text-foreground">Radiologists ({filteredRadiologists.length})</h2>
          <div className="mt-3 grid gap-3">
            {filteredRadiologists.map((radiologist) => (
              <div className="rounded-lg border border-border bg-surface-muted p-3 text-sm" key={radiologist.id}>
                <p className="font-medium text-foreground">{radiologist.name}</p>
                <p className="text-muted-foreground">{radiologist.specialization} - {radiologist.status}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
