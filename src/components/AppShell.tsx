import { useAppContext } from "../context";
import Swal from "sweetalert2";
import {
  Home,
  Receipt,
  Boxes,
  Map,
  HeadphonesIcon,
  FolderPlus,
  Users,
  MapPin,
  Wallet,
} from "lucide-react";
import { Dashboard } from "./views/Dashboard";
import { Billing } from "./views/Billing";
import { Inventory } from "./views/Inventory";
import { InputData } from "./views/InputData";
import { Complaints } from "./views/Complaints";
import { TeamManagement } from "./views/TeamManagement";
import { MapView } from "./views/Map";
import { ScanModem } from "./views/ScanModem";
import { KolektorTasks } from "./views/KolektorTasks";
import { FinanceMenu } from "./views/Finance";
import { Expenses } from "./views/Expenses";
import { Logo } from "./Logo";
import { useEffect } from "react";

export function AppShell() {
  const {
    user,
    role,
    logout,
    activeTab,
    setActiveTab,
    clients,
    setTeamMembers,
    technicianHistory,
    setTechnicianHistory,
  } = useAppContext();

  useEffect(() => {
    if (role === "teknisi" && "geolocation" in navigator && user) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setTeamMembers((prev) =>
            prev.map((m) =>
              m.id === user.id ? { ...m, lat: latitude, lng: longitude } : m,
            ),
          );
          // Optionally log to history periodically, but to avoid spamming just update current state.
          // This satisfies "MAPS WAJIB NYALA UNTUK SCRAPE DATA LOKASI TERAKHIR TEKNISI".
        },
        (error) => {
          console.warn("Location error:", error);
          if (error.code === 1) {
            // PERMISSION_DENIED
            Swal.fire({
              title: "Akses Lokasi Wajib!",
              text: "Tolong izinkan akses lokasi (GPS) pada browser Anda agar superadmin bisa memantau posisi Anda.",
              icon: "warning",
            });
          }
        },
        { enableHighAccuracy: true },
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [role, user, setTeamMembers]);

  const handleLogout = () => {
    Swal.fire({
      title: "Keluar?",
      text: "Anda akan mengakhiri sesi ini.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Keluar",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  const getRoleBadge = () => {
    return role === "pelanggan" ? "Client Area" : role;
  };

  const getNavItems = () => {
    const items: { id: string; icon: any; label: string; badge?: number }[] = [
      { id: "home", icon: Home, label: "Home" },
    ];
    const pendingBillsCount = clients.filter(
      (c) => c.status !== "lunas",
    ).length;

    switch (role) {
      case "superadmin":
        items.push(
          {
            id: "finance",
            icon: Wallet,
            label: "Finance",
            badge: pendingBillsCount,
          },
          { id: "map", icon: Map, label: "Mapping" },
          { id: "komplain", icon: HeadphonesIcon, label: "Komplain" },
          { id: "inventory", icon: Boxes, label: "Gudang" },
          { id: "input", icon: FolderPlus, label: "Data" },
        );
        break;
      case "finance":
        items.push(
          {
            id: "finance",
            icon: Wallet,
            label: "Finance",
            badge: pendingBillsCount,
          },
        );
        break;
      case "gudang":
        items.push({ id: "inventory", icon: Boxes, label: "Gudang" });
        break;
      case "kolektor":
        items.push({ id: "kolektor", icon: Map, label: "Tugas Tagih" });
        break;
      case "teknisi":
        items.push(
          { id: "inventory", icon: Boxes, label: "Gudang" },
          { id: "map", icon: Map, label: "Mapping" },
          { id: "komplain", icon: HeadphonesIcon, label: "Komplain" },
        );
        break;
      case "helpdesk":
        items.push(
          { id: "map", icon: Map, label: "Mapping" },
          { id: "input", icon: FolderPlus, label: "Data" },
          { id: "komplain", icon: HeadphonesIcon, label: "Komplain" },
        );
        break;
      case "pelanggan":
        items.push({ id: "komplain", icon: HeadphonesIcon, label: "Komplain" });
        break;
    }
    return items;
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "home":
        return <Dashboard />;
      case "finance":
        return <FinanceMenu />;
      case "billing":
        return <Billing />;
      case "kolektor":
        return <KolektorTasks />;
      case "inventory":
        return <Inventory />;
      case "expenses":
        return <Expenses />;
      case "input":
        return <InputData />;
      case "komplain":
        return <Complaints />;
      case "karyawan":
        return <TeamManagement />;
      case "map":
        return <MapView />;
      case "scan-modem":
        return <ScanModem />;
      default:
        return <Dashboard />;
    }
  };

  const showLiveBadge = ["superadmin", "teknisi", "helpdesk"].includes(
    role || "",
  );

  return (
    <>
      <header className="bg-fGreen text-white px-5 py-4 rounded-b-2xl shadow-md z-20 flex justify-between items-center shrink-0 border-t border-fGreen sm:border-none">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full p-1 shadow-sm shrink-0 overflow-hidden relative">
            <Logo className="w-[120%] h-[120%] scale-[0.8]" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-widest uppercase leading-none">
              Turu <span className="text-red-300">Sore</span>
            </h1>
            <p className="text-[9px] text-fGreenLight font-bold bg-black/20 px-1.5 py-0.5 rounded inline-block uppercase tracking-wider mt-0.5">
              {getRoleBadge()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {showLiveBadge && (
            <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded-full pulsing-dot uppercase">
              Live
            </span>
          )}
          <div
            onClick={handleLogout}
            className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white shadow-inner font-bold text-lg cursor-pointer hover:bg-white/30 transition relative group border border-white/30"
          >
            <span>{user?.name.charAt(0).toUpperCase()}</span>
            <span className="absolute -bottom-6 right-0 bg-fDark text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
              Keluar
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden bg-slate-50 flex flex-col overflow-y-auto hide-scrollbar pb-[90px]">
        {renderActiveView()}
      </div>

      <nav className="bg-white/95 backdrop-blur-[10px] border-t border-slate-200 pb-[env(safe-area-inset-bottom,15px)] absolute bottom-0 w-full flex justify-around items-center pt-2 px-1 z-20 rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)] shrink-0">
        {getNavItems().map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 flex-1 p-2 rounded-xl transition-all duration-200 ${isActive ? "text-fGreen" : "text-slate-400"}`}
            >
              <div className="relative">
                <Icon
                  className={`w-[20px] h-[20px] transition-transform ${isActive ? "-translate-y-1" : ""}`}
                />
                {item.badge ? (
                  <span className="absolute -top-1 -right-2 bg-fRed text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold px-1 min-w-[16px]">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[9px] font-bold">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
