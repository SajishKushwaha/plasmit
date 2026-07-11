import { SimpleIpdPage } from "@/features/clinical/ipd/ipd-pages";
import { mockDischarges } from "@/data/ipd";

export default function Page() {
  return <SimpleIpdPage title="Discharge" description="Checklist, summary, billing placeholder, approval, delay/LAMA/deceased states, and print." rows={mockDischarges} />;
}
