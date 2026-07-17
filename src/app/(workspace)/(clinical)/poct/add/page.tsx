import { redirect } from "next/navigation";

export default function Page() {
  redirect("/doctor-ipd/patients/1?tab=orders&poct=add");
}
