import { mockLaundry } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return (
    <Phase11SimplePage
      module="administration"
      title="Laundry Management"
      description="Laundry requests, collection, processing, delivery, lost/damaged state, infectious linen warning, and print placeholders."
      records={mockLaundry}
    />
  );
}
