import { redirect } from "next/navigation";

export default function Page() {
  redirect("/doctor-dashboard1/patients/1?tab=Poct&poct=add");
}
