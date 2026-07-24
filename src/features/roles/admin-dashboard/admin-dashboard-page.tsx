"use client";

import * as React from "react";
import { Building2, Edit3, Palette, Plus, Save, ShieldCheck, Trash2, UserCog, Users } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockDepartments, mockHospitalProfile, mockRoles, mockUsers } from "@/data/admin";
import type { AdminRoleRecord, DepartmentRecord, Role, UserRecord } from "@/types";

type DepartmentForm = Pick<DepartmentRecord, "name" | "code" | "type" | "head" | "location" | "status">;
type UserForm = { name: string; email: string; mobile: string; roleId: string; departmentId: string };
type RoleForm = { name: string; description: string; departmentScope: string; status: "Active" | "Inactive" };
type BrandingForm = { name: string; shortName: string; phone: string; email: string; website: string; primaryColor: string; logoText: string };

const emptyDepartment: DepartmentForm = { name: "", code: "", type: "Clinical", head: "", location: "", status: "Active" };
const emptyRole: RoleForm = { name: "", description: "", departmentScope: "Mapped department", status: "Active" };

function makeDepartment(form: DepartmentForm): DepartmentRecord {
  const code = form.code.trim().toUpperCase();
  return {
    id: `dept-${code.toLowerCase() || Date.now()}`,
    code,
    name: form.name.trim(),
    type: form.type,
    head: form.head.trim(),
    location: form.location.trim(),
    users: 0,
    status: form.status,
    enabledWorkflows: ["OPD", "IPD"],
    branch: "Plasmit Main Hospital",
    floor: form.location.trim() || "Not mapped",
    roomWing: form.location.trim() || "Not mapped",
    contactNumber: mockHospitalProfile.phone,
    email: `${code.toLowerCase() || "department"}@plasmit.care`,
    totalDoctors: 0,
    assignedDoctorIds: [],
    opdTiming: "09:00-18:00",
    workingDays: "Mon-Sat",
    emergencyAvailable: false,
    emergencyContactDoctor: form.head.trim() || "Not mapped",
    patientCapacityPerDay: 0,
    servicesOffered: ["OPD"],
    feeRange: "Not configured",
    linkedServices: ["Billing"],
  };
}

function makeRole(form: RoleForm): AdminRoleRecord {
  return {
    id: `role-${form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || Date.now()}`,
    name: form.name.trim() as Role,
    type: "Custom",
    description: form.description.trim(),
    departmentScope: form.departmentScope.trim(),
    status: form.status,
    userCount: 0,
    modulesAllowed: 1,
    permissionCount: 8,
    protected: false,
    risk: "Medium",
    updatedAt: "Just now",
  };
}

export function AdminDashboardPage() {
  const [departments, setDepartments] = React.useState<DepartmentRecord[]>(mockDepartments);
  const [users, setUsers] = React.useState<UserRecord[]>(mockUsers);
  const [roles, setRoles] = React.useState<AdminRoleRecord[]>(mockRoles);
  const [departmentForm, setDepartmentForm] = React.useState<DepartmentForm>(emptyDepartment);
  const [editingDepartmentId, setEditingDepartmentId] = React.useState<string | null>(null);
  const [userForm, setUserForm] = React.useState<UserForm>({
    name: "",
    email: "",
    mobile: "",
    roleId: "role-doctor",
    departmentId: "dept-card",
  });
  const [roleForm, setRoleForm] = React.useState<RoleForm>(emptyRole);
  const [editingRoleId, setEditingRoleId] = React.useState<string | null>(null);
  const [branding, setBranding] = React.useState<BrandingForm>({
    name: mockHospitalProfile.name,
    shortName: mockHospitalProfile.shortName,
    phone: mockHospitalProfile.phone,
    email: mockHospitalProfile.email,
    website: mockHospitalProfile.website,
    primaryColor: "#5b8def",
    logoText: "PLASMIT",
  });

  const roleOptions = roles.filter((role) => ["Doctor", "Doctor IPD", "Nurse", "Receptionist", "Admin"].includes(role.name));
  const activeDepartments = departments.filter((department) => department.status === "Active").length;

  function departmentName(id: string) {
    return departments.find((department) => department.id === id)?.name ?? "Unassigned";
  }

  function roleName(id: string) {
    return roles.find((role) => role.id === id)?.name ?? "Unassigned";
  }

  function saveDepartment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!departmentForm.name.trim() || !departmentForm.code.trim()) {
      toast.error("Department name and code required");
      return;
    }
    const nextDepartment = makeDepartment(departmentForm);
    if (editingDepartmentId) {
      setDepartments((current) => current.map((department) => department.id === editingDepartmentId ? { ...department, ...nextDepartment, id: department.id, users: department.users } : department));
      toast.success("Department updated");
    } else {
      setDepartments((current) => [nextDepartment, ...current]);
      toast.success("Department created");
    }
    setDepartmentForm(emptyDepartment);
    setEditingDepartmentId(null);
  }

  function saveUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userForm.name.trim() || !userForm.email.trim()) {
      toast.error("User name and email required");
      return;
    }
    setUsers((current) => [
      {
        id: `user-${Date.now()}`,
        employeeCode: `EMP-${Math.floor(1000 + Math.random() * 8999)}`,
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        mobile: userForm.mobile.trim() || "-",
        roleIds: [userForm.roleId],
        departmentIds: [userForm.departmentId],
        designation: String(roleName(userForm.roleId)),
        status: "Invited",
        lastLoginAt: "Invite pending",
        locked: false,
        failedLogins: 0,
      },
      ...current,
    ]);
    setUserForm({ name: "", email: "", mobile: "", roleId: "role-doctor", departmentId: departments[0]?.id ?? "dept-card" });
    toast.success("User created role wise");
  }

  function saveRole(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!roleForm.name.trim()) {
      toast.error("Role name required");
      return;
    }
    const nextRole = makeRole(roleForm);
    if (editingRoleId) {
      setRoles((current) => current.map((role) => role.id === editingRoleId ? { ...role, ...nextRole, id: role.id, protected: role.protected, type: role.type } : role));
      toast.success("Role updated");
    } else {
      setRoles((current) => [nextRole, ...current]);
      toast.success("Role created");
    }
    setRoleForm(emptyRole);
    setEditingRoleId(null);
  }

  return (
    <div className="space-y-5 py-5">
      <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Admin role</div>
            <h1 className="mt-2 text-2xl font-black text-slate-950">Admin Dashboard</h1>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Separate admin workspace for departments, users, roles, and organisation branding.</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Summary label="Departments" value={departments.length} />
            <Summary label="Users" value={users.length} />
            <Summary label="Roles" value={roles.length} />
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-4">
        <Metric icon={Building2} label="Active departments" value={activeDepartments} />
        <Metric icon={Users} label="Managed users" value={users.length} />
        <Metric icon={ShieldCheck} label="Active roles" value={roles.filter((role) => role.status === "Active").length} />
        <Metric icon={Palette} label="Branding" value={branding.shortName} />
      </div>

      <Tabs defaultValue="departments" className="space-y-4">
        <div className="horizontal-scrollbar max-w-full overflow-x-auto rounded-xl border border-border bg-white/95 p-1 pb-2 shadow-sm">
          <TabsList className="inline-flex h-auto w-max min-w-max rounded-lg bg-surface-muted/70 p-1">
            <AdminTab icon={Building2} label="Departments" value="departments" />
            <AdminTab icon={Users} label="Users" value="users" />
            <AdminTab icon={UserCog} label="Roles" value="roles" />
            <AdminTab icon={Palette} label="Settings" value="settings" />
          </TabsList>
        </div>

        <TabsContent value="departments">
          <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>{editingDepartmentId ? "Edit department" : "Create department"}</CardTitle>
                <CardDescription>Create, edit, delete department master records.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={saveDepartment}>
                  <TextField label="Department name" value={departmentForm.name} onChange={(name) => setDepartmentForm((form) => ({ ...form, name }))} />
                  <TextField label="Code" value={departmentForm.code} onChange={(code) => setDepartmentForm((form) => ({ ...form, code }))} />
                  <SelectField label="Type" value={departmentForm.type} onChange={(type) => setDepartmentForm((form) => ({ ...form, type: type as DepartmentRecord["type"] }))} options={["Clinical", "Diagnostic", "Administrative", "Support", "Finance", "Store"]} />
                  <TextField label="Head" value={departmentForm.head} onChange={(head) => setDepartmentForm((form) => ({ ...form, head }))} />
                  <TextField label="Location" value={departmentForm.location} onChange={(location) => setDepartmentForm((form) => ({ ...form, location }))} />
                  <SelectField label="Status" value={departmentForm.status} onChange={(status) => setDepartmentForm((form) => ({ ...form, status: status as DepartmentForm["status"] }))} options={["Active", "Inactive"]} />
                  <FormActions editing={Boolean(editingDepartmentId)} onCancel={() => { setEditingDepartmentId(null); setDepartmentForm(emptyDepartment); }} />
                </form>
              </CardContent>
            </Card>
            <ListCard title="Department list" description={`${departments.length} department(s)`}>
              <Table headers={["Name", "Code", "Type", "Head", "Status", "Action"]}>
                {departments.map((department) => (
                  <tr className="border-b border-border last:border-0" key={department.id}>
                    <Cell strong>{department.name}</Cell>
                    <Cell>{department.code}</Cell>
                    <Cell>{department.type}</Cell>
                    <Cell>{department.head}</Cell>
                    <Cell><Badge tone={department.status === "Active" ? "success" : "muted"}>{department.status}</Badge></Cell>
                    <Cell>
                      <RowActions
                        onEdit={() => {
                          setEditingDepartmentId(department.id);
                          setDepartmentForm({ name: department.name, code: department.code, type: department.type, head: department.head, location: department.location, status: department.status });
                        }}
                        onDelete={() => {
                          setDepartments((current) => current.filter((item) => item.id !== department.id));
                          toast.success("Department deleted");
                        }}
                      />
                    </Cell>
                  </tr>
                ))}
              </Table>
            </ListCard>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Create user</CardTitle>
                <CardDescription>Create users role wise: doctor, nurse, reception, and admin.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={saveUser}>
                  <TextField label="Name" value={userForm.name} onChange={(name) => setUserForm((form) => ({ ...form, name }))} />
                  <TextField label="Email / username" value={userForm.email} onChange={(email) => setUserForm((form) => ({ ...form, email }))} />
                  <TextField label="Mobile" value={userForm.mobile} onChange={(mobile) => setUserForm((form) => ({ ...form, mobile }))} />
                  <SelectField label="Role" value={userForm.roleId} onChange={(roleId) => setUserForm((form) => ({ ...form, roleId }))} options={roleOptions.map((role) => role.id)} optionLabel={(id) => String(roleName(id))} />
                  <SelectField label="Department" value={userForm.departmentId} onChange={(departmentId) => setUserForm((form) => ({ ...form, departmentId }))} options={departments.map((department) => department.id)} optionLabel={departmentName} />
                  <Button className="w-full" type="submit"><Plus className="h-4 w-4" />Create user</Button>
                </form>
              </CardContent>
            </Card>
            <ListCard title="User management" description={`${users.length} user(s)`}>
              <Table headers={["User", "Role", "Department", "Status", "Action"]}>
                {users.map((user) => (
                  <tr className="border-b border-border last:border-0" key={user.id}>
                    <Cell strong><div>{user.name}</div><div className="text-xs font-medium text-muted-foreground">{user.email}</div></Cell>
                    <Cell>{String(roleName(user.roleIds[0]))}</Cell>
                    <Cell>{departmentName(user.departmentIds[0])}</Cell>
                    <Cell><Badge tone={user.locked ? "danger" : user.status === "Invited" ? "info" : "success"}>{user.locked ? "Locked" : user.status}</Badge></Cell>
                    <Cell>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => setUsers((current) => current.map((item) => item.id === user.id ? { ...item, locked: !item.locked, status: item.locked ? "Active" : "Locked" } : item))}>{user.locked ? "Unlock" : "Lock"}</Button>
                        <Button size="sm" variant="ghost" onClick={() => setUsers((current) => current.filter((item) => item.id !== user.id))}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </Cell>
                  </tr>
                ))}
              </Table>
            </ListCard>
          </div>
        </TabsContent>

        <TabsContent value="roles">
          <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>{editingRoleId ? "Edit role" : "Create role"}</CardTitle>
                <CardDescription>Manage roles and department scope.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={saveRole}>
                  <TextField label="Role name" value={roleForm.name} onChange={(name) => setRoleForm((form) => ({ ...form, name }))} />
                  <TextField label="Description" value={roleForm.description} onChange={(description) => setRoleForm((form) => ({ ...form, description }))} />
                  <TextField label="Department scope" value={roleForm.departmentScope} onChange={(departmentScope) => setRoleForm((form) => ({ ...form, departmentScope }))} />
                  <SelectField label="Status" value={roleForm.status} onChange={(status) => setRoleForm((form) => ({ ...form, status: status as RoleForm["status"] }))} options={["Active", "Inactive"]} />
                  <FormActions editing={Boolean(editingRoleId)} onCancel={() => { setEditingRoleId(null); setRoleForm(emptyRole); }} />
                </form>
              </CardContent>
            </Card>
            <ListCard title="Role management" description={`${roles.length} role(s)`}>
              <Table headers={["Role", "Type", "Scope", "Status", "Action"]}>
                {roles.map((role) => (
                  <tr className="border-b border-border last:border-0" key={role.id}>
                    <Cell strong><div>{role.name}</div><div className="max-w-md text-xs font-medium text-muted-foreground">{role.description}</div></Cell>
                    <Cell>{role.protected ? <Badge tone="warning">Protected</Badge> : <Badge tone="info">{role.type}</Badge>}</Cell>
                    <Cell>{role.departmentScope}</Cell>
                    <Cell><Badge tone={role.status === "Active" ? "success" : "muted"}>{role.status}</Badge></Cell>
                    <Cell>
                      <RowActions
                        disabled={role.protected}
                        onEdit={() => {
                          setEditingRoleId(role.id);
                          setRoleForm({ name: role.name, description: role.description, departmentScope: role.departmentScope, status: role.status });
                        }}
                        onDelete={() => {
                          setRoles((current) => current.filter((item) => item.id !== role.id));
                          toast.success("Role deleted");
                        }}
                      />
                    </Cell>
                  </tr>
                ))}
              </Table>
            </ListCard>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid gap-4 xl:grid-cols-[420px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Organisation branding</CardTitle>
                <CardDescription>Manage organisation name, logo text, contact, and primary color.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); toast.success("Organisation branding saved"); }}>
                  <TextField label="Organisation name" value={branding.name} onChange={(name) => setBranding((form) => ({ ...form, name }))} />
                  <TextField label="Short name" value={branding.shortName} onChange={(shortName) => setBranding((form) => ({ ...form, shortName }))} />
                  <TextField label="Logo text" value={branding.logoText} onChange={(logoText) => setBranding((form) => ({ ...form, logoText }))} />
                  <TextField label="Phone" value={branding.phone} onChange={(phone) => setBranding((form) => ({ ...form, phone }))} />
                  <TextField label="Email" value={branding.email} onChange={(email) => setBranding((form) => ({ ...form, email }))} />
                  <TextField label="Website" value={branding.website} onChange={(website) => setBranding((form) => ({ ...form, website }))} />
                  <label className="block space-y-1 text-sm font-semibold text-slate-700">
                    <span>Primary color</span>
                    <Input type="color" value={branding.primaryColor} onChange={(event) => setBranding((form) => ({ ...form, primaryColor: event.target.value }))} className="h-11 p-1" />
                  </label>
                  <Button className="w-full" type="submit"><Save className="h-4 w-4" />Save settings</Button>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Brand preview</CardTitle>
                <CardDescription>Admin login: hospital_admin@gmail.com / admin123</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border border-border bg-slate-50 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-black text-white" style={{ backgroundColor: branding.primaryColor }}>
                      {branding.logoText.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xl font-black text-slate-950">{branding.name}</div>
                      <div className="text-sm font-semibold text-muted-foreground">{branding.shortName}</div>
                      <div className="mt-1 text-xs font-medium text-muted-foreground">{branding.phone} | {branding.email}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-xl border border-border bg-slate-50 px-4 py-3"><div className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</div><div className="mt-1 text-lg font-black text-slate-950">{value}</div></div>;
}

function Metric({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: React.ReactNode }) {
  return <Card><CardContent className="flex items-center gap-3 p-4"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary"><Icon className="h-5 w-5" /></div><div><div className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</div><div className="text-xl font-black text-slate-950">{value}</div></div></CardContent></Card>;
}

function AdminTab({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <TabsTrigger
      className="h-10 min-w-[132px] shrink-0 rounded-lg bg-transparent px-3 text-sm font-bold text-slate-600 hover:bg-white/70 hover:text-slate-900 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
      value={value}
    >
      <span className="inline-flex min-w-0 items-center justify-center gap-2 whitespace-nowrap">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
    </TabsTrigger>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block space-y-1 text-sm font-semibold text-slate-700"><span>{label}</span><Input value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function SelectField({ label, value, onChange, options, optionLabel }: { label: string; value: string; onChange: (value: string) => void; options: string[]; optionLabel?: (value: string) => string }) {
  return (
    <label className="block space-y-1 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <select className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-ring/25" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{optionLabel ? optionLabel(option) : option}</option>)}
      </select>
    </label>
  );
}

function FormActions({ editing, onCancel }: { editing: boolean; onCancel: () => void }) {
  return <div className="flex gap-2 pt-1"><Button className="flex-1" type="submit">{editing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}{editing ? "Update" : "Create"}</Button>{editing ? <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button> : null}</div>;
}

function ListCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent>{children}</CardContent></Card>;
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-slate-50 text-xs uppercase text-muted-foreground"><tr>{headers.map((header) => <th className="px-3 py-3 text-left font-black" key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function Cell({ children, strong }: { children: React.ReactNode; strong?: boolean }) {
  return <td className={strong ? "px-3 py-3 font-bold text-slate-900" : "px-3 py-3 font-semibold text-slate-600"}>{children}</td>;
}

function RowActions({ onEdit, onDelete, disabled }: { onEdit: () => void; onDelete: () => void; disabled?: boolean }) {
  return <div className="flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={onEdit} disabled={disabled}><Edit3 className="h-3.5 w-3.5" />Edit</Button><Button size="sm" variant="ghost" onClick={onDelete} disabled={disabled}><Trash2 className="h-3.5 w-3.5" />Delete</Button></div>;
}
