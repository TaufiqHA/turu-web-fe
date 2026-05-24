import { useState } from "react";
import { useAppContext } from "../../context";
import { Wallet, Plus, Trash2, ArrowDown, ArrowUp } from "lucide-react";
import Swal from "sweetalert2";

export function Expenses() {
  const { expenses, setExpenses, role, user } = useAppContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState<"all" | "in" | "out">("all");

  const handleAddRecord = () => {
    Swal.fire({
      title: "Input Catatan Keuangan",
      html: `
            <div class="space-y-3 mt-2 text-left">
                <div>
                   <label class="text-[10px] uppercase font-bold text-slate-500">Jenis Transaksi</label>
                   <select id="e-type" class="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-fGreen">
                       <option value="in">Pemasukan (+)</option>
                       <option value="out">Pengeluaran (-)</option>
                   </select>
                </div>
                <div>
                   <label class="text-[10px] uppercase font-bold text-slate-500">Kategori</label>
                   <select id="e-kategori" class="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-fGreen">
                       <option value="Operasional">Operasional</option>
                       <option value="Deposit">Deposit / Setoran</option>
                       <option value="Bensin">BBM / Bensin</option>
                       <option value="Makan">Konsumsi / Makan</option>
                       <option value="Lainnya">Lainnya</option>
                   </select>
                </div>
                <div>
                   <label class="text-[10px] uppercase font-bold text-slate-500">Jumlah Biaya (Rp)</label>
                   <input type="number" id="e-jumlah" class="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-fGreen" placeholder="Misal: 50000">
                </div>
                <div>
                   <label class="text-[10px] uppercase font-bold text-slate-500">Keterangan / Tujuan</label>
                   <textarea id="e-note" rows="2" class="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-fGreen" placeholder="Misal: Beli bensin teknisi"></textarea>
                </div>
            </div>
          `,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      confirmButtonColor: "#10b981",
      cancelButtonText: "Batal",
      preConfirm: () => {
        const type = (document.getElementById("e-type") as HTMLSelectElement)
          .value;
        const kategori = (
          document.getElementById("e-kategori") as HTMLSelectElement
        ).value;
        const jumlah = (document.getElementById("e-jumlah") as HTMLInputElement)
          .value;
        const note = (document.getElementById("e-note") as HTMLTextAreaElement)
          .value;

        if (!jumlah) {
          Swal.showValidationMessage("Jumlah biaya wajib diisi");
          return false;
        }
        return { type, kategori, jumlah: parseInt(jumlah), note };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const newEx = {
          id: Date.now(),
          type: result.value.type as "in" | "out",
          category: result.value.kategori,
          amount: result.value.jumlah,
          note: result.value.note || "-",
          operator: user?.name || "Unknown",
          timestamp: Date.now(),
        };
        setExpenses((prev) => [newEx, ...prev]);
        Swal.fire("Tersimpan", "Data keuangan berhasil dicatat.", "success");
      }
    });
  };

  const handleDelete = (id: string | number) => {
    Swal.fire({
      title: "Hapus data?",
      text: "Data keuangan ini akan dihapus secara permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      confirmButtonColor: "#e11d48",
    }).then((res) => {
      if (res.isConfirmed) {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
        Swal.fire("Terhapus", "", "success");
      }
    });
  };

  const filtered = expenses.filter(
    (e) =>
      (tab === "all" || e.type === tab) &&
      (e.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const totalIn = expenses
    .filter((e) => e.type === "in")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalOut = expenses
    .filter((e) => e.type === "out")
    .reduce((acc, curr) => acc + curr.amount, 0);
  const net = totalIn - totalOut;

  return (
    <div className="p-4 space-y-4 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 container">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-black text-slate-800">Finance</h2>
          <p className="text-xs text-slate-500">Pemasukan & Pengeluaran</p>
        </div>
        <button
          onClick={handleAddRecord}
          className="w-10 h-10 bg-fGreen text-white rounded-full flex items-center justify-center hover:bg-emerald-600 transition shadow-sm"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden flex flex-col p-3">
          <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
            <ArrowDown className="w-3 h-3 text-emerald-500" /> Pemasukan
          </p>
          <p className="text-sm font-black text-emerald-600">
            Rp {totalIn.toLocaleString("id-ID")}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-rose-100 overflow-hidden flex flex-col p-3">
          <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 flex items-center gap-1">
            <ArrowUp className="w-3 h-3 text-rose-500" /> Pengeluaran
          </p>
          <p className="text-sm font-black text-rose-600">
            Rp {totalOut.toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl shadow-md overflow-hidden flex flex-col p-4 text-center">
        <p className="text-[10px] text-slate-300 uppercase font-bold mb-1">
          Saldo Bersih (Net)
        </p>
        <p
          className={`text-2xl font-black ${net >= 0 ? "text-emerald-400" : "text-rose-400"}`}
        >
          Rp {net.toLocaleString("id-ID")}
        </p>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setTab("all")}
          className={`flex-1 text-xs font-bold py-2 rounded-lg transition ${tab === "all" ? "bg-white shadow-sm text-slate-800" : "text-slate-500"}`}
        >
          Semua
        </button>
        <button
          onClick={() => setTab("in")}
          className={`flex-1 text-xs font-bold py-2 rounded-lg transition ${tab === "in" ? "bg-white shadow-sm text-emerald-600" : "text-slate-500"}`}
        >
          Masuk
        </button>
        <button
          onClick={() => setTab("out")}
          className={`flex-1 text-xs font-bold py-2 rounded-lg transition ${tab === "out" ? "bg-white shadow-sm text-rose-600" : "text-slate-500"}`}
        >
          Keluar
        </button>
      </div>

      <input
        type="text"
        placeholder="Cari keterangan atau kategori..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-white border border-slate-200 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-fGreen shadow-sm"
      />

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="text-center text-slate-400 text-xs py-10 bg-white rounded-xl border border-slate-100">
            Tidak ada data.
          </p>
        ) : (
          filtered.map((ex) => (
            <div
              key={ex.id}
              className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-start gap-3"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${ex.type === "in" ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"}`}
              >
                <Wallet className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm text-slate-800 line-clamp-1">
                    {ex.category}
                  </h3>
                  <span
                    className={`font-bold text-sm shrink-0 whitespace-nowrap ml-2 ${ex.type === "in" ? "text-emerald-600" : "text-rose-600"}`}
                  >
                    {ex.type === "in" ? "+" : "-"} Rp{" "}
                    {ex.amount.toLocaleString("id-ID")}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                  {ex.note}
                </p>
                <div className="flex gap-2 mt-2 items-center">
                  <span className="text-[9px] text-slate-400">
                    {new Date(ex.timestamp).toLocaleString("id-ID")}
                  </span>
                  <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">
                    {ex.operator}
                  </span>
                </div>
              </div>
              {(role === "superadmin" || role === "finance") && (
                <button
                  onClick={() => handleDelete(ex.id)}
                  className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
