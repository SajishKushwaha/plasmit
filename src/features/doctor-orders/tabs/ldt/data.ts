export const ldtTestOptions = [
  "PICC line",
  "Foley catheter",
  "Peripheral IV cannula",
] as const;

export const ldtPriorities = ["Routine", "Urgent", "STAT"] as const;
export const ldtStatuses = ["Pending", "Active", "Completed", "Cancelled"] as const;
export const ldtOrderTypes = ["Insert", "Remove", "Replace"] as const;
