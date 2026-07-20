export type DoctorStatus = "Available" | "Busy" | "In Consultation" | "Emergency Call" | "Offline";
export type ConsultationMode = "OPD" | "Video" | "Emergency" | "Follow-up";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export const doctorProfile = {
  name: "Dr. Ananya Rao",
  specialization: "Senior Consultant, Cardiology",
  branch: "Apollo Heart Centre, Chennai",
  department: "Cardiology OPD",
  shift: "08:00 AM - 04:00 PM",
  nextAppointment: "09:45 AM",
};

export const doctorSidebar = [
  "Dashboard",
  "Appointments",
  "OPD Queue",
  "Availability",
  "Patient Records",
  "Prescriptions",
  "Lab Reports",
  "Emergency Alerts",
  "Telemedicine",
  "Messages",
  "Billing Overview",
  "Analytics",
  "Settings",
];

export const doctorStatuses: DoctorStatus[] = ["Available", "Busy", "In Consultation", "Emergency Call", "Offline"];
export const consultationModes: ConsultationMode[] = ["OPD", "Video", "Emergency", "Follow-up"];

export const availabilitySlots = [
  { id: "slot-1", day: "Mon", time: "08:00", end: "10:30", mode: "OPD" as ConsultationMode, branch: "Main", occupied: 82, capacity: 18 },
  { id: "slot-2", day: "Mon", time: "11:00", end: "13:00", mode: "Follow-up" as ConsultationMode, branch: "Main", occupied: 54, capacity: 12 },
  { id: "slot-3", day: "Tue", time: "09:00", end: "11:30", mode: "Video" as ConsultationMode, branch: "Digital", occupied: 38, capacity: 10 },
  { id: "slot-4", day: "Wed", time: "08:30", end: "12:00", mode: "OPD" as ConsultationMode, branch: "North Wing", occupied: 91, capacity: 22 },
  { id: "slot-5", day: "Thu", time: "13:30", end: "15:30", mode: "Emergency" as ConsultationMode, branch: "Main", occupied: 68, capacity: 8 },
  { id: "slot-6", day: "Fri", time: "10:00", end: "14:00", mode: "OPD" as ConsultationMode, branch: "Main", occupied: 73, capacity: 20 },
];

export const busyHeatmap = [
  { time: "08", Mon: 48, Tue: 31, Wed: 60, Thu: 28, Fri: 52 },
  { time: "09", Mon: 74, Tue: 45, Wed: 82, Thu: 36, Fri: 71 },
  { time: "10", Mon: 91, Tue: 53, Wed: 88, Thu: 61, Fri: 86 },
  { time: "11", Mon: 76, Tue: 68, Wed: 79, Thu: 73, Fri: 77 },
  { time: "12", Mon: 42, Tue: 40, Wed: 46, Thu: 55, Fri: 58 },
  { time: "13", Mon: 24, Tue: 35, Wed: 30, Thu: 82, Fri: 62 },
  { time: "14", Mon: 38, Tue: 51, Wed: 44, Thu: 71, Fri: 57 },
  { time: "15", Mon: 20, Tue: 29, Wed: 26, Thu: 44, Fri: 33 },
];

export const appointments = [
  {
    id: "APT-1042",
    patient: "Meera Iyer",
    initials: "MI",
    uhid: "UHID-009428",
    ageGender: "54 / F",
    vitals: "BP 148/92, HR 96",
    type: "OPD",
    time: "09:30 AM",
    wait: "18 min",
    risk: "High" as RiskLevel,
    priority: "Priority",
    insurance: "Star Health active",
    history: "CAD follow-up, 3 visits",
    status: "Waiting",
  },
  {
    id: "APT-1043",
    patient: "Arjun Menon",
    initials: "AM",
    uhid: "UHID-008812",
    ageGender: "38 / M",
    vitals: "SpO2 98%, HR 78",
    type: "Video",
    time: "09:45 AM",
    wait: "04 min",
    risk: "Low" as RiskLevel,
    priority: "Routine",
    insurance: "Self pay",
    history: "Palpitation review",
    status: "Checked in",
  },
  {
    id: "APT-1044",
    patient: "Naseer Khan",
    initials: "NK",
    uhid: "UHID-006183",
    ageGender: "67 / M",
    vitals: "BP 168/102, Glu 214",
    type: "Emergency",
    time: "10:05 AM",
    wait: "02 min",
    risk: "Critical" as RiskLevel,
    priority: "Emergency",
    insurance: "CGHS verified",
    history: "Post-angioplasty, 6 visits",
    status: "Nurse escalation",
  },
];

export const queue = [
  { token: "C-018", name: "Meera Iyer", stage: "Vitals complete", eta: "06 min", progress: 72, critical: false },
  { token: "E-004", name: "Naseer Khan", stage: "ECG review", eta: "Now", progress: 92, critical: true },
  { token: "C-019", name: "Arjun Menon", stage: "Telemed lobby", eta: "14 min", progress: 44, critical: false },
  { token: "F-011", name: "Ritu Sharma", stage: "Lab attached", eta: "22 min", progress: 28, critical: false },
];

export const analyticsCards = [
  { label: "Patients seen", value: "24", change: "+12%", tone: "from-sky-500 to-cyan-400" },
  { label: "Avg consult", value: "11m", change: "-2m", tone: "from-teal-500 to-emerald-400" },
  { label: "Revenue", value: "₹1.84L", change: "+18%", tone: "from-blue-600 to-indigo-500" },
  { label: "Follow-up rate", value: "64%", change: "+7%", tone: "from-cyan-500 to-blue-400" },
  { label: "Critical cases", value: "03", change: "1 active", tone: "from-rose-500 to-orange-400" },
  { label: "Efficiency", value: "92", change: "Excellent", tone: "from-emerald-500 to-teal-400" },
];

export const trendData = [
  { time: "8 AM", appointments: 8, completed: 5, delayed: 1 },
  { time: "9 AM", appointments: 14, completed: 10, delayed: 2 },
  { time: "10 AM", appointments: 18, completed: 12, delayed: 3 },
  { time: "11 AM", appointments: 16, completed: 13, delayed: 1 },
  { time: "12 PM", appointments: 10, completed: 9, delayed: 0 },
  { time: "1 PM", appointments: 7, completed: 5, delayed: 1 },
  { time: "2 PM", appointments: 12, completed: 8, delayed: 2 },
];

export const consultationTimeline = [
  "Chest discomfort started during morning walk",
  "ECG attached by nursing station",
  "Troponin pending from lab",
  "Previous angioplasty notes available",
];

export const patientInsights = [
  "Two high-risk cardiac patients are waiting; prioritize ECG review before routine follow-ups.",
  "Average waiting time is trending 8 minutes below department baseline.",
  "One prescription has a possible statin interaction; pharmacy confirmation recommended.",
];
