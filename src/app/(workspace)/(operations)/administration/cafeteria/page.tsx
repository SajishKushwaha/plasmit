import { mockCafeteria } from "@/data/phase11";
import { Phase11SimplePage } from "@/features/platform/phase11/phase11-pages";

export default function Page() {
  return (
    <Phase11SimplePage
      module="administration"
      title="Cafeteria Management"
      description="Menu, orders, patient diet warning placeholders, delivery, cancellation, billing placeholder, and print slips."
      records={mockCafeteria}
    />
  );
}
