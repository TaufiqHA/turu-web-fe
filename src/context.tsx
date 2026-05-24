import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Client, Complaint, BillingHistory, InventoryItem, NetworkNode, Role, TechnicianHistory, InventoryHistory, DepositReport, Expense } from './types';
import { initialClients, initialComplaints, initialBillingHistory, initialInventory, initialNetworkNodes, initialTeamMembers, initialDepositReports, initialExpenses } from './data';
import { initAuth, googleSignIn, logoutGoogle } from './firebaseAuth';
import type { User as FirebaseUser } from 'firebase/auth';

interface AppContextType {
  user: User | null;
  role: Role | null;
  googleUser: FirebaseUser | null;
  connectGoogle: () => Promise<void>;
  disconnectGoogle: () => Promise<void>;
  login: (username: string, pass: string) => boolean;
  logout: () => void;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  complaints: Complaint[];
  setComplaints: React.Dispatch<React.SetStateAction<Complaint[]>>;
  billingHistory: BillingHistory[];
  setBillingHistory: React.Dispatch<React.SetStateAction<BillingHistory[]>>;
  inventory: Record<string, InventoryItem>;
  setInventory: React.Dispatch<React.SetStateAction<Record<string, InventoryItem>>>;
  inventoryHistory: InventoryHistory[];
  setInventoryHistory: React.Dispatch<React.SetStateAction<InventoryHistory[]>>;
  networkNodes: NetworkNode[];
  setNetworkNodes: React.Dispatch<React.SetStateAction<NetworkNode[]>>;
  teamMembers: User[];
  setTeamMembers: React.Dispatch<React.SetStateAction<User[]>>;
  technicianHistory: TechnicianHistory[];
  setTechnicianHistory: React.Dispatch<React.SetStateAction<TechnicianHistory[]>>;
  depositReports: DepositReport[];
  setDepositReports: React.Dispatch<React.SetStateAction<DepositReport[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  
  const [clients, setClients] = useState<Client[]>(() => {
    const local = localStorage.getItem('isp_clients_v2');
    return local ? JSON.parse(local) : initialClients;
  });
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const local = localStorage.getItem('isp_complaints');
    return local ? JSON.parse(local) : initialComplaints;
  });
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>(() => {
    const local = localStorage.getItem('isp_billingHistory');
    return local ? JSON.parse(local) : initialBillingHistory;
  });
  const [inventory, setInventory] = useState<Record<string, InventoryItem>>(() => {
    const local = localStorage.getItem('isp_inventory');
    return local ? JSON.parse(local) : initialInventory;
  });
  const [inventoryHistory, setInventoryHistory] = useState<InventoryHistory[]>(() => {
    const local = localStorage.getItem('isp_inventoryHistory');
    return local ? JSON.parse(local) : [];
  });
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>(() => {
    const local = localStorage.getItem('isp_networkNodes');
    return local ? JSON.parse(local) : initialNetworkNodes;
  });
  const [teamMembers, setTeamMembers] = useState<User[]>(() => {
    const local = localStorage.getItem('isp_teamMembers');
    return local ? JSON.parse(local) : initialTeamMembers;
  });
  const [technicianHistory, setTechnicianHistory] = useState<TechnicianHistory[]>(() => {
    const local = localStorage.getItem('isp_technicianHistory');
    return local ? JSON.parse(local) : [];
  });
  const [depositReports, setDepositReports] = useState<DepositReport[]>(() => {
    const local = localStorage.getItem('isp_depositReports');
    return local ? JSON.parse(local) : initialDepositReports;
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const local = localStorage.getItem('isp_expenses');
    return local ? JSON.parse(local) : initialExpenses;
  });

  useEffect(() => {
    localStorage.setItem('isp_clients_v2', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('isp_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('isp_billingHistory', JSON.stringify(billingHistory));
  }, [billingHistory]);

  useEffect(() => {
    localStorage.setItem('isp_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('isp_inventoryHistory', JSON.stringify(inventoryHistory));
  }, [inventoryHistory]);

  useEffect(() => {
    localStorage.setItem('isp_networkNodes', JSON.stringify(networkNodes));
  }, [networkNodes]);

  useEffect(() => {
    localStorage.setItem('isp_teamMembers', JSON.stringify(teamMembers));
  }, [teamMembers]);

  useEffect(() => {
    localStorage.setItem('isp_technicianHistory', JSON.stringify(technicianHistory));
  }, [technicianHistory]);

  useEffect(() => {
    localStorage.setItem('isp_depositReports', JSON.stringify(depositReports));
  }, [depositReports]);

  useEffect(() => {
    localStorage.setItem('isp_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    const unsubscribe = initAuth((user) => setGoogleUser(user), () => setGoogleUser(null));
    return () => unsubscribe();
  }, []);

  const connectGoogle = async () => {
    const res = await googleSignIn();
    if (res?.user) setGoogleUser(res.user);
  };

  const disconnectGoogle = async () => {
    await logoutGoogle();
    setGoogleUser(null);
  };

  const login = (usernameOrPhone: string, pass: string) => {
    const userLower = usernameOrPhone.trim().toLowerCase();
    
    const staff = teamMembers.find(t => t.username === userLower && t.password === pass);
    if (staff) {
      if (staff.status !== 'aktif') return false;
      setUser(staff);
      setRole(staff.role);
      setActiveTab('home');
      return true;
    }
    
    const client = clients.find(c => c.phone === userLower && c.password === pass);
    if (client) {
      setUser(client);
      setRole('pelanggan');
      setActiveTab('home');
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    setActiveTab('home');
  };

  return (
    <AppContext.Provider value={{
      user, role, googleUser, connectGoogle, disconnectGoogle, login, logout,
      clients, setClients,
      complaints, setComplaints,
      billingHistory, setBillingHistory,
      inventory, setInventory,
      inventoryHistory, setInventoryHistory,
      networkNodes, setNetworkNodes,
      teamMembers, setTeamMembers,
      technicianHistory, setTechnicianHistory,
      depositReports, setDepositReports,
      expenses, setExpenses,
      activeTab, setActiveTab
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
}
