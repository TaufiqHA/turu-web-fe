import { Client, Complaint, BillingHistory, InventoryItem, NetworkNode, User, DepositReport, Expense } from './types';

export const initialInventory: Record<string, InventoryItem> = {
  router: { id: 'router', name: 'Router ZTE F609', stock: 15, inToday: 5, outToday: 2, icon: 'router', color: 'blue' },
  kabel: { id: 'kabel', name: 'Drop Core (Roll)', stock: 5, inToday: 0, outToday: 1, icon: 'cable', color: 'slate' },
  htd: { id: 'htd', name: 'HTB / Converter', stock: 24, inToday: 10, outToday: 0, icon: 'server', color: 'purple' }
};

export const initialClients: Client[] = [
  { id: 2605143, name: "Bu Ningsih (Belum Bayar Hari Ini)", package: "40 Mbps", fee: "Rp 135.000", status: "menunggu", netStatus: "aktif", lat: -7.1520, lng: 111.8760, address: "Jl. Pemuda No 5", photo: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80", phone: "6289999901", password: "123456", role: "pelanggan" },
  { id: 2605171, name: "Warung Kopi Jaya (Belum Bayar Hari Ini)", package: "50 Mbps", fee: "Rp 200.000", status: "menunggu", netStatus: "aktif", lat: -7.1530, lng: 111.8770, address: "Jl. Diponegoro", photo: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=400&q=80", phone: "6289999902", password: "123456", role: "pelanggan" },
  { id: 2605199, name: "Pak Darmo Kios (Belum Bayar Hari Ini)", package: "20 Mbps", fee: "Rp 110.000", status: "menunggu", netStatus: "aktif", lat: -7.1540, lng: 111.8780, address: "Pasar Senen Kios 12", photo: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80", phone: "6289999903", password: "123456", role: "pelanggan" },
  { id: 2605100, name: "Pak RT Setempat", package: "40 Mbps", fee: "Rp 135.000", status: "nunggak", netStatus: "isolir", lat: -7.1555, lng: 111.8740, address: "Jl. Veteran No 1", photo: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80", phone: "6281234567888", password: "123456", role: "pelanggan", kolektorId: 6 },
  { id: 2605101, name: "Warkop Cak Nunu", package: "50 Mbps", fee: "Rp 300.000", status: "nunggak", netStatus: "isolir", lat: -7.1550, lng: 111.8750, address: "Jl. Veteran No 45", photo: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=400&q=80", phone: "6281234567890", password: "123456", role: "pelanggan", kolektorId: 6 },
  { id: 2605102, name: "Kos Putri Melati", package: "40 Mbps", fee: "Rp 135.000", status: "lunas", netStatus: "aktif", lat: -7.1480, lng: 111.8900, address: "Gg. Mawar 2", photo: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80", phone: "6281234567891", password: "123456", role: "pelanggan" },
  { id: 2605103, name: "Toko Sembako H. Aji", package: "20 Mbps", fee: "Rp 150.000", status: "nunggak", netStatus: "aktif", lat: -7.1600, lng: 111.8850, address: "Pasar Baru No 12", photo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80", phone: "6281234567892", password: "123456", role: "pelanggan", kolektorId: 6 },
  { id: 2605104, name: "Budi Santoso", package: "40 Mbps", fee: "Rp 135.000", status: "menunggu_acc", netStatus: "tidak_aktif", lat: -7.1510, lng: 111.8800, address: "Jl. Pemuda", photo: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80", phone: "6281234567893", password: "123456", role: "pelanggan" },
  { id: 2605105, name: "MEJERUKRENDI", package: "40 Mbps", fee: "Rp 135.000", status: "lunas", netStatus: "aktif", lat: -7.093522604155865, lng: 111.97649441839526, address: "Titik Kordinat Klien", photo: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=400&q=80", phone: "6287898870478", password: "123456", role: "pelanggan" },
  { id: 2605106, name: "Ibu Siti Rumah", package: "20 Mbps", fee: "Rp 150.000", status: "nunggak", netStatus: "isolir", lat: -7.1585, lng: 111.8860, address: "Pasar Baru Barat", photo: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=400&q=80", phone: "6287898870500", password: "123456", role: "pelanggan", kolektorId: 6 },
  { id: 2605107, name: "Bengkel Motor Agung", package: "40 Mbps", fee: "Rp 135.000", status: "nunggak", netStatus: "aktif", lat: -7.1530, lng: 111.8795, address: "Jl. Pemuda Ujung", photo: "https://images.unsplash.com/photo-1626248358172-23f46f481846?auto=format&fit=crop&w=400&q=80", phone: "6287898870501", password: "123456", role: "pelanggan" }
];

export const initialComplaints: Complaint[] = [
  { id: 101, clientId: 2605103, name: "Toko Sembako H.", issue: "Koneksi lambat saat malam hari", status: "open", date: "23 Mei 2026, 08:30" },
  { id: 102, clientId: 2605105, name: "MEJERUKRENDI", issue: "Kabel FO depan rumah tersangkut truk", status: "resolved", date: "20 Mei 2026, 14:15" }
];

export const initialBillingHistory: BillingHistory[] = [
  { clientId: 2605105, month: "April 2026", amount: "Rp 135.000", status: "Lunas", date: "02 Apr 2026", method: "Transfer" },
  { clientId: 2605105, month: "Maret 2026", amount: "Rp 135.000", status: "Lunas", date: "05 Mar 2026", method: "Cash" },
  { clientId: 2605105, month: "Februari 2026", amount: "Rp 135.000", status: "Lunas", date: "03 Feb 2026", method: "QRIS" }
];

export const initialNetworkNodes: NetworkNode[] = [
  { id: 'srv-1', type: 'server', name: 'Server OLT Pusat', lat: -7.1509, lng: 111.8817 },
  { id: 'odc-1', type: 'odc', name: 'ODC 01 - Veteran', lat: -7.1530, lng: 111.8780 },
  { id: 'odp-1', type: 'odp', name: 'ODP 01A - Veteran', lat: -7.1540, lng: 111.8760 }
];

export const initialTeamMembers: User[] = [
  { id: 1, name: "Faisal", username: "superadmin", role: "superadmin", status: "aktif", password: "123456" },
  { id: 2, name: "Siti Finance", username: "finance", role: "finance", status: "aktif", password: "123456" },
  { id: 3, name: "Jono", username: "teknisi", role: "teknisi", status: "aktif", password: "123456" },
  { id: 4, name: "Budi", username: "gudang", role: "gudang", status: "aktif", password: "123456" },
  { id: 5, name: "Putri HD", username: "helpdesk", role: "helpdesk", status: "aktif", password: "123456" },
  { id: 6, name: "Agus Penagih", username: "kolektor", role: "kolektor", status: "aktif", password: "123456" }
];

export const initialDepositReports: DepositReport[] = [
  {
    id: 1,
    kolektorId: 6,
    kolektorName: 'Agus Penagih',
    amount: 500000,
    note: 'Setoran pagi',
    status: 'pending',
    timestamp: Date.now() - 3600000
  }
];

export const initialExpenses: Expense[] = [
  {
    id: 1,
    type: 'out',
    category: 'Operasional',
    amount: 850000,
    note: 'Tarik dana mingguan operasional team',
    timestamp: Date.now() - 86400000,
    operator: 'Finance'
  }
];
