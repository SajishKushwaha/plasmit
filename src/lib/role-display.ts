import type { Role } from "@/types";

export function getRoleDisplayName(role: Role) {
  return role === "ICU" ? "ICU Admin" : role;
}
