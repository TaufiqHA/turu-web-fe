import { useAppContext } from "../../context";
import {
  MapPin,
  User,
  Phone,
  Navigation,
  AlertCircle,
  FileText,
  Send,
  CheckCircle2,
} from "lucide-react";
import { Client } from "../../types";
import Swal from "sweetalert2";

export function KolektorTasks() {
  const { clients, setClients, user, role, depositReports, setDepositReports } =
    useAppContext();

  // Jika login sebagai kolektor, hanya tampilkan tugasnya. Jika admin/finance tampilkan semua.
  const myTasks =
    role === "kolektor"
      ? clients.filter((c: Client) => c.kolektorId === user?.id)
      : clients;

  // Ambil data pelanggan yang belum lunas (nunggak atau menunggu)
  const unpaidClients = myTasks.filter((c: Client) => c.status !== "lunas");

  // Ambil data pelanggan yang sudah lunas (untuk hitung komisi)
  const paidClients = myTasks.filter(
    (c: Client) => c.status === "lunas" && c.kolektorId === user?.id,
  );

  const komisi = paidClients.length * 2000;

  // Mengelompokkan berdasarkan daerah (simpel: kata pertama dari alamat selain singkatan jalan umum)
  const getArea = (address: string) => {
    if (!address) return "Daerah Lainnya";
    const cleanAddr = address.replace(
      /^(Jl\.|Jalan|Gg\.|Gg|Gang|Dsn\.|Dsn|Desa|Ds\.|Perumahan|Perum)\s+/i,
      "",
    );
    const firstWord = cleanAddr.split(" ")[0] || "Lainnya";
    return firstWord;
  };

  const groupedTasks = unpaidClients.reduce(
    (acc, client) => {
      const area = getArea(client.address);
      if (!acc[area]) acc[area] = [];
      acc[area].push(client);
      return acc;
    },
    {} as Record<string, Client[]>,
  );

  const totalTagihan = unpaidClients.reduce((acc, client) => {
    const numFee = parseInt(client.fee.replace(/\D/g, "")) || 0;
    return acc + numFee;
  }, 0);

  const totalTerkumpul = paidClients.reduce((acc, client) => {
    const numFee = parseInt(client.fee.replace(/\D/g, "")) || 0;
    return acc + numFee;
  }, 0);

  const handleLaporFinance = () => {
    Swal.fire({
      title: "Lapor Setoran Harian",
      html: `
            <div class="text-left mt-2 space-y-3 p-2 bg-slate-50 rounded-lg">
                <p class="text-xs text-slate-600 mb-2">Total potensi tagihan hari ini: Rp ${totalTagihan.toLocaleString("id-ID")}</p>
                <div class="bg-emerald-100/50 p-2 rounded-lg border border-emerald-200">
                    <p class="text-xs font-bold text-emerald-700">Total Uang Terkumpul: Rp ${totalTerkumpul.toLocaleString("id-ID")}</p>
                    <p class="text-[9px] text-emerald-600 mt-0.5">Berjumlah dari ${paidClients.length} pelanggan yang telah lunas.</p>
                </div>
                <div>
                   <label class="text-[10px] uppercase font-bold text-slate-500">Jumlah Uang Disetor</label>
                   <input type="number" id="k-setor" class="w-full bg-slate-100 border border-slate-200 text-sm font-bold text-slate-700 rounded-lg px-3 py-2 mt-1 focus:outline-none" value="${totalTerkumpul}" readonly>
                </div>
                <div>
                   <label class="text-[10px] uppercase font-bold text-slate-500">Catatan (Opsional)</label>
                   <textarea id="k-catatan" class="w-full bg-white border border-slate-200 text-sm rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-rose-500" placeholder="Misal: Setoran pagi rute pasar" rows="2"></textarea>
                </div>
            </div>
          `,
      confirmButtonText: "Kirim Laporan",
      confirmButtonColor: "#e11d48",
      showCancelButton: true,
      cancelButtonText: "Batal",
      preConfirm: () => {
        const setor = (document.getElementById("k-setor") as HTMLInputElement)
          .value;
        const catatan = (
          document.getElementById("k-catatan") as HTMLTextAreaElement
        ).value;
        if (!setor) {
          Swal.showValidationMessage("Jumlah uang yang disetor wajib diisi");
          return false;
        }
        return { setor, catatan };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const newReport = {
          id: Date.now(),
          kolektorId: user?.id || 0,
          kolektorName: user?.name || "Tidak Diketahui",
          amount: parseInt(result.value.setor),
          note: result.value.catatan || "",
          status: "pending" as const,
          timestamp: Date.now(),
        };
        setDepositReports((prev) => [newReport, ...prev]);
        Swal.fire(
          "Terkirim!",
          `Setoran sebesar Rp ${parseInt(result.value.setor).toLocaleString("id-ID")} telah dilaporkan ke Tim Finance.`,
          "success",
        );
      }
    });
  };

  const handleTindakan = (client: Client) => {
    Swal.fire({
      title: "Status Penagihan",
      text: `Update status tagihan ${client.name}`,
      input: "select",
      inputOptions: {
        bayar: "Telah Dibayar (Lunas)",
        tidak_dirumah: "Orang Tidak di Rumah",
        janji_besok: "Janji Bayar Besok",
        rumah_kosong: "Rumah Kosong / Pindah",
        komplain: "Tidak Mau Bayar (Komplain/Mati)",
      },
      inputPlaceholder: "Pilih Kondisi di Lapangan",
      showCancelButton: true,
      confirmButtonText: "Simpan Status",
      confirmButtonColor: "#e11d48",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        if (result.value === "bayar") {
          setClients((prev) =>
            prev.map((c) =>
              c.id === client.id
                ? { ...c, status: "lunas", netStatus: "aktif" }
                : c,
            ),
          );
          Swal.fire(
            "Berhasil!",
            "Pelanggan ditandai sebagai Lunas.",
            "success",
          );
        } else {
          let infoText = "";
          if (result.value === "tidak_dirumah")
            infoText = "Orang tidak di rumah";
          if (result.value === "janji_besok") infoText = "Janji bayar besok";
          if (result.value === "rumah_kosong") infoText = "Rumah kosong";
          if (result.value === "komplain")
            infoText = "Pelanggan komplain / tidak mau bayar";

          Swal.fire("Dilaporkan", `Status pelanggan: ${infoText}`, "info");
        }
      }
    });
  };

  return (
    <div className="p-4 space-y-4 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500 container">
      <div className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl p-5 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-sm font-bold opacity-90 mb-1">Tugas Kolektor</h2>
          <p className="text-3xl font-black mb-1">
            {unpaidClients.length}{" "}
            <span className="text-sm font-normal">Pelanggan</span>
          </p>
          <div className="flex flex-col gap-1 mt-2">
            <p className="text-[10px] text-rose-100 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Total potensi tagihan: Rp{" "}
              {totalTagihan.toLocaleString("id-ID")}
            </p>
            <p className="text-[10px] text-emerald-300 flex items-center gap-1 font-bold">
              <CheckCircle2 className="w-3 h-3" /> Komisi Terkumpul: Rp{" "}
              {komisi.toLocaleString("id-ID")} ({paidClients.length} Selesai)
            </p>
          </div>
        </div>
        <AlertCircle className="absolute -right-4 -bottom-4 w-32 h-32 text-white opacity-10 pointer-events-none" />

        <button
          onClick={handleLaporFinance}
          className="mt-4 w-full bg-white text-rose-600 hover:bg-rose-50 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition shadow-sm"
        >
          <Send className="w-3 h-3" /> Lapor Setoran Harian
        </button>
      </div>

      <div className="space-y-4">
        {Object.keys(groupedTasks).length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <p className="text-slate-800 font-bold text-sm">Tidak Ada Tugas</p>
            <p className="text-slate-500 text-xs mt-1">
              Semua pelanggan telah lunas / tidak ada data penagihan.
            </p>
          </div>
        ) : (
          Object.keys(groupedTasks)
            .sort()
            .map((area) => (
              <div
                key={area}
                className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden"
              >
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Area: {area}
                  </h3>
                  <span className="ml-auto bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {groupedTasks[area].length}
                  </span>
                </div>
                <div className="divide-y divide-slate-100 shrink-0">
                  {groupedTasks[area].map((client) => (
                    <div
                      key={client.id}
                      className="p-4 flex flex-col gap-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition"
                    >
                      <div className="flex gap-3 items-center">
                        <img
                          src={client.photo}
                          alt={client.name}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-slate-800">
                            {client.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 line-clamp-1">
                            {client.address}
                          </p>
                          <div className="flex gap-2 mt-1">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${client.status === "nunggak" ? "bg-rose-100 text-rose-700" : "bg-orange-100 text-orange-700"}`}
                            >
                              {client.status === "nunggak"
                                ? "Nunggak"
                                : "Menunggu / Belum Lunas"}
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {client.fee}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <a
                            href={`https://wa.me/${client.phone}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition"
                          >
                            <Phone className="w-4 h-4" />
                          </a>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${client.lat},${client.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition"
                          >
                            <Navigation className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                      <button
                        onClick={() => handleTindakan(client)}
                        className="w-full mt-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold py-2 rounded-lg transition border border-slate-200"
                      >
                        Update Kondisi Lapangan
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
