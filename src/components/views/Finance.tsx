import { useState } from "react";
import { Billing } from "./Billing";
import { Expenses } from "./Expenses";
import { TeamManagement } from "./TeamManagement";
import { useAppContext } from "../../context";

export function FinanceMenu() {
  const [subTab, setSubTab] = useState<"tagihan" | "kas" | "tim">("tagihan");
  const { role } = useAppContext();
  return (
    <div className="flex flex-col h-full relative">
      <div className="bg-white border-b border-slate-200 px-4 pt-4 pb-3 sticky top-0 z-30 w-full shrink-0 shadow-sm shadow-slate-100/50">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setSubTab("tagihan")}
            className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-lg transition ${subTab === "tagihan" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:bg-slate-200/50"}`}
          >
            Tagihan
          </button>
          <button
            onClick={() => setSubTab("kas")}
            className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-lg transition ${subTab === "kas" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:bg-slate-200/50"}`}
          >
            Buku Kas
          </button>
          {(role === "superadmin" || role === "finance") && (
            <button
              onClick={() => setSubTab("tim")}
              className={`flex-1 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-lg transition ${subTab === "tim" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:bg-slate-200/50"}`}
            >
              Tim Kolektor
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {subTab === "tagihan" ? <Billing /> : subTab === "kas" ? <Expenses /> : <TeamManagement filterRole="kolektor" />}
      </div>
    </div>
  );
}
