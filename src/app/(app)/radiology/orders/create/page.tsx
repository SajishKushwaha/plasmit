import { RadiologyCreateOrderView } from "@/features/radiology/components/RadiologyCreateOrderView";
import { radiologyPatients } from "@/features/radiology/data/patients";
import { radiologyTests } from "@/features/radiology/data/tests";

export default function CreateRadiologyOrderPage() {
  return <RadiologyCreateOrderView patients={radiologyPatients} tests={radiologyTests} />;
}
