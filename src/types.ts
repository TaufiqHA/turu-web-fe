export type Role =
  | "superadmin"
  | "finance"
  | "teknisi"
  | "gudang"
  | "helpdesk"
  | "kolektor"
  | "pelanggan"
  | null;

export interface User {
  id: number | string;
  name: string;
  username?: string;
  role: Role;
  status?: string;
  password?: string;
  phone?: string;
  lat?: number;
  lng?: number;
}

export interface Client extends User {
  package: string;
  fee: string;
  netStatus: "aktif" | "tidak_aktif" | "isolir";
  isolirRequest?: "request_isolir" | "request_buka";
  lat: number;
  lng: number;
  address: string;
  photo: string;
  serialNumber?: string;
  kolektorId?: number | string;
  lastWaSync?: number;
}

export interface TechnicianHistory {
  id: number;
  technicianId: number | string;
  technicianName: string;
  action: string;
  locationName: string;
  lat: number;
  lng: number;
  timestamp: number;
}

export interface Complaint {
  id: number;
  clientId: number | string;
  name: string;
  issue: string;
  status: "open" | "progress" | "pending" | "resolved";
  date: string;
  progressStartTime?: number;
  progressEndTime?: number;
  pendingReason?: string;
  technicianId?: number | string;
  technicianName?: string;
}

export interface BillingHistory {
  clientId: number | string;
  month: string;
  amount: string;
  status: string;
  date: string;
  method: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  inToday: number;
  outToday: number;
  icon: string;
  color: string;
}

export interface InventoryHistory {
  id: string;
  itemId: string;
  itemName: string;
  type: "in" | "out";
  quantity: number;
  sn?: string; // Serial number if applicable
  clientName?: string; // If assigned to a client
  timestamp: string;
  operator: string;
}

export interface DepositReport {
  id: string | number;
  kolektorId: string | number;
  kolektorName: string;
  amount: number;
  note: string;
  status: "pending" | "approved" | "rejected";
  timestamp: number;
}

export interface Expense {
  id: string | number;
  type: "in" | "out";
  category: string;
  amount: number;
  note: string;
  timestamp: number;
  operator: string;
}

export interface NetworkNode {
  id: string;
  type: "server" | "odc" | "odp";
  name: string;
  lat: number;
  lng: number;
}
