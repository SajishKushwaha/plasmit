import { RadiologyCreateOrderView } from "@/features/diagnostics/radiology/components/RadiologyCreateOrderView";
import { radiologyPatients } from "@/features/diagnostics/radiology/data/patients";
import { radiologyTests } from "@/features/diagnostics/radiology/data/tests";

export default function CreateRadiologyOrderPage() {
  return <RadiologyCreateOrderView patients={radiologyPatients} tests={radiologyTests} />;
}
