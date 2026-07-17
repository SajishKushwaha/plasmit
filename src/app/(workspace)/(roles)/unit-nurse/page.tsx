import { redirect } from "next/navigation";

export default function UnitNurseRoute() {
  redirect("/icu-command-center/nursing/assigned-patients");
}
