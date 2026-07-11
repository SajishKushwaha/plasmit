export type LdtOrderStatus = "Pending" | "Active" | "Completed" | "Cancelled";
export type LdtOrderPriority = "Routine" | "Urgent" | "STAT";
export type LdtOrderType = "Insert" | "Remove" | "Replace";

export type LdtOrder = {
  id: string;
  orderNo: string;
  orderType: LdtOrderType;
  ldtName: string;
  priority: LdtOrderPriority;
  orderDate: string;
  status: LdtOrderStatus;
  patientName: string;
  patientId: string;
  doctorName: string;
  notes: string;
};

export type LdtOrderFormValues = Omit<LdtOrder, "id" | "orderNo">;
