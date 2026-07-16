import * as React from "react";
import { cn } from "@/lib/utils";

export const Table = React.forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(({ className, ...props }, ref) => <table className={cn("w-full text-sm", className)} ref={ref} {...props} />);
Table.displayName = "Table";
export const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>((props, ref) => <thead ref={ref} {...props} />);
TableHeader.displayName = "TableHeader";
export const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>((props, ref) => <tbody ref={ref} {...props} />);
TableBody.displayName = "TableBody";
export const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>((props, ref) => <tr ref={ref} {...props} />);
TableRow.displayName = "TableRow";
export const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>((props, ref) => <th ref={ref} {...props} />);
TableHead.displayName = "TableHead";
export const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>((props, ref) => <td ref={ref} {...props} />);
TableCell.displayName = "TableCell";
