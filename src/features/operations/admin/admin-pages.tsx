"use client";

import * as React from "react";
import Image from "next/image";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Building2,
  CalendarDays,
  Check,
  Copy,
  Download,
  Eye,
  FileText,
  KeyRound,
  Lock,
  Plus,
  Printer,
  RefreshCcw,
  Save,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Upload,
  UserCog,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { StatCard } from "@/components/ui/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  mockAuditLogs,
  mockBranches,
  mockDepartments,
  mockDevices,
  mockDoctors,
  mockHospitalProfile,
  mockIpRules,
  mockMfaPolicy,
  mockPasswordPolicy,
  mockPermissions,
  mockRoles,
  mockSecuritySessions,
  mockUsers,
} from "@/data/admin";
import {
  AdminSection,
  ConfirmDrawer,
  DetailRow,
  DisabledFutureAction,
  DisabledReason,
  FilterBar,
  NativeSelect,
  ProtectedAdmin,
  RiskBadge,
  SecurityNote,
  StatusBadge,
  StickyActionBar,
  adminFullAccessRoles,
  adminReadOnlyRoles,
} from "@/features/operations/admin/admin-shared";
import type { AdminRoleRecord, AuditLog, BranchRecord, DepartmentRecord, DoctorRecord, PermissionRecord, Role, SecuritySession, TrustedDevice, UserRecord } from "@/types";

function textMatch(value: string, search: string) {
  return value.toLowerCase().includes(search.toLowerCase());
}

function pageToast(label: string) {
  toast.info(`${label} is reserved for backend integration`);
}

function SummaryGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{children}</div>;
}

function DrawerTabs({ children, defaultValue = "overview" }: { children: React.ReactNode; defaultValue?: string }) {
  return <Tabs defaultValue={defaultValue}>{children}</Tabs>;
}

export function RolesPage() {
  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState("All types");
  const [selected, setSelected] = React.useState<AdminRoleRecord | null>(null);
  const [confirm, setConfirm] = React.useState<AdminRoleRecord | null>(null);
  const filtered = mockRoles.filter((role) => textMatch(`${role.name} ${role.description} ${role.departmentScope}`, search) && (type === "All types" || role.type === type));

  const columns = React.useMemo<ColumnDef<AdminRoleRecord>[]>(() => [
    { header: "Role", cell: ({ row }) => <div><div className="font-medium">{row.original.name}</div><div className="text-xs text-muted-foreground">{row.original.description}</div></div> },
    { header: "Type", accessorKey: "type" },
    { header: "Users", accessorKey: "userCount" },
    { header: "Modules", accessorKey: "modulesAllowed" },
    { header: "Risk", cell: ({ row }) => <RiskBadge risk={row.original.risk} /> },
    { header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { header: "Actions", cell: ({ row }) => (
      <div className="flex gap-1">
        <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}><Eye className="h-3.5 w-3.5" />View</Button>
        <DisabledReason disabled={row.original.protected}><Button size="sm" variant="ghost" disabled={row.original.protected} onClick={() => setConfirm(row.original)}>Deactivate</Button></DisabledReason>
      </div>
    ) },
  ], []);

  return (
    <ProtectedAdmin>
      {({ readOnly }) => (
        <>
          <PageHeader
            eyebrow="Phase 2 • RBAC"
            title="Roles & Permissions"
            description="Create, duplicate, and govern protected system and custom hospital roles."
            actions={<><Button variant="outline" onClick={() => pageToast("Role export")}><Download className="h-4 w-4" />Export</Button><Button variant="outline" onClick={() => pageToast("Permission matrix")}><SlidersHorizontal className="h-4 w-4" />Matrix</Button><Button disabled={readOnly}><Plus className="h-4 w-4" />Create role</Button></>}
          />
          <SummaryGrid>
            <StatCard label="Total roles" value={mockRoles.length} icon={ShieldCheck} change="Configured" context="Static RBAC set" tone="info" />
            <StatCard label="Active roles" value={mockRoles.filter((role) => role.status === "Active").length} icon={Check} change="Current" context="Available roles" tone="success" />
            <StatCard label="System roles" value={mockRoles.filter((role) => role.type === "System").length} icon={Lock} change="Protected" context="Destructive edits locked" tone="warning" />
            <StatCard label="Custom roles" value={mockRoles.filter((role) => role.type === "Custom").length} icon={Copy} change="Editable" context="Can duplicate/edit" tone="info" />
          </SummaryGrid>
          <FilterBar search={search} onSearch={setSearch} placeholder="Search role, scope, description...">
            <NativeSelect label="Role type" value={type} onChange={setType} options={["All types", "System", "Custom"]} />
            <Button variant="outline" onClick={() => toast.success("Static role data refreshed")}><RefreshCcw className="h-4 w-4" />Refresh</Button>
          </FilterBar>
          <DataTable data={filtered} columns={columns} />
          <RoleDrawer role={selected} onOpenChange={(open) => !open && setSelected(null)} />
          <ConfirmDrawer open={Boolean(confirm)} onOpenChange={(open) => !open && setConfirm(null)} title="Deactivate role" target={confirm?.name ?? ""} action="Deactivate" />
        </>
      )}
    </ProtectedAdmin>
  );
}

function RoleDrawer({ role, onOpenChange }: { role: AdminRoleRecord | null; onOpenChange: (open: boolean) => void }) {
  return (
    <Drawer open={Boolean(role)} onOpenChange={onOpenChange} title={role?.name ?? "Role"} description="Role details, permissions, assigned users, and audit summary.">
      {role ? (
        <DrawerTabs>
          <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="permissions">Permissions</TabsTrigger><TabsTrigger value="users">Users</TabsTrigger><TabsTrigger value="audit">Audit</TabsTrigger></TabsList>
          <TabsContent value="overview">
            <DetailRow label="Type" value={role.type} />
            <DetailRow label="Scope" value={role.departmentScope} />
            <DetailRow label="Status" value={<StatusBadge status={role.status} />} />
            <DetailRow label="Protected" value={role.protected ? "System protected role" : "Editable custom role"} />
            <DetailRow label="Risk" value={<RiskBadge risk={role.risk} />} />
          </TabsContent>
          <TabsContent value="permissions" className="space-y-2">
            {mockPermissions.slice(0, 6).map((permission) => <PermissionLine key={permission.id} permission={permission} />)}
          </TabsContent>
          <TabsContent value="users" className="space-y-2">
            {mockUsers.filter((user) => user.roleIds.includes(role.id)).map((user) => <MiniRecord key={user.id} title={user.name} meta={`${user.designation} • ${user.status}`} />)}
          </TabsContent>
          <TabsContent value="audit">
            <DetailRow label="Updated" value={role.updatedAt} />
            <DetailRow label="Changed by" value="Hospital Admin" />
            <DetailRow label="Last change" value="Permission risk summary reviewed" />
          </TabsContent>
        </DrawerTabs>
      ) : null}
    </Drawer>
  );
}

function PermissionLine({ permission }: { permission: PermissionRecord }) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-medium">{permission.page} • {permission.action}</div>
        {permission.sensitive ? <Badge tone="critical">Sensitive</Badge> : <Badge tone="muted">Standard</Badge>}
      </div>
      <div className="mt-1 text-xs text-muted-foreground">{permission.description}</div>
    </div>
  );
}

function MiniRecord({ title, meta }: { title: string; meta: string }) {
  return <div className="rounded-md border border-border p-3"><div className="text-sm font-medium">{title}</div><div className="text-xs text-muted-foreground">{meta}</div></div>;
}

export function PermissionsPage() {
  const [search, setSearch] = React.useState("");
  const [role, setRole] = React.useState<Role>("Hospital Admin");
  const [module, setModule] = React.useState("All modules");
  const filtered = mockPermissions.filter((permission) => textMatch(`${permission.module} ${permission.page} ${permission.action}`, search) && (module === "All modules" || permission.module === module));
  const modules = ["All modules", ...Array.from(new Set(mockPermissions.map((permission) => permission.module)))];

  return (
    <ProtectedAdmin>
      {({ readOnly }) => (
        <>
          <PageHeader
            eyebrow="Phase 2 • Permission Matrix"
            title="Permission Matrix"
            description="Role, module, page, tab, action, and sensitive access configuration with dependency states."
            actions={<><NativeSelect label="Role selector" value={role} onChange={(value) => setRole(value as Role)} options={mockRoles.map((item) => item.name)} /><Button variant="outline" onClick={() => pageToast("Expand all")}><SlidersHorizontal className="h-4 w-4" />Expand</Button></>}
          />
          <FilterBar search={search} onSearch={setSearch} placeholder="Search permission, page, module...">
            <NativeSelect label="Module group" value={module} onChange={setModule} options={modules} />
          </FilterBar>
          <Tabs defaultValue="module" className="space-y-4">
            <TabsList><TabsTrigger value="module">Module access</TabsTrigger><TabsTrigger value="page">Page access</TabsTrigger><TabsTrigger value="tab">Tab access</TabsTrigger><TabsTrigger value="action">Action access</TabsTrigger><TabsTrigger value="sensitive">Sensitive access</TabsTrigger></TabsList>
            {["module", "page", "tab", "action", "sensitive"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                <PermissionMatrix permissions={filtered} dependency={tab} readOnly={readOnly} />
              </TabsContent>
            ))}
          </Tabs>
          <StickyActionBar readOnly={readOnly} saveLabel="Save permission changes" />
        </>
      )}
    </ProtectedAdmin>
  );
}

function PermissionMatrix({ permissions, dependency, readOnly }: { permissions: PermissionRecord[]; dependency: string; readOnly?: boolean }) {
  const scoped = dependency === "sensitive" ? permissions.filter((permission) => permission.sensitive) : permissions;
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="sticky top-0 bg-surface-muted text-xs uppercase text-muted-foreground">
            <tr>{["Permission", "View", "Create", "Edit", "Delete", "Approve", "Export", "Status"].map((heading) => <th key={heading} className="border-b border-border px-3 py-2">{heading}</th>)}</tr>
          </thead>
          <tbody>
            {scoped.map((permission) => (
              <tr key={permission.id} className="border-b border-border last:border-0">
                <td className="sticky left-0 bg-surface px-3 py-3">
                  <div className="font-medium">{permission.page}</div>
                  <div className="text-xs text-muted-foreground">{permission.module} • {permission.description}</div>
                </td>
                {["View", "Create", "Edit", "Delete", "Approve", "Export"].map((action) => (
                  <td key={action} className="px-3 py-2">
                    <input className="h-4 w-4 accent-primary disabled:opacity-40" type="checkbox" defaultChecked={permission.enabled && (action === "View" || permission.action === action)} disabled={readOnly || (!permission.enabled && action !== "View")} aria-label={`${permission.page} ${action}`} />
                  </td>
                ))}
                <td className="px-3 py-2">{permission.sensitive ? <Badge tone="critical">Sensitive</Badge> : <Badge tone="success">Enabled</Badge>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function UsersPage() {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("All status");
  const [selected, setSelected] = React.useState<UserRecord | null>(null);
  const [confirm, setConfirm] = React.useState<UserRecord | null>(null);
  const filtered = mockUsers.filter((user) => textMatch(`${user.name} ${user.email} ${user.employeeCode} ${user.designation}`, search) && (status === "All status" || user.status === status));
  const roleById = Object.fromEntries(mockRoles.map((role) => [role.id, role.name]));
  const deptById = Object.fromEntries(mockDepartments.map((dept) => [dept.id, dept.name]));
  const columns = React.useMemo<ColumnDef<UserRecord>[]>(() => [
    { header: "User", cell: ({ row }) => <div><div className="font-medium">{row.original.name}</div><div className="text-xs text-muted-foreground">{row.original.email}</div></div> },
    { header: "Code", accessorKey: "employeeCode" },
    { header: "Role", cell: ({ row }) => row.original.roleIds.map((id) => roleById[id]).join(", ") },
    { header: "Department", cell: ({ row }) => row.original.departmentIds.map((id) => deptById[id]).join(", ") },
    { header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { header: "Last login", accessorKey: "lastLoginAt" },
    { header: "Actions", cell: ({ row }) => <div className="flex gap-1"><Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Open</Button><Button size="sm" variant="ghost" onClick={() => setConfirm(row.original)}>{row.original.locked ? "Unlock" : "Lock"}</Button></div> },
  ], [deptById, roleById]);

  return (
    <ProtectedAdmin allowed={adminFullAccessRoles} readOnly={["HR Manager", "Management"]}>
      {({ readOnly }) => (
        <>
          <PageHeader eyebrow="Phase 2 • IAM" title="User Management" description="Manage staff accounts, access mapping, security status, and activity preview." actions={<><Button variant="outline" onClick={() => pageToast("User import")}><Download className="h-4 w-4" />Import</Button><Button variant="outline" onClick={() => pageToast("Invite user")}>Invite</Button><Button disabled={readOnly}><Plus className="h-4 w-4" />Add user</Button></>} />
          <SummaryGrid>
            <StatCard label="Total users" value={mockUsers.length} icon={Users} change="Seeded" context="Static staff records" tone="info" />
            <StatCard label="Active users" value={mockUsers.filter((user) => user.status === "Active").length} icon={Check} change="Enabled" context="Can sign in" tone="success" />
            <StatCard label="Locked users" value={mockUsers.filter((user) => user.locked).length} icon={Lock} change="Review" context="Security action needed" tone="danger" />
            <StatCard label="Online sessions" value={mockSecuritySessions.filter((session) => session.status === "Active").length} icon={ShieldCheck} change="Live" context="Session preview" tone="warning" />
          </SummaryGrid>
          <FilterBar search={search} onSearch={setSearch} placeholder="Search user, code, email, designation..."><NativeSelect label="Status" value={status} onChange={setStatus} options={["All status", "Active", "Locked", "Invited", "Inactive"]} /></FilterBar>
          <DataTable data={filtered} columns={columns} />
          <UserDrawer user={selected} onOpenChange={(open) => !open && setSelected(null)} roleById={roleById} deptById={deptById} />
          <ConfirmDrawer open={Boolean(confirm)} onOpenChange={(open) => !open && setConfirm(null)} title="Account security action" target={confirm?.name ?? ""} action={confirm?.locked ? "Unlock" : "Lock"} />
        </>
      )}
    </ProtectedAdmin>
  );
}

function UserDrawer({ user, onOpenChange, roleById, deptById }: { user: UserRecord | null; onOpenChange: (open: boolean) => void; roleById: Record<string, string>; deptById: Record<string, string> }) {
  return (
    <Drawer open={Boolean(user)} onOpenChange={onOpenChange} title={user?.name ?? "User"} description="Profile, access, security, and recent activity.">
      {user ? (
        <DrawerTabs>
          <TabsList><TabsTrigger value="overview">Profile</TabsTrigger><TabsTrigger value="access">Access</TabsTrigger><TabsTrigger value="security">Security</TabsTrigger><TabsTrigger value="activity">Activity</TabsTrigger></TabsList>
          <TabsContent value="overview"><DetailRow label="Code" value={user.employeeCode} /><DetailRow label="Designation" value={user.designation} /><DetailRow label="Mobile" value={user.mobile} /><DetailRow label="Email" value={user.email} /><DetailRow label="Status" value={<StatusBadge status={user.status} />} /></TabsContent>
          <TabsContent value="access"><DetailRow label="Roles" value={user.roleIds.map((id) => roleById[id]).join(", ")} /><DetailRow label="Departments" value={user.departmentIds.map((id) => deptById[id]).join(", ")} /><DetailRow label="Landing" value="/dashboard" /></TabsContent>
          <TabsContent value="security" className="space-y-3"><SecurityNote /><DetailRow label="Failed logins" value={user.failedLogins} /><DetailRow label="Password" value="Never displayed" masked /><Button variant="danger"><Lock className="h-4 w-4" />Force logout</Button></TabsContent>
          <TabsContent value="activity"><DetailRow label="Last login" value={user.lastLoginAt} /><DetailRow label="Recent action" value="Viewed dashboard summary" /><DetailRow label="Failed attempt" value={`${user.failedLogins} recent attempts`} /></TabsContent>
        </DrawerTabs>
      ) : null}
    </Drawer>
  );
}

export function DepartmentsPage() {
  const [departments, setDepartments] = React.useState<DepartmentRecord[]>(mockDepartments);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("All status");
  const [branch, setBranch] = React.useState("All branches");
  const [emergency, setEmergency] = React.useState("All emergency");
  const [formOpen, setFormOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<DepartmentRecord | null>(null);
  const [confirm, setConfirm] = React.useState<DepartmentRecord | null>(null);
  const branches = ["All branches", ...Array.from(new Set(departments.map((dept) => dept.branch)))];
  const filtered = departments.filter((dept) =>
    textMatch(`${dept.name} ${dept.code} ${dept.head} ${dept.location}`, search) &&
    (status === "All status" || dept.status === status) &&
    (branch === "All branches" || dept.branch === branch) &&
    (emergency === "All emergency" || (emergency === "Emergency enabled" ? dept.emergencyAvailable : !dept.emergencyAvailable)),
  );
  const columns = React.useMemo<ColumnDef<DepartmentRecord>[]>(() => [
    { header: "Department", cell: ({ row }) => <div><div className="font-medium">{row.original.name}</div><div className="text-xs text-muted-foreground">{row.original.code}</div></div> },
    { header: "Head doctor", accessorKey: "head" },
    { header: "Total doctors", accessorKey: "totalDoctors" },
    { header: "OPD timing", accessorKey: "opdTiming" },
    { header: "Floor/location", cell: ({ row }) => <div><div>{row.original.floor}</div><div className="text-xs text-muted-foreground">{row.original.roomWing}</div></div> },
    { header: "Emergency", cell: ({ row }) => row.original.emergencyAvailable ? <Badge tone="critical">Enabled</Badge> : <Badge tone="muted">No</Badge> },
    { header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { header: "Actions", cell: ({ row }) => <div className="flex flex-wrap gap-1"><Button size="sm" variant="outline" onClick={() => setSelected(row.original)}><Eye className="h-3.5 w-3.5" />View</Button><Button size="sm" variant="ghost" onClick={() => setFormOpen(true)}>Edit</Button><Button size="sm" variant="ghost" onClick={() => pageToast("Assign doctors")}>Assign</Button><Button size="sm" variant="ghost" onClick={() => pageToast("Manage OPD timing")}>Timing</Button><Button size="sm" variant="ghost" onClick={() => setConfirm(row.original)}>{row.original.status === "Active" ? "Deactivate" : "Activate"}</Button><Button size="sm" variant="ghost" onClick={() => setConfirm(row.original)}><Trash2 className="h-3.5 w-3.5" /></Button></div> },
  ], []);
  return (
    <ProtectedAdmin>
      {({ readOnly }) => (
        <>
          <div className="flex justify-end">
            <Button disabled={readOnly} onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" />Add department</Button>
          </div>
          <SummaryGrid><StatCard label="Total departments" value={departments.length} icon={Building2} change="Master" context="Reusable setup" tone="info" /><StatCard label="Active departments" value={departments.filter((d) => d.status === "Active").length} icon={Check} change="Enabled" context="Available now" tone="success" /><StatCard label="Doctors assigned" value={departments.reduce((sum, dept) => sum + dept.totalDoctors, 0)} icon={Users} change="Mapped" context="Across departments" tone="info" /><StatCard label="OPD departments" value={departments.filter((d) => d.enabledWorkflows.includes("OPD") || d.opdTiming !== "Not applicable").length} icon={CalendarDays} change="Scheduled" context="Timing configured" tone="warning" /><StatCard label="Emergency-enabled" value={departments.filter((d) => d.emergencyAvailable).length} icon={ShieldAlert} change="Priority" context="Emergency coverage" tone="danger" /></SummaryGrid>
          <FilterBar search={search} onSearch={setSearch} placeholder="Search department by name, code, or head doctor..."><NativeSelect label="Status" value={status} onChange={setStatus} options={["All status", "Active", "Inactive"]} /><NativeSelect label="Branch" value={branch} onChange={setBranch} options={branches} /><NativeSelect label="Emergency" value={emergency} onChange={setEmergency} options={["All emergency", "Emergency enabled", "No emergency"]} /></FilterBar>
          <DataTable data={filtered} columns={columns} />
          <DepartmentDrawer department={selected} onOpenChange={(open) => !open && setSelected(null)} />
          <DepartmentFormDrawer existingDepartments={departments} open={formOpen} onCreate={(department) => setDepartments((current) => [department, ...current])} onOpenChange={setFormOpen} readOnly={readOnly} />
          <ConfirmDrawer open={Boolean(confirm)} onOpenChange={(open) => !open && setConfirm(null)} title="Department confirmation" target={confirm?.name ?? ""} action={confirm?.status === "Active" ? "Deactivate" : "Activate"} />
        </>
      )}
    </ProtectedAdmin>
  );
}

export function DoctorsPage() {
  const [doctors, setDoctors] = React.useState<DoctorRecord[]>(mockDoctors);
  const [search, setSearch] = React.useState("");
  const [department, setDepartment] = React.useState("All departments");
  const [status, setStatus] = React.useState("All status");
  const [branch, setBranch] = React.useState("All branches");
  const [availability, setAvailability] = React.useState("All availability");
  const [selected, setSelected] = React.useState<DoctorRecord | null>(null);
  const [formOpen, setFormOpen] = React.useState(false);
  const [confirm, setConfirm] = React.useState<DoctorRecord | null>(null);
  const departments = ["All departments", ...mockDepartments.map((dept) => dept.name)];
  const branches = ["All branches", ...Array.from(new Set(doctors.map((doctor) => doctor.branch)))];
  const filtered = doctors.filter((doctor) =>
    textMatch(`${doctor.name} ${doctor.mobile} ${doctor.email} ${doctor.department} ${doctor.specialization}`, search) &&
    (department === "All departments" || doctor.department === department) &&
    (status === "All status" || doctor.status === status) &&
    (branch === "All branches" || doctor.branch === branch) &&
    (availability === "All availability" || doctor.availabilityStatus === availability),
  );
  const columns = React.useMemo<ColumnDef<DoctorRecord>[]>(() => [
    { header: "Doctor name", cell: ({ row }) => <div><div className="font-medium">{row.original.name}</div><div className="text-xs text-muted-foreground">{row.original.doctorId}</div></div> },
    { header: "Department", accessorKey: "department" },
    { header: "Specialization", accessorKey: "specialization" },
    { header: "Mobile", accessorKey: "mobile" },
    { header: "Email", accessorKey: "email" },
    { header: "Availability", cell: ({ row }) => <StatusBadge status={row.original.availabilityStatus} /> },
    { header: "OPD timing", accessorKey: "opdTiming" },
    { header: "Branch", accessorKey: "branch" },
    { header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { header: "Actions", cell: ({ row }) => <div className="flex flex-wrap gap-1"><Button size="sm" variant="outline" onClick={() => setSelected(row.original)}><Eye className="h-3.5 w-3.5" />View</Button><Button size="sm" variant="ghost" onClick={() => setFormOpen(true)}>Edit</Button><Button size="sm" variant="ghost" onClick={() => pageToast("Manage availability")}>Availability</Button><Button size="sm" variant="ghost" onClick={() => pageToast("Assign department")}>Assign</Button><Button size="sm" variant="ghost" onClick={() => pageToast("Password reset")}><KeyRound className="h-3.5 w-3.5" /></Button><Button size="sm" variant="ghost" onClick={() => setConfirm(row.original)}>{row.original.status === "Active" ? "Deactivate" : "Activate"}</Button><Button size="sm" variant="ghost" onClick={() => setConfirm(row.original)}><Trash2 className="h-3.5 w-3.5" /></Button></div> },
  ], []);

  return (
    <ProtectedAdmin>
      {({ readOnly }) => (
        <>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => pageToast("Doctor CSV export")}><Download className="h-4 w-4" />Export CSV</Button>
            <Button variant="outline" onClick={() => pageToast("Bulk upload doctors")}><Upload className="h-4 w-4" />Bulk upload</Button>
            <Button disabled={readOnly} onClick={() => setFormOpen(true)}><Plus className="h-4 w-4" />Add doctor</Button>
          </div>
          <SummaryGrid><StatCard label="Total doctors" value={doctors.length} icon={Users} change="Staff master" context="Credentialed doctors" tone="info" /><StatCard label="Available doctors" value={doctors.filter((doctor) => doctor.availabilityStatus === "Available").length} icon={UserRoundCheck} change="Now" context="Can accept appointments" tone="success" /><StatCard label="On leave" value={doctors.filter((doctor) => doctor.availabilityStatus === "On leave").length} icon={CalendarDays} change="Planned" context="Leave schedule" tone="warning" /><StatCard label="Active OPD doctors" value={doctors.filter((doctor) => doctor.activeOpd).length} icon={ShieldCheck} change="OPD" context="Today schedule" tone="success" /><StatCard label="Telemedicine doctors" value={doctors.filter((doctor) => doctor.telemedicine).length} icon={UserCog} change="Virtual" context="Online consult ready" tone="info" /></SummaryGrid>
          <FilterBar search={search} onSearch={setSearch} placeholder="Search doctor by name, phone, email, department, specialization..."><NativeSelect label="Department" value={department} onChange={setDepartment} options={departments} /><NativeSelect label="Status" value={status} onChange={setStatus} options={["All status", "Active", "Inactive"]} /><NativeSelect label="Branch" value={branch} onChange={setBranch} options={branches} /><NativeSelect label="Availability" value={availability} onChange={setAvailability} options={["All availability", "Available", "On leave", "Unavailable"]} /></FilterBar>
          <DataTable data={filtered} columns={columns} />
          <DoctorDrawer doctor={selected} onOpenChange={(open) => !open && setSelected(null)} />
          <DoctorFormDrawer existingDoctors={doctors} open={formOpen} onCreate={(doctor) => setDoctors((current) => [doctor, ...current])} onOpenChange={setFormOpen} readOnly={readOnly} />
          <ConfirmDrawer open={Boolean(confirm)} onOpenChange={(open) => !open && setConfirm(null)} title="Doctor confirmation" target={confirm?.name ?? ""} action={confirm?.status === "Active" ? "Deactivate" : "Activate"} />
        </>
      )}
    </ProtectedAdmin>
  );
}

function DoctorDrawer({ doctor, onOpenChange }: { doctor: DoctorRecord | null; onOpenChange: (open: boolean) => void }) {
  return (
    <Drawer open={Boolean(doctor)} onOpenChange={onOpenChange} title={doctor?.name ?? "Doctor"} description="Profile, department, schedule, fees, permissions, and validation status.">
      {doctor ? (
        <DrawerTabs>
          <TabsList><TabsTrigger value="profile">Profile</TabsTrigger><TabsTrigger value="work">Work setup</TabsTrigger><TabsTrigger value="availability">Availability</TabsTrigger><TabsTrigger value="login">Login</TabsTrigger></TabsList>
          <TabsContent value="profile"><DetailRow label="Doctor ID" value={doctor.doctorId} /><DetailRow label="Department" value={doctor.department} /><DetailRow label="Specialization" value={doctor.specialization} /><DetailRow label="Mobile" value={doctor.mobile} /><DetailRow label="Email" value={doctor.email} /><DetailRow label="Registration" value={doctor.registrationNumber} /></TabsContent>
          <TabsContent value="work"><DetailRow label="Branch" value={doctor.branch} /><DetailRow label="Room" value={doctor.room} /><DetailRow label="Consultation" value={doctor.consultationTypes.join(", ")} /><DetailRow label="Fee" value={doctor.consultationFee} /><DetailRow label="Emergency" value={doctor.emergencyFee} /><DetailRow label="Slot" value={`${doctor.slotDuration} • ${doctor.maxPatientsPerSlot} patient/slot`} /></TabsContent>
          <TabsContent value="availability"><DetailRow label="Status" value={<StatusBadge status={doctor.availabilityStatus} />} /><DetailRow label="OPD timing" value={doctor.opdTiming} /><DetailRow label="Break" value={doctor.breakTiming} /><DetailRow label="Telemedicine" value={doctor.telemedicineTiming} /><DetailRow label="Leave" value={doctor.leaveSchedule} /></TabsContent>
          <TabsContent value="login"><DetailRow label="Username" value={doctor.username} /><DetailRow label="Password" value="Temporary password masked" masked /><DetailRow label="Role" value={doctor.role} /><DetailRow label="Modules" value={doctor.allowedModules.join(", ")} /><DetailRow label="Status" value={<StatusBadge status={doctor.status} />} /></TabsContent>
        </DrawerTabs>
      ) : null}
    </Drawer>
  );
}

function DepartmentDrawer({ department, onOpenChange }: { department: DepartmentRecord | null; onOpenChange: (open: boolean) => void }) {
  const assignedDoctors = mockDoctors.filter((doctor) => department?.assignedDoctorIds.includes(doctor.id));
  return (
    <Drawer open={Boolean(department)} onOpenChange={onOpenChange} title={department?.name ?? "Department"} description="Department profile, location, doctor assignment, OPD, emergency, and services.">
      {department ? <DrawerTabs><TabsList><TabsTrigger value="overview">Details</TabsTrigger><TabsTrigger value="location">Location</TabsTrigger><TabsTrigger value="doctors">Doctors</TabsTrigger><TabsTrigger value="opd">OPD</TabsTrigger><TabsTrigger value="services">Services</TabsTrigger></TabsList><TabsContent value="overview"><DetailRow label="Code" value={department.code} /><DetailRow label="Type" value={department.type} /><DetailRow label="Description" value={`${department.name} operational master setup`} /><DetailRow label="Status" value={<StatusBadge status={department.status} />} /></TabsContent><TabsContent value="location"><DetailRow label="Branch" value={department.branch} /><DetailRow label="Floor" value={department.floor} /><DetailRow label="Room/wing" value={department.roomWing} /><DetailRow label="Contact" value={department.contactNumber} /><DetailRow label="Email" value={department.email} /></TabsContent><TabsContent value="doctors" className="space-y-2"><DetailRow label="Head" value={department.head} /><DetailRow label="Total doctors" value={department.totalDoctors} />{assignedDoctors.map((doctor) => <MiniRecord key={doctor.id} title={doctor.name} meta={`${doctor.specialization} • ${doctor.availabilityStatus}`} />)}</TabsContent><TabsContent value="opd"><DetailRow label="OPD timing" value={department.opdTiming} /><DetailRow label="Working days" value={department.workingDays} /><DetailRow label="Emergency" value={department.emergencyAvailable ? "Enabled" : "No"} /><DetailRow label="Emergency doctor" value={department.emergencyContactDoctor} /><DetailRow label="Capacity" value={`${department.patientCapacityPerDay} patients/day`} /></TabsContent><TabsContent value="services" className="space-y-2"><DetailRow label="Fee range" value={department.feeRange} /><div className="flex flex-wrap gap-2">{department.servicesOffered.map((item) => <Badge key={item} tone="info">{item}</Badge>)}</div><div className="flex flex-wrap gap-2">{department.linkedServices.map((item) => <Badge key={item} tone="muted">{item}</Badge>)}</div></TabsContent></DrawerTabs> : null}
    </Drawer>
  );
}

function StepNote({ items }: { items: string[] }) {
  return <div className="rounded-lg border border-border bg-surface-muted p-3 text-xs text-muted-foreground">{items.join(" • ")}</div>;
}

type DepartmentFormState = {
  name: string;
  code: string;
  description: string;
  icon: string;
  branch: string;
  floor: string;
  roomWing: string;
  contactNumber: string;
  email: string;
  head: string;
  assignedDoctors: string;
  primaryConsultant: string;
  onCallDoctors: string;
  opdTiming: string;
  workingDays: string;
  emergencyAvailable: string;
  emergencyContactDoctor: string;
  patientCapacityPerDay: string;
  servicesOffered: string;
  feeRange: string;
  linkedServices: string;
  status: string;
};

const emptyDepartmentForm: DepartmentFormState = {
  name: "",
  code: "",
  description: "",
  icon: "Building",
  branch: "Plasmit Main Hospital",
  floor: "",
  roomWing: "",
  contactNumber: "",
  email: "",
  head: mockDoctors[0]?.name ?? "",
  assignedDoctors: mockDoctors.map((doctor) => doctor.name).slice(0, 1).join(", "),
  primaryConsultant: mockDoctors[0]?.name ?? "",
  onCallDoctors: "",
  opdTiming: "",
  workingDays: "Mon-Sat",
  emergencyAvailable: "No",
  emergencyContactDoctor: "",
  patientCapacityPerDay: "0",
  servicesOffered: "",
  feeRange: "",
  linkedServices: "",
  status: "Active",
};

type DoctorFormState = {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  mobile: string;
  email: string;
  profilePhotoName: string;
  profilePhotoUrl: string;
  doctorId: string;
  department: string;
  specialization: string;
  qualification: string;
  experience: string;
  registrationNumber: string;
  licenseDocument: string;
  branch: string;
  room: string;
  consultationTypes: string;
  consultationFee: string;
  emergencyFee: string;
  slotDuration: string;
  maxPatientsPerSlot: string;
  weeklySchedule: string;
  opdTiming: string;
  breakTiming: string;
  telemedicineTiming: string;
  leaveSchedule: string;
  availabilityStatus: string;
  username: string;
  temporaryPassword: string;
  role: string;
  allowedModules: string;
  status: string;
};

const emptyDoctorForm: DoctorFormState = {
  fullName: "Dr. ",
  gender: "Female",
  dateOfBirth: "",
  mobile: "",
  email: "",
  profilePhotoName: "",
  profilePhotoUrl: "",
  doctorId: "",
  department: mockDepartments[0]?.name ?? "",
  specialization: "",
  qualification: "",
  experience: "",
  registrationNumber: "",
  licenseDocument: "Upload pending",
  branch: "Plasmit Main Hospital",
  room: "",
  consultationTypes: "OPD, Follow-up",
  consultationFee: "",
  emergencyFee: "",
  slotDuration: "15 min",
  maxPatientsPerSlot: "1",
  weeklySchedule: "Mon-Sat",
  opdTiming: "",
  breakTiming: "",
  telemedicineTiming: "",
  leaveSchedule: "No planned leave",
  availabilityStatus: "Available",
  username: "",
  temporaryPassword: "",
  role: "Doctor",
  allowedModules: "OPD, Appointments, EMR",
  status: "Active",
};

function DoctorFormDrawer({
  existingDoctors,
  open,
  onCreate,
  onOpenChange,
  readOnly,
}: {
  existingDoctors: DoctorRecord[];
  open: boolean;
  onCreate: (doctor: DoctorRecord) => void;
  onOpenChange: (open: boolean) => void;
  readOnly?: boolean;
}) {
  const [form, setForm] = React.useState<DoctorFormState>(emptyDoctorForm);
  const [error, setError] = React.useState("");

  function updateField(field: keyof DoctorFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) {
      setError("");
    }
  }

  function resetAndClose() {
    setForm(emptyDoctorForm);
    setError("");
    onOpenChange(false);
  }

  function splitValues(value: string) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }

  function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Profile photo must be an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        profilePhotoName: file.name,
        profilePhotoUrl: typeof reader.result === "string" ? reader.result : "",
      }));
      setError("");
    };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    const fullName = form.fullName.trim();
    const doctorId = form.doctorId.trim().toUpperCase();
    const mobile = form.mobile.trim();
    const email = form.email.trim().toLowerCase();
    const registrationNumber = form.registrationNumber.trim();
    const department = form.department.trim();
    const departmentRecord = mockDepartments.find((item) => item.name === department);

    if (!fullName || fullName === "Dr.") {
      setError("Full name is required.");
      return;
    }
    if (!doctorId) {
      setError("Doctor ID / Employee ID is required.");
      return;
    }
    if (!department || !departmentRecord) {
      setError("Department is required before save.");
      return;
    }
    if (!mobile) {
      setError("Mobile number is required.");
      return;
    }
    if (!email) {
      setError("Email is required.");
      return;
    }
    if (!registrationNumber) {
      setError("Medical registration number is required.");
      return;
    }
    if (existingDoctors.some((doctor) => doctor.doctorId.toLowerCase() === doctorId.toLowerCase())) {
      setError("Duplicate doctor ID found.");
      return;
    }
    if (existingDoctors.some((doctor) => doctor.mobile === mobile)) {
      setError("Duplicate mobile number found.");
      return;
    }
    if (existingDoctors.some((doctor) => doctor.email.toLowerCase() === email)) {
      setError("Duplicate email found.");
      return;
    }
    if (existingDoctors.some((doctor) => doctor.registrationNumber.toLowerCase() === registrationNumber.toLowerCase())) {
      setError("Duplicate medical registration number found.");
      return;
    }

    const consultationTypes = splitValues(form.consultationTypes);
    const allowedModules = splitValues(form.allowedModules);
    const availabilityStatus = form.availabilityStatus === "On leave" || form.availabilityStatus === "Unavailable" ? form.availabilityStatus : "Available";
    const status = form.status === "Inactive" ? "Inactive" : "Active";

    const newDoctor: DoctorRecord = {
      id: `doc-${doctorId.toLowerCase()}-${Date.now()}`,
      doctorId,
      name: fullName,
      gender: form.gender === "Male" || form.gender === "Other" ? form.gender : "Female",
      dateOfBirth: form.dateOfBirth || "Not provided",
      mobile,
      email,
      profilePhotoName: form.profilePhotoName || undefined,
      profilePhotoUrl: form.profilePhotoUrl || undefined,
      departmentId: departmentRecord.id,
      department,
      specialization: form.specialization.trim() || "General Medicine",
      qualification: form.qualification.trim() || "Not provided",
      experience: form.experience.trim() || "0 years",
      registrationNumber,
      branch: form.branch.trim() || "Plasmit Main Hospital",
      room: form.room.trim() || "Not assigned",
      consultationTypes: consultationTypes.length ? consultationTypes : ["OPD"],
      consultationFee: form.consultationFee.trim() || "₹0",
      emergencyFee: form.emergencyFee.trim() || "₹0",
      slotDuration: form.slotDuration.trim() || "15 min",
      maxPatientsPerSlot: Number(form.maxPatientsPerSlot) || 1,
      availabilityStatus,
      opdTiming: form.opdTiming.trim() || "Not configured",
      breakTiming: form.breakTiming.trim() || "Not configured",
      telemedicineTiming: form.telemedicineTiming.trim() || "Not enabled",
      leaveSchedule: form.leaveSchedule.trim() || "No planned leave",
      status,
      telemedicine: consultationTypes.includes("Telemedicine") || Boolean(form.telemedicineTiming.trim()),
      activeOpd: status === "Active" && Boolean(form.opdTiming.trim()) && availabilityStatus === "Available",
      username: form.username.trim() || email.split("@")[0],
      role: "Doctor",
      allowedModules: allowedModules.length ? allowedModules : ["OPD", "Appointments", "EMR"],
    };

    onCreate(newDoctor);
    toast.success(`${newDoctor.name} added`);
    resetAndClose();
  }

  return (
    <Drawer open={open} onOpenChange={(nextOpen) => nextOpen ? onOpenChange(true) : resetAndClose()} title="Add doctor" description="Five-step doctor setup with department, schedule, fee, availability, and login mapping." className="md:w-[720px]" footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={resetAndClose}>Cancel</Button><Button disabled={readOnly} onClick={handleSave}><Save className="h-4 w-4" />Save doctor</Button></div>}>
      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList><TabsTrigger value="basic">Basic</TabsTrigger><TabsTrigger value="professional">Professional</TabsTrigger><TabsTrigger value="work">Work</TabsTrigger><TabsTrigger value="availability">Availability</TabsTrigger><TabsTrigger value="login">Login</TabsTrigger></TabsList>
        {error ? <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-medium text-danger">{error}</div> : null}
        <TabsContent value="basic" className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <DepartmentInput label="Full name" value={form.fullName} onChange={(value) => updateField("fullName", value)} />
            <GenderSelect value={form.gender} onChange={(value) => updateField("gender", value)} />
            <DepartmentInput label="Date of birth" type="date" value={form.dateOfBirth} onChange={(value) => updateField("dateOfBirth", value)} />
            <DepartmentInput label="Mobile number" value={form.mobile} onChange={(value) => updateField("mobile", value)} />
            <DepartmentInput label="Email" type="email" value={form.email} onChange={(value) => updateField("email", value)} />
            <DoctorPhotoUpload fileName={form.profilePhotoName} previewUrl={form.profilePhotoUrl} onChange={handlePhotoUpload} />
          </div>
          <StepNote items={["Required fields validation", "Duplicate email check", "Duplicate mobile check"]} />
        </TabsContent>
        <TabsContent value="professional" className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <DepartmentInput label="Doctor ID / Employee ID" value={form.doctorId} onChange={(value) => updateField("doctorId", value.toUpperCase())} />
            <DepartmentInput label="Department" value={form.department} onChange={(value) => updateField("department", value)} />
            <DepartmentInput label="Specialization" value={form.specialization} onChange={(value) => updateField("specialization", value)} />
            <DepartmentInput label="Qualification" value={form.qualification} onChange={(value) => updateField("qualification", value)} />
            <DepartmentInput label="Experience" value={form.experience} onChange={(value) => updateField("experience", value)} />
            <DepartmentInput label="Medical registration number" value={form.registrationNumber} onChange={(value) => updateField("registrationNumber", value)} />
            <DepartmentInput label="License document upload" value={form.licenseDocument} onChange={(value) => updateField("licenseDocument", value)} />
          </div>
          <StepNote items={["Duplicate doctor ID check", "Medical registration validation", "Department required before save"]} />
        </TabsContent>
        <TabsContent value="work" className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <DepartmentInput label="Branch" value={form.branch} onChange={(value) => updateField("branch", value)} />
            <DepartmentInput label="Room / cabin number" value={form.room} onChange={(value) => updateField("room", value)} />
            <DepartmentInput label="Consultation type" value={form.consultationTypes} onChange={(value) => updateField("consultationTypes", value)} />
            <DepartmentInput label="Consultation fee" value={form.consultationFee} onChange={(value) => updateField("consultationFee", value)} />
            <DepartmentInput label="Emergency fee" value={form.emergencyFee} onChange={(value) => updateField("emergencyFee", value)} />
            <DepartmentInput label="Appointment slot duration" value={form.slotDuration} onChange={(value) => updateField("slotDuration", value)} />
            <DepartmentInput label="Max patients per slot" type="number" value={form.maxPatientsPerSlot} onChange={(value) => updateField("maxPatientsPerSlot", value)} />
          </div>
        </TabsContent>
        <TabsContent value="availability" className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <DepartmentInput label="Weekly schedule" value={form.weeklySchedule} onChange={(value) => updateField("weeklySchedule", value)} />
            <DepartmentInput label="OPD timing" value={form.opdTiming} onChange={(value) => updateField("opdTiming", value)} />
            <DepartmentInput label="Break timing" value={form.breakTiming} onChange={(value) => updateField("breakTiming", value)} />
            <DepartmentInput label="Telemedicine timing" value={form.telemedicineTiming} onChange={(value) => updateField("telemedicineTiming", value)} />
            <DepartmentInput label="Leave schedule" value={form.leaveSchedule} onChange={(value) => updateField("leaveSchedule", value)} />
            <DepartmentInput label="Available / unavailable" value={form.availabilityStatus} onChange={(value) => updateField("availabilityStatus", value)} />
          </div>
          <StepNote items={["Slot overlap validation", "Leave schedule blocks appointment slots"]} />
        </TabsContent>
        <TabsContent value="login" className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <DepartmentInput label="Username" value={form.username} onChange={(value) => updateField("username", value)} />
            <DepartmentInput label="Temporary password" type="password" value={form.temporaryPassword} onChange={(value) => updateField("temporaryPassword", value)} />
            <DepartmentInput label="Doctor role" value={form.role} onChange={(value) => updateField("role", value)} />
            <DepartmentInput label="Allowed modules" value={form.allowedModules} onChange={(value) => updateField("allowedModules", value)} />
            <DepartmentInput label="Active / inactive status" value={form.status} onChange={(value) => updateField("status", value)} />
          </div>
        </TabsContent>
      </Tabs>
    </Drawer>
  );
}

function DepartmentFormDrawer({
  existingDepartments,
  open,
  onCreate,
  onOpenChange,
  readOnly,
}: {
  existingDepartments: DepartmentRecord[];
  open: boolean;
  onCreate: (department: DepartmentRecord) => void;
  onOpenChange: (open: boolean) => void;
  readOnly?: boolean;
}) {
  const [form, setForm] = React.useState<DepartmentFormState>(emptyDepartmentForm);
  const [error, setError] = React.useState("");

  function updateField(field: keyof DepartmentFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) {
      setError("");
    }
  }

  function resetAndClose() {
    setForm(emptyDepartmentForm);
    setError("");
    onOpenChange(false);
  }

  function splitValues(value: string) {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }

  function handleSave() {
    const name = form.name.trim();
    const code = form.code.trim().toUpperCase();
    const assignedDoctorNames = splitValues(form.assignedDoctors);
    const emergencyEnabled = form.emergencyAvailable.toLowerCase().startsWith("y");
    const active = form.status !== "Inactive";

    if (!name) {
      setError("Department name is required.");
      return;
    }
    if (!code) {
      setError("Department code is required.");
      return;
    }
    if (existingDepartments.some((department) => department.code.toLowerCase() === code.toLowerCase())) {
      setError("Department code must be unique.");
      return;
    }
    if (active && !form.head.trim()) {
      setError("Head doctor is required for an active department.");
      return;
    }
    if (form.opdTiming.trim() && !assignedDoctorNames.length) {
      setError("At least one doctor is required before enabling OPD.");
      return;
    }

    const assignedDoctorIds = mockDoctors.filter((doctor) => assignedDoctorNames.includes(doctor.name)).map((doctor) => doctor.id);
    const newDepartment: DepartmentRecord = {
      id: `dept-${code.toLowerCase()}-${Date.now()}`,
      code,
      name,
      type: "Clinical",
      head: form.head.trim() || "Not assigned",
      location: [form.roomWing.trim(), form.floor.trim()].filter(Boolean).join(", ") || form.branch,
      users: assignedDoctorNames.length,
      status: active ? "Active" : "Inactive",
      enabledWorkflows: [form.opdTiming.trim() ? "OPD" : "", emergencyEnabled ? "Emergency" : "", "Appointment"].filter(Boolean),
      branch: form.branch.trim() || "Plasmit Main Hospital",
      floor: form.floor.trim() || "Not assigned",
      roomWing: form.roomWing.trim() || "Not assigned",
      contactNumber: form.contactNumber.trim() || "Not assigned",
      email: form.email.trim() || "Not assigned",
      totalDoctors: assignedDoctorNames.length,
      assignedDoctorIds,
      opdTiming: form.opdTiming.trim() || "Not configured",
      workingDays: form.workingDays.trim() || "Mon-Sat",
      emergencyAvailable: emergencyEnabled,
      emergencyContactDoctor: form.emergencyContactDoctor.trim() || form.head.trim() || "Not assigned",
      patientCapacityPerDay: Number(form.patientCapacityPerDay) || 0,
      servicesOffered: splitValues(form.servicesOffered),
      feeRange: form.feeRange.trim() || "Not configured",
      linkedServices: splitValues(form.linkedServices),
    };

    onCreate(newDepartment);
    toast.success(`${newDepartment.name} department added`);
    resetAndClose();
  }

  return (
    <Drawer open={open} onOpenChange={(nextOpen) => nextOpen ? onOpenChange(true) : resetAndClose()} title="Add department" description="Five-step department setup with location, doctors, OPD, emergency, and linked services." className="md:w-[720px]" footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={resetAndClose}>Cancel</Button><Button disabled={readOnly} onClick={handleSave}><Save className="h-4 w-4" />Save department</Button></div>}>
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList><TabsTrigger value="details">Details</TabsTrigger><TabsTrigger value="location">Location</TabsTrigger><TabsTrigger value="doctors">Doctors</TabsTrigger><TabsTrigger value="opd">OPD</TabsTrigger><TabsTrigger value="services">Services</TabsTrigger></TabsList>
        {error ? <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-medium text-danger">{error}</div> : null}
        <TabsContent value="details" className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <DepartmentInput label="Department name" value={form.name} onChange={(value) => updateField("name", value)} />
            <DepartmentInput label="Department code" value={form.code} onChange={(value) => updateField("code", value.toUpperCase())} />
            <DepartmentInput label="Description" value={form.description} onChange={(value) => updateField("description", value)} />
            <DepartmentInput label="Department icon" value={form.icon} onChange={(value) => updateField("icon", value)} />
          </div>
          <StepNote items={["Department name required", "Department code unique"]} />
        </TabsContent>
        <TabsContent value="location" className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <DepartmentInput label="Branch" value={form.branch} onChange={(value) => updateField("branch", value)} />
            <DepartmentInput label="Floor" value={form.floor} onChange={(value) => updateField("floor", value)} />
            <DepartmentInput label="Room/wing" value={form.roomWing} onChange={(value) => updateField("roomWing", value)} />
            <DepartmentInput label="Contact number" value={form.contactNumber} onChange={(value) => updateField("contactNumber", value)} />
            <DepartmentInput label="Department email" type="email" value={form.email} onChange={(value) => updateField("email", value)} />
          </div>
        </TabsContent>
        <TabsContent value="doctors" className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <DepartmentInput label="Department head" value={form.head} onChange={(value) => updateField("head", value)} />
            <DepartmentInput label="Assign doctors" value={form.assignedDoctors} onChange={(value) => updateField("assignedDoctors", value)} />
            <DepartmentInput label="Primary consultant" value={form.primaryConsultant} onChange={(value) => updateField("primaryConsultant", value)} />
            <DepartmentInput label="On-call doctors" value={form.onCallDoctors} onChange={(value) => updateField("onCallDoctors", value)} />
          </div>
          <StepNote items={["Head doctor required for active department", "Assigned doctors shown dynamically on department page"]} />
        </TabsContent>
        <TabsContent value="opd" className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <DepartmentInput label="OPD timing" value={form.opdTiming} onChange={(value) => updateField("opdTiming", value)} />
            <DepartmentInput label="Weekly working days" value={form.workingDays} onChange={(value) => updateField("workingDays", value)} />
            <DepartmentInput label="Emergency availability yes/no" value={form.emergencyAvailable} onChange={(value) => updateField("emergencyAvailable", value)} />
            <DepartmentInput label="Emergency contact doctor" value={form.emergencyContactDoctor} onChange={(value) => updateField("emergencyContactDoctor", value)} />
            <DepartmentInput label="Patient capacity per day" type="number" value={form.patientCapacityPerDay} onChange={(value) => updateField("patientCapacityPerDay", value)} />
          </div>
          <StepNote items={["At least one doctor required before enabling OPD", "OPD timing overlap validation"]} />
        </TabsContent>
        <TabsContent value="services" className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <DepartmentInput label="Services offered" value={form.servicesOffered} onChange={(value) => updateField("servicesOffered", value)} />
            <DepartmentInput label="Consultation fee range" value={form.feeRange} onChange={(value) => updateField("feeRange", value)} />
            <DepartmentInput label="Lab/radiology linked services" value={form.linkedServices} onChange={(value) => updateField("linkedServices", value)} />
            <DepartmentInput label="Status active/inactive" value={form.status} onChange={(value) => updateField("status", value)} />
          </div>
          <StepNote items={["Cannot delete department if active doctors/patients exist"]} />
        </TabsContent>
      </Tabs>
    </Drawer>
  );
}

function DepartmentInput({ label, onChange, type = "text", value }: { label: string; onChange: (value: string) => void; type?: string; value: string }) {
  return <label className="space-y-1 text-sm"><span className="font-medium text-foreground">{label}</span><Input value={value} type={type} onChange={(event) => onChange(event.target.value)} /></label>;
}

function GenderSelect({ onChange, value }: { onChange: (value: string) => void; value: string }) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-foreground">Gender</span>
      <select
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option>Female</option>
        <option>Male</option>
        <option>Other</option>
      </select>
    </label>
  );
}

function DoctorPhotoUpload({
  fileName,
  onChange,
  previewUrl,
}: {
  fileName: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  previewUrl: string;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium text-foreground">Profile photo</span>
      <div className="flex min-h-9 items-center gap-3 rounded-md border border-input bg-background px-3 py-2">
        {previewUrl ? <Image src={previewUrl} alt="Doctor profile preview" width={40} height={40} unoptimized className="h-10 w-10 rounded-md border border-border object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">Photo</div>}
        <div className="min-w-0 flex-1">
          <input className="block w-full text-xs text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-surface-muted file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-foreground" type="file" accept="image/*" onChange={onChange} />
          <div className="mt-1 truncate text-xs text-muted-foreground">{fileName || "No image selected"}</div>
        </div>
      </div>
    </label>
  );
}

export function HospitalSetupPage() {
  return (
    <ProtectedAdmin readOnly={adminReadOnlyRoles}>
      {({ readOnly }) => (
        <>
          <PageHeader eyebrow="Phase 2 • Hospital Master" title="Hospital Master Setup" description="Hospital profile, contact, legal, operations, branding, print settings, and audit summary." actions={<><Button variant="outline" onClick={() => pageToast("Print preview")}><Printer className="h-4 w-4" />Print</Button><Button disabled={readOnly}><Save className="h-4 w-4" />Save setup</Button></>} />
          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList><TabsTrigger value="profile">Profile</TabsTrigger><TabsTrigger value="contact">Contact</TabsTrigger><TabsTrigger value="legal">Legal</TabsTrigger><TabsTrigger value="operations">Operations</TabsTrigger><TabsTrigger value="branding">Branding</TabsTrigger><TabsTrigger value="print">Print</TabsTrigger><TabsTrigger value="audit">Audit</TabsTrigger></TabsList>
            <TabsContent value="profile"><SettingsForm fields={[["Hospital name", mockHospitalProfile.name], ["Short name", mockHospitalProfile.shortName], ["Hospital type", mockHospitalProfile.type], ["Established year", mockHospitalProfile.establishedYear]]} /></TabsContent>
            <TabsContent value="contact"><SettingsForm fields={[["Address", mockHospitalProfile.address], ["Phone", mockHospitalProfile.phone], ["Email", mockHospitalProfile.email], ["Website", mockHospitalProfile.website]]} /></TabsContent>
            <TabsContent value="legal"><SettingsForm fields={[["Registration number", mockHospitalProfile.registrationNumber], ["GST number", mockHospitalProfile.gst], ["NABH/NABL", "Prepared placeholder"], ["PAN", "•••••• masked"]]} /></TabsContent>
            <TabsContent value="operations"><SettingsForm fields={[["Working hours", mockHospitalProfile.workingHours], ["Timezone", mockHospitalProfile.timezone], ["Currency", mockHospitalProfile.currency], ["Default appointment duration", "15 minutes"]]} /></TabsContent>
            <TabsContent value="branding"><AdminSection title="Branding values" description="Branding maps into Phase 1 theme tokens without bypassing semantic colors."><SettingsForm fields={[["Logo", "Upload placeholder"], ["Primary preset", "Uses global dynamic theme"], ["Hospital seal", "Future upload placeholder"]]} /></AdminSection></TabsContent>
            <TabsContent value="print"><AdminSection title="Print-safe preview" description="Navigation and actions hide during print. Sensitive fields remain masked."><div className="rounded-lg border border-border bg-white p-4 text-slate-900"><div className="font-semibold">{mockHospitalProfile.name}</div><div className="text-xs">{mockHospitalProfile.address}</div><div className="mt-4 border-t pt-3 text-sm">Prescription / Invoice / Lab report header placeholder</div></div></AdminSection></TabsContent>
            <TabsContent value="audit"><SettingsForm fields={[["Last updated by", "Hospital Admin"], ["Last updated", "Today 09:20"], ["Sensitive changes", "Legal fields masked in audit log"]]} /></TabsContent>
          </Tabs>
          <StickyActionBar readOnly={readOnly} saveLabel="Save hospital setup" />
        </>
      )}
    </ProtectedAdmin>
  );
}

function SettingsForm({ fields }: { fields: [string, string][] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {fields.map(([label, value]) => (
        <label key={label} className="space-y-1 text-sm">
          <span className="font-medium text-foreground">{label}</span>
          <Input defaultValue={value} />
        </label>
      ))}
    </div>
  );
}

export function BranchesPage() {
  const [selected, setSelected] = React.useState<BranchRecord | null>(null);
  const columns = React.useMemo<ColumnDef<BranchRecord>[]>(() => [
    { header: "Branch", cell: ({ row }) => <div><div className="font-medium">{row.original.name}</div><div className="text-xs text-muted-foreground">{row.original.code}</div></div> },
    { header: "City", accessorKey: "city" },
    { header: "Type", accessorKey: "type" },
    { header: "Departments", accessorKey: "departments" },
    { header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Open</Button> },
  ], []);
  return (
    <ProtectedAdmin>
      {() => (
        <>
          <PageHeader eyebrow="Phase 2 • Future Ready" title="Branch Management" description="Single-hospital mode today, with branch-ready information architecture reserved for future expansion." actions={<><DisabledFutureAction /><Button disabled><Plus className="h-4 w-4" />Add branch</Button></>} />
          <AdminSection title="Single hospital mode" description="Future branches are visible as disabled records so current users are not confused by unavailable operations."><DataTable data={mockBranches} columns={columns} /></AdminSection>
          <Drawer open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} title={selected?.name ?? "Branch"} description="Overview, departments, contacts, and future settings.">
            {selected ? <DrawerTabs><TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="departments">Departments</TabsTrigger><TabsTrigger value="contacts">Contacts</TabsTrigger><TabsTrigger value="future">Future settings</TabsTrigger></TabsList><TabsContent value="overview"><DetailRow label="Code" value={selected.code} /><DetailRow label="Type" value={selected.type} /><DetailRow label="Status" value={<StatusBadge status={selected.status} />} /></TabsContent><TabsContent value="departments"><DetailRow label="Departments" value={`${selected.departments} available`} /></TabsContent><TabsContent value="contacts"><DetailRow label="Contact" value={selected.status === "Active" ? mockHospitalProfile.phone : "Future setup"} /></TabsContent><TabsContent value="future"><SecurityNote /></TabsContent></DrawerTabs> : null}
          </Drawer>
        </>
      )}
    </ProtectedAdmin>
  );
}

export function SecurityPage() {
  const [confirm, setConfirm] = React.useState<{ target: string; action: string } | null>(null);
  return (
    <ProtectedAdmin>
      {({ readOnly }) => (
        <>
          <PageHeader eyebrow="Phase 2 • Security" title="Security Management" description="Sessions, devices, IP restrictions, password policy, MFA policy, and login rules." actions={<Button disabled={readOnly} onClick={() => toast.success("Security policy saved in static preview")}><Save className="h-4 w-4" />Save policy</Button>} />
          <SummaryGrid><StatCard label="Active sessions" value={mockSecuritySessions.filter((s) => s.status === "Active").length} icon={ShieldCheck} change="Live" context="Current access" tone="success" /><StatCard label="Failed attempts" value={5} icon={ShieldAlert} change="Last 24h" context="Login risk" tone="danger" /><StatCard label="Trusted devices" value={mockDevices.filter((d) => d.trustStatus === "Trusted").length} icon={UserCog} change="Approved" context="Remembered devices" tone="info" /><StatCard label="Blocked IPs" value={mockIpRules.filter((r) => r.type === "Block").length} icon={Lock} change="Restricted" context="IP rules" tone="warning" /></SummaryGrid>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="sessions">Sessions</TabsTrigger><TabsTrigger value="devices">Devices</TabsTrigger><TabsTrigger value="ip">IP restrictions</TabsTrigger><TabsTrigger value="password">Password policy</TabsTrigger><TabsTrigger value="mfa">MFA policy</TabsTrigger><TabsTrigger value="login">Login rules</TabsTrigger></TabsList>
            <TabsContent value="overview"><SecurityNote /></TabsContent>
            <TabsContent value="sessions"><SessionsTable data={mockSecuritySessions} onRisk={(row) => setConfirm({ target: row.user, action: "Force logout" })} /></TabsContent>
            <TabsContent value="devices"><DevicesTable data={mockDevices} onRisk={(row) => setConfirm({ target: row.name, action: "Block device" })} /></TabsContent>
            <TabsContent value="ip"><IpRulesTable onRisk={(target) => setConfirm({ target, action: "Disable IP rule" })} /></TabsContent>
            <TabsContent value="password"><PolicyGrid fields={[["Minimum length", `${mockPasswordPolicy.minLength}`], ["Uppercase", "Required"], ["Lowercase", "Required"], ["Number", "Required"], ["Special character", "Required"], ["Expiry", `${mockPasswordPolicy.expiryDays} days`], ["Failed lock count", `${mockPasswordPolicy.failedAttemptLockCount}`], ["Reuse limit", `${mockPasswordPolicy.reuseLimit}`]]} /></TabsContent>
            <TabsContent value="mfa"><PolicyGrid fields={[["Admin roles", mockMfaPolicy.requiredForAdmin ? "Required" : "Optional"], ["Security settings", "Required"], ["Financial approvals", "Required placeholder"], ["Methods", mockMfaPolicy.methods.join(", ")], ["Trusted device", `${mockMfaPolicy.trustedDeviceDurationDays} days`], ["Failed OTP limit", `${mockMfaPolicy.failedAttemptLimit}`]]} /></TabsContent>
            <TabsContent value="login"><PolicyGrid fields={[["Session timeout", "30 minutes"], ["Remember device", "Allowed after MFA"], ["Multiple sessions", "Warn and allow"], ["First login", "Force password change"], ["Location warning", "Enabled placeholder"], ["New device alert", "Enabled placeholder"]]} /></TabsContent>
          </Tabs>
          <ConfirmDrawer open={Boolean(confirm)} onOpenChange={(open) => !open && setConfirm(null)} title="Security confirmation" target={confirm?.target ?? ""} action={confirm?.action ?? ""} />
        </>
      )}
    </ProtectedAdmin>
  );
}

function SessionsTable({ data, onRisk }: { data: SecuritySession[]; onRisk: (row: SecuritySession) => void }) {
  const columns = React.useMemo<ColumnDef<SecuritySession>[]>(() => [
    { header: "User", accessorKey: "user" }, { header: "Role", accessorKey: "role" }, { header: "Device", accessorKey: "device" }, { header: "IP address", accessorKey: "ipAddress" }, { header: "Last activity", accessorKey: "lastActivity" }, { header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> }, { header: "Actions", cell: ({ row }) => <Button size="sm" variant="danger" onClick={() => onRisk(row.original)}>Force logout</Button> },
  ], [onRisk]);
  return <DataTable data={data} columns={columns} />;
}

function DevicesTable({ data, onRisk }: { data: TrustedDevice[]; onRisk: (row: TrustedDevice) => void }) {
  const columns = React.useMemo<ColumnDef<TrustedDevice>[]>(() => [
    { header: "Device", accessorKey: "name" }, { header: "User", accessorKey: "user" }, { header: "Browser", accessorKey: "browser" }, { header: "Last used", accessorKey: "lastUsed" }, { header: "Trust", cell: ({ row }) => <StatusBadge status={row.original.trustStatus} /> }, { header: "Risk", cell: ({ row }) => <RiskBadge risk={row.original.risk} /> }, { header: "Actions", cell: ({ row }) => <Button size="sm" variant="danger" onClick={() => onRisk(row.original)}>Block</Button> },
  ], [onRisk]);
  return <DataTable data={data} columns={columns} />;
}

function IpRulesTable({ onRisk }: { onRisk: (target: string) => void }) {
  const columns = React.useMemo<ColumnDef<(typeof mockIpRules)[number]>[]>(() => [
    { header: "IP/range", accessorKey: "range" }, { header: "Type", accessorKey: "type" }, { header: "Description", accessorKey: "description" }, { header: "Added by", accessorKey: "addedBy" }, { header: "Status", cell: ({ row }) => <StatusBadge status={row.original.status} /> }, { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => onRisk(row.original.range)}>Disable</Button> },
  ], [onRisk]);
  return <DataTable data={mockIpRules} columns={columns} />;
}

function PolicyGrid({ fields }: { fields: [string, string][] }) {
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{fields.map(([label, value]) => <Card key={label}><CardContent className="p-3"><div className="text-xs text-muted-foreground">{label}</div><div className="mt-1 text-sm font-medium">{value}</div></CardContent></Card>)}</div>;
}

export function AuditLogsPage() {
  const [search, setSearch] = React.useState("");
  const [severity, setSeverity] = React.useState("All severity");
  const [selected, setSelected] = React.useState<AuditLog | null>(null);
  const filtered = mockAuditLogs.filter((log) => textMatch(`${log.actorName} ${log.module} ${log.eventType} ${log.target} ${log.ipAddress}`, search) && (severity === "All severity" || log.severity === severity));
  const columns = React.useMemo<ColumnDef<AuditLog>[]>(() => [
    { header: "Time", accessorKey: "timestamp" }, { header: "User", accessorKey: "actorName" }, { header: "Role", accessorKey: "actorRole" }, { header: "Module", accessorKey: "module" }, { header: "Event", accessorKey: "eventType" }, { header: "Target", accessorKey: "target" }, { header: "IP", accessorKey: "ipAddress" }, { header: "Severity", cell: ({ row }) => <StatusBadge status={row.original.severity} /> }, { header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>Details</Button> },
  ], []);
  return (
    <ProtectedAdmin allowed={["Super Admin", "Hospital Admin"]} readOnly={["Management"]}>
      {() => (
        <>
          <PageHeader eyebrow="Phase 2 • Immutable Audit" title="Audit Logs" description="Searchable read-only activity records for user, role, setup, and security events." actions={<><Button variant="outline" onClick={() => pageToast("Audit print")}><Printer className="h-4 w-4" />Print</Button><Button variant="outline" onClick={() => pageToast("Audit export")}><Download className="h-4 w-4" />Export</Button></>} />
          <SummaryGrid><StatCard label="Events today" value={3} icon={FileText} change="Static" context="Read-only log" tone="info" /><StatCard label="Security events" value={2} icon={ShieldAlert} change="Review" context="Needs attention" tone="danger" /><StatCard label="Permission changes" value={1} icon={SlidersHorizontal} change="Pending" context="Approval trail" tone="warning" /><StatCard label="Critical events" value={1} icon={Lock} change="High" context="Priority event" tone="critical" /></SummaryGrid>
          <FilterBar search={search} onSearch={setSearch} placeholder="Search audit event, user, module, target, IP..."><NativeSelect label="Severity" value={severity} onChange={setSeverity} options={["All severity", "Info", "Warning", "Critical", "Security"]} /></FilterBar>
          <DataTable data={filtered} columns={columns} />
          <Drawer open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)} title={selected?.eventType ?? "Audit event"} description="Read-only detail. Clinical and sensitive values are masked.">
            {selected ? <div><DetailRow label="Actor" value={`${selected.actorName} (${selected.actorRole})`} /><DetailRow label="Target" value={selected.target} /><DetailRow label="Module" value={selected.module} /><DetailRow label="Device/IP" value={`${selected.device} • ${selected.ipAddress}`} /><DetailRow label="Before" value={selected.before} masked={selected.sensitiveFieldsMasked} /><DetailRow label="After" value={selected.after} masked={selected.sensitiveFieldsMasked} /><SecurityNote /></div> : null}
          </Drawer>
        </>
      )}
    </ProtectedAdmin>
  );
}
