import { SimpleIpdPage } from "@/features/clinical/ipd/ipd-pages";
import { mockDoctorRounds } from "@/data/ipd";

export default function Page() {
  return (
    <SimpleIpdPage
      title="Doctor Rounds"
      description="Round notes, plan updates, review status, and order placeholders."
      rows={mockDoctorRounds}
    />
  );
}
