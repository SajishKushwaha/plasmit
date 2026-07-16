export type IcuMappedDeviceType = "Ventilator" | "Monitor" | "Infusion Pump";

export type IcuDeviceMappingRow = {
  id: string;
  bedNo: string;
  patient: string;
  monitor: string;
  ventilator: string;
  infusionPump: string;
  gateway: string;
  signal: string;
  connectivity: string;
  lastData: string;
  issue: string;
  owner: string;
  uptime: number;
};

export type IcuMappedDevice = {
  type: IcuMappedDeviceType;
  deviceId: string;
};

const icuDeviceMappingRows: IcuDeviceMappingRow[] = [
  { id: "dev-001", bedNo: "ICU-A01", patient: "Aisha Khan", monitor: "MON-ICU-11", ventilator: "NIV-03", infusionPump: "PUMP-11", gateway: "GW-A", signal: "Good", connectivity: "Online", lastData: "2 min ago", issue: "No issue", owner: "Biomedical Raj", uptime: 98 },
  { id: "dev-002", bedNo: "ICU-A02", patient: "Rohan Das", monitor: "MON-ICU-12", ventilator: "VENT-07", infusionPump: "PUMP-07", gateway: "GW-A", signal: "Good", connectivity: "Online", lastData: "1 min ago", issue: "No issue", owner: "Biomedical Raj", uptime: 99 },
  { id: "dev-003", bedNo: "ICU-B03", patient: "Meera Sharma", monitor: "MON-ICU-21", ventilator: "OXY-02", infusionPump: "PUMP-14", gateway: "GW-B", signal: "Weak", connectivity: "Online", lastData: "8 min ago", issue: "Intermittent SpO2 signal", owner: "Biomedical Nisha", uptime: 91 },
  { id: "dev-004", bedNo: "ICU-B04", patient: "Kabir Ali", monitor: "MON-ICU-22", ventilator: "Room air", infusionPump: "PUMP-18", gateway: "GW-B", signal: "Good", connectivity: "Online", lastData: "5 min ago", issue: "No issue", owner: "Biomedical Nisha", uptime: 97 },
  { id: "dev-005", bedNo: "ICU-D10", patient: "Unassigned", monitor: "MON-ICU-40", ventilator: "VENT-10", infusionPump: "PUMP-22", gateway: "GW-D", signal: "No signal", connectivity: "Offline", lastData: "42 min ago", issue: "Gateway offline", owner: "Biomedical Raj", uptime: 72 },
  { id: "dev-006", bedNo: "ICU-T05", patient: "Ananya Roy", monitor: "MON-TX-05", ventilator: "Room air", infusionPump: "PUMP-15", gateway: "GW-T", signal: "Good", connectivity: "Online", lastData: "2 min ago", issue: "No issue", owner: "Biomedical Nisha", uptime: 99 },
  { id: "dev-007", bedNo: "ICU-R06", patient: "Irfan Qureshi", monitor: "MON-RSP-06", ventilator: "NIV-06", infusionPump: "PUMP-18", gateway: "GW-R", signal: "Weak", connectivity: "Online", lastData: "6 min ago", issue: "Intermittent capnography signal", owner: "Biomedical Raj", uptime: 89 },
  { id: "dev-008", bedNo: "ICU-T07", patient: "Unassigned", monitor: "MON-TX-07", ventilator: "OXY-T07", infusionPump: "PUMP-27", gateway: "GW-T", signal: "Good", connectivity: "Online", lastData: "3 min ago", issue: "No issue", owner: "Biomedical Nisha", uptime: 98 },
  { id: "dev-009", bedNo: "ICU-R08", patient: "Unassigned", monitor: "MON-RSP-08", ventilator: "NIV-08", infusionPump: "PUMP-28", gateway: "GW-R", signal: "Good", connectivity: "Online", lastData: "2 min ago", issue: "No issue", owner: "Biomedical Raj", uptime: 97 },
  { id: "dev-010", bedNo: "ICU-R09", patient: "Unassigned", monitor: "MON-RSP-09", ventilator: "VENT-09", infusionPump: "PUMP-29", gateway: "GW-R2", signal: "No signal", connectivity: "Offline", lastData: "31 min ago", issue: "Gateway and ventilator communication lost", owner: "Biomedical Raj", uptime: 68 },
];

export function getIcuDeviceMappingRows() {
  return icuDeviceMappingRows;
}

export function getMappedDevicesForPatient(patient: { bedNo: string; patientName: string }): IcuMappedDevice[] {
  const mapping = icuDeviceMappingRows.find(
    (row) => row.patient !== "Unassigned" && (row.bedNo === patient.bedNo || row.patient === patient.patientName),
  );

  if (!mapping) return [];

  const devices: IcuMappedDevice[] = [];
  if (mapping.ventilator && mapping.ventilator !== "Room air") devices.push({ type: "Ventilator", deviceId: mapping.ventilator });
  if (mapping.monitor) devices.push({ type: "Monitor", deviceId: mapping.monitor });
  if (mapping.infusionPump) devices.push({ type: "Infusion Pump", deviceId: mapping.infusionPump });
  return devices;
}
