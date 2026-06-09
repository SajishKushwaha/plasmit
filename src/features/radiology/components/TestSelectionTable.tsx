import type { RadiologyTest } from "@/features/radiology/types";
import { formatCurrency } from "@/features/radiology/utils/formatters";
import { ModalityBadge } from "@/features/radiology/components/ModalityBadge";

interface TestSelectionTableProps {
  tests: RadiologyTest[];
  selectedIds?: string[];
}

export function TestSelectionTable({ tests, selectedIds = [] }: TestSelectionTableProps) {
  if (tests.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        No radiology tests are configured for the selected filters.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          <tr>
            <th className="w-12 px-4 py-3">Select</th>
            <th className="px-4 py-3">Test</th>
            <th className="px-4 py-3">Modality</th>
            <th className="px-4 py-3">Preparation</th>
            <th className="px-4 py-3 text-right">Price</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tests.map((test) => (
            <tr className="hover:bg-slate-50" key={test.id}>
              <td className="px-4 py-3">
                <input
                  aria-label={`Select ${test.name}`}
                  checked={selectedIds.includes(test.id)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-700 focus:ring-sky-700"
                  readOnly
                  type="checkbox"
                />
              </td>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-950">{test.name}</p>
                <p className="text-xs text-slate-500">{test.code}</p>
              </td>
              <td className="px-4 py-3">
                <ModalityBadge modalityId={test.modalityId} />
              </td>
              <td className="max-w-md px-4 py-3 text-slate-600">{test.preparation}</td>
              <td className="px-4 py-3 text-right font-medium text-slate-900">{formatCurrency(test.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
