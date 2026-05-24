import { getAccessToken } from './firebaseAuth';
import { Client, Complaint, BillingHistory, InventoryItem, NetworkNode, User } from './types';

const SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';

// Save SpreadSheet ID in local storage so it persists per environment
const SPREADSHEET_ID_KEY = 'turu_sore_spreadsheet_id';

export const getSpreadsheetId = () => localStorage.getItem(SPREADSHEET_ID_KEY);
export const setSpreadsheetId = (id: string) => localStorage.setItem(SPREADSHEET_ID_KEY, id);

const getHeaders = async () => {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated with Google');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const createSpreadsheet = async (title: string = 'Turu Sore ISP Data'): Promise<string> => {
  const res = await fetch(SHEETS_API, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify({
      properties: { title },
      sheets: [
        { properties: { title: 'Clients' } },
        { properties: { title: 'Complaints' } },
        { properties: { title: 'BillingHistory' } },
        { properties: { title: 'Inventory' } },
      ]
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  setSpreadsheetId(data.spreadsheetId);
  return data.spreadsheetId;
};

// Sync Data TO Sheets
export const syncToSheets = async (
  clients: Client[], 
  complaints: Complaint[], 
  billingHistory: BillingHistory[], 
  inventory: Record<string, InventoryItem>
) => {
  let spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID is missing, please link or create a sheet first.');
  }

  // Formatting data to values
  const clientsData = [['ID', 'Name', 'Phone', 'Package', 'Fee', 'Status', 'NetStatus', 'Address', 'Lat', 'Lng']];
  clients.forEach(c => clientsData.push([c.id, c.name, c.phone, c.package, c.fee, c.status, c.netStatus, c.address, c.lat, c.lng].map(String)));

  const complaintsData = [['ID', 'ClientID', 'Name', 'Issue', 'Status', 'Date']];
  complaints.forEach(c => complaintsData.push([c.id, c.clientId, c.name, c.issue, c.status, c.date].map(String)));

  const billingData = [['ClientID', 'Month', 'Amount', 'Status', 'Date', 'Method']];
  billingHistory.forEach(b => billingData.push([b.clientId, b.month, b.amount, b.status, b.date, b.method].map(String)));

  const inventoryData = [['ID', 'Name', 'Stock', 'InToday', 'OutToday']];
  Object.values(inventory).forEach(i => inventoryData.push([i.id, i.name, i.stock, i.inToday, i.outToday].map(String)));

  const data = [
    { range: 'Clients!A1', values: clientsData },
    { range: 'Complaints!A1', values: complaintsData },
    { range: 'BillingHistory!A1', values: billingData },
    { range: 'Inventory!A1', values: inventoryData }
  ];

  // We should do a valueUpdate batch request
  const body = {
    valueInputOption: 'USER_ENTERED',
    data: data
  };

  // Wait, first we should clear existing data, or simply overwrite.
  // Overwriting with USER_ENTERED will overwrite overlapping cells.
  const res = await fetch(`${SHEETS_API}/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: await getHeaders(),
    body: JSON.stringify(body)
  });
  
  const result = await res.json();
  if (result.error) {
    if (result.error.code === 404) {
      // Spreadsheet not found or deleted, clear it
      localStorage.removeItem(SPREADSHEET_ID_KEY);
    }
    throw new Error(result.error.message);
  }
  return result;
};

// Refresh Data FROM Sheets
export const fetchFromSheets = async () => {
  const spreadsheetId = getSpreadsheetId();
  if (!spreadsheetId) {
    throw new Error('Spreadsheet ID is missing.');
  }

  const ranges = ['Clients', 'Complaints', 'BillingHistory', 'Inventory'];
  const res = await fetch(`${SHEETS_API}/${spreadsheetId}/values:batchGet?ranges=${ranges.join('&ranges=')}`, {
    method: 'GET',
    headers: await getHeaders()
  });

  const result = await res.json();
  if (result.error) throw new Error(result.error.message);

  return result.valueRanges;
};
