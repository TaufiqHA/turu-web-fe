import { useState, useEffect } from "react";
import { useAppContext } from "../../context";
import {
  Search,
  Check,
  Wallet,
  Receipt,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import { sendWABlast } from "../../utils/waBlast";

export function Billing() {
  const {
    clients,
    setClients,
    billingHistory,
    setBillingHistory,
    role,
    setActiveTab,
    depositReports,
    setDepositReports,
  } = useAppContext();
  const [tab, setTab] = useState<"menunggu" | "lunas" | "setoran">("menunggu");
  const [searchTerm, setSearchTerm] = useState("");

  const getInstallDay = (id: string | number) => {
    return ((parseInt(String(id).replace(/\D/g, "")) || 15) % 28) + 1;
  };

  const filteredClients = clients
    .filter((c) => {
      const matchTab =
        tab === "menunggu" ? c.status !== "lunas" : c.status === "lunas";
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(c.id).includes(searchTerm);
      return matchTab && matchSearch;
    })
    .reverse();

  const today = new Date().getDate();
  const clientsDueToday = clients.filter(
    (c) => c.status !== "lunas" && getInstallDay(c.id) === today,
  );

  // Fitur Auto WA Blast (Hanya berjalan sesekali jika admin/finance yang buka dan belum diblast hari ini)
  useEffect(() => {
    if (role !== "finance" && role !== "superadmin") return;

    const todayDateStr = new Date().toDateString();

    // Cari client yang jatuh tempo hari ini, tapi belum diblast hari ini
    const needsBlast = clientsDueToday.filter((c) => {
      if (!c.lastWaSync) return true;
      return new Date(c.lastWaSync).toDateString() !== todayDateStr;
    });

    if (needsBlast.length > 0) {
      console.log(
        `Menemukan ${needsBlast.length} pelanggan untuk Auto WA Blast hari ini.`,
      );

      const doBlast = async () => {
        let updatedIds: (number | string)[] = [];
        for (const c of needsBlast) {
          const phoneTarget = c.phone || "08000000000";
          const waMsg = `*INFO TAGIHAN INTERNET*\n\nYth. Bpk/Ibu ${c.name},\nTagihan internet Anda dengan paket ${c.package} sebesar *${c.fee}* telah jatuh tempo pada hari ini tanggal ${today}.\n\nHarap segera melakukan pembayaran agar layanan dapat terus digunakan.\nAbaikan pesan ini jika sudah membayar.\n\nTerima kasih,\nAdmin Turu Sore ISP`;
          await sendWABlast(phoneTarget, waMsg);
          updatedIds.push(c.id);
        }

        // Update timestamp semua client yang telah diblast
        if (updatedIds.length > 0) {
          const now = Date.now();
          setClients((prev) =>
            prev.map((cl) =>
              updatedIds.includes(cl.id) ? { ...cl, lastWaSync: now } : cl,
            ),
          );
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: `Auto WA Blast Tagihan berhasil dikirim ke ${updatedIds.length} pelanggan.`,
            showConfirmButton: false,
            timer: 3000,
          });
        }
      };

      doBlast();
    }
  }, [clientsDueToday.length]);

  const handleReceipt = (client: any) => {
    const installDay = getInstallDay(client.id);
    const d = new Date();
    const periodStart = `${installDay.toString().padStart(2, "0")} ${d.toLocaleDateString("id-ID", { month: "short", year: "numeric" })}`;

    // next month
    const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, installDay);
    const periodEnd = `${installDay.toString().padStart(2, "0")} ${nextMonth.toLocaleDateString("id-ID", { month: "short", year: "numeric" })}`;

    const waText = `*STRUK PEMBAYARAN INTERNET*
========================
*NAMA:* ${client.name}
*ID:* ${client.id}
*PAKET:* ${client.package}
*TAGIHAN:* Rp ${client.fee.toLocaleString("id-ID")}
*STATUS:* LUNAS
*TANGGAL BAYAR:* ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
*PERIODE:* ${periodStart} s/d ${periodEnd}
========================
_Terima kasih atas pembayaran Anda._
_Turu Sore ISP_`;

    const encodedText = encodeURIComponent(waText);
    const waLink = `https://wa.me/${client.phone || ""}?text=${encodedText}`;

    // Create a printable receipt
    const printReceipt = () => {
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      printWindow.document.write(`
            <html><head><title>Struk ${client.name}</title>
            <style>
                body { font-family: monospace; padding: 20px; font-size: 14px; line-height: 1.5; color: #000; width: 300px; margin: 0 auto; position: relative; }
                .center { text-align: center; }
                .bold { font-weight: bold; }
                .line { border-top: 1px dashed #000; margin: 10px 0; }
                .watermark { 
                    position: absolute; 
                    top: 50%; left: 50%; 
                    transform: translate(-50%, -50%) rotate(-45deg); 
                    font-size: 80px; 
                    color: rgba(220, 38, 38, 0.15); 
                    font-weight: 900; 
                    letter-spacing: 5px;
                    pointer-events: none; 
                    z-index: -1; 
                }
                @media print { body { width: 100%; margin: 0; padding: 0; } }
            </style>
            </head><body>
            <div class="watermark">LUNAS</div>
            <div class="center bold" style="font-size: 18px; margin-bottom: 5px;">TURU SORE ISP</div>
            <div class="center">Struk Pembayaran Internet</div>
            <div class="line"></div>
            <div>NAMA   : ${client.name}</div>
            <div>ID     : ${client.id}</div>
            <div>PAKET  : ${client.package}</div>
            <div>PERIODE:</div>
            <div>${periodStart} - ${periodEnd}</div>
            <div>STATUS : LUNAS</div>
            <div>TANGGAL: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</div>
            <div class="line"></div>
            <div class="bold" style="font-size: 16px;">TOTAL  : Rp ${client.fee.toLocaleString("id-ID")}</div>
            <div class="line"></div>
            <div class="center" style="font-size: 12px; margin-top: 15px;">Terima Kasih</div>
            </body></html>
        `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };

    Swal.fire({
      title: "Kirim & Cetak Struk",
      html: `Pilih aksi untuk mengirim atau mencetak struk WhatsApp.`,
      icon: "success",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: '<i class="fab fa-whatsapp"></i> Kirim WA',
      denyButtonText: "Cetak Print",
      cancelButtonText: "Tutup",
      confirmButtonColor: "#25D366",
      denyButtonColor: "#64748b",
    }).then((result) => {
      if (result.isConfirmed) {
        window.open(waLink, "_blank");
      } else if (result.isDenied) {
        printReceipt();
      }
    });
  };

  const handleIsolirRequest = (id: string | number) => {
    Swal.fire({
      title: "Minta Isolir?",
      text: `Kirim permintaan isolir ke HD untuk klien ini?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Ya, Minta Isolir",
    }).then((result) => {
      if (result.isConfirmed) {
        setClients((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, isolirRequest: "request_isolir" } : c,
          ),
        );
        Swal.fire(
          "Terkirim!",
          "Permintaan isolir telah diteruskan ke HD.",
          "success",
        );
      }
    });
  };

  const handlePay = (id: string | number) => {
    Swal.fire({
      title: "Proses Pembayaran?",
      text: `Tagihan akan dilunasi.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Ya, Lunasi!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        let paidAmount = "";
        let wasIsolated = false;
        let cName = "";
        let cPhone = "";

        setClients((prev) =>
          prev.map((c) => {
            if (c.id === id) {
              paidAmount = c.fee;
              cName = c.name;
              cPhone = c.phone || "";
              if (
                c.netStatus === "isolir" ||
                c.isolirRequest === "request_isolir"
              ) {
                wasIsolated = true;
                return { ...c, status: "lunas", isolirRequest: "request_buka" };
              }
              return { ...c, status: "lunas", netStatus: "aktif" };
            }
            return c;
          }),
        );

        setBillingHistory((prev) => [
          ...prev,
          {
            clientId: id,
            month: new Date().toLocaleDateString("id-ID", {
              month: "long",
              year: "numeric",
            }),
            amount: paidAmount,
            status: "Lunas",
            date: new Date().toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            method: "Sistem",
          },
        ]);

        if (cPhone) {
          const waMsg = `*TERIMA KASIH*\n\nYth. Bpk/Ibu ${cName},\nPembayaran tagihan internet Anda sebesar *${paidAmount}* telah kami terima.\n\nTerima kasih telah menggunakan layanan Turu Sore ISP.`;
          await sendWABlast(cPhone, waMsg);
        }

        if (wasIsolated) {
          Swal.fire(
            "Berhasil!",
            "Pembayaran dikonfirmasi. Permintaan buka isolir otomatis diteruskan ke HD.",
            "success",
          );
        } else {
          Swal.fire("Berhasil!", "Pembayaran dikonfirmasi.", "success");
        }
      }
    });
  };

  return (
    <div className="p-5 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-0 container">
      <div className="flex justify-between items-center mb-2 shrink-0">
        <h2 className="text-lg font-bold text-slate-800">Daftar Tagihan</h2>
        <span className="bg-yellow-100 text-yellow-700 text-[10px] font-bold px-2 py-1 rounded">
          DEPT: FINANCE
        </span>
      </div>

      <div className="relative shrink-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari nama pelanggan atau ID..."
          className="w-full bg-white border border-slate-200 text-xs rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-fGreen transition shadow-sm"
        />
      </div>

      <button
        onClick={() => setActiveTab("kolektor")}
        className="w-full bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition"
      >
        <AlertCircle className="w-4 h-4" /> Buka Penagihan Lapangan (Kolektor)
      </button>

      <div className="bg-white rounded-xl shadow-sm p-1 flex border border-slate-200 shrink-0">
        <button
          onClick={() => setTab("menunggu")}
          className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition ${tab === "menunggu" ? "bg-fGreen text-white" : "text-slate-500 bg-transparent"}`}
        >
          Belum Lunas
        </button>
        <button
          onClick={() => setTab("lunas")}
          className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition ${tab === "lunas" ? "bg-fGreen text-white" : "text-slate-500 bg-transparent"}`}
        >
          Lunas
        </button>
        <button
          onClick={() => setTab("setoran")}
          className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition ${tab === "setoran" ? "bg-fGreen text-white" : "text-slate-500 bg-transparent"}`}
        >
          Setoran Kolektor
        </button>
      </div>

      {tab === "menunggu" && clientsDueToday.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 shrink-0 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-red-700">
              Perhatian: {clientsDueToday.length} Tagihan Hari Ini
            </h3>
            <p className="text-[10px] text-red-600 mt-0.5">
              Penagihan:{" "}
              {clientsDueToday
                .slice(0, 3)
                .map((c) => c.name)
                .join(", ")}
              {clientsDueToday.length > 3 ? ", dll" : ""}.
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-3 pb-[100px]">
        {tab === "setoran" ? (
          depositReports.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-xl border border-slate-100 text-slate-400 text-sm">
              Tidak ada data setoran hari ini.
            </div>
          ) : (
            depositReports.map((rep) => (
              <div
                key={rep.id}
                className="bg-white rounded-xl shadow-sm border border-slate-100 p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">
                      {rep.kolektorName}
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      {new Date(rep.timestamp).toLocaleString("id-ID")}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${rep.status === "pending" ? "bg-orange-100 text-orange-600" : rep.status === "approved" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}
                  >
                    {rep.status === "pending"
                      ? "Menunggu ACC"
                      : rep.status === "approved"
                        ? "Diterima"
                        : "Ditolak"}
                  </span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg mb-2">
                  <p className="text-[9px] uppercase font-bold text-slate-500">
                    Jumlah Setoran
                  </p>
                  <p className="text-lg font-bold text-slate-800">
                    Rp {rep.amount.toLocaleString("id-ID")}
                  </p>
                  {rep.note && (
                    <p className="text-[10px] text-slate-600 mt-1 italic">
                      "{rep.note}"
                    </p>
                  )}
                </div>

                {rep.status === "pending" && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() =>
                        setDepositReports((prev) =>
                          prev.map((r) =>
                            r.id === rep.id ? { ...r, status: "approved" } : r,
                          ),
                        )
                      }
                      className="flex-1 bg-fGreen hover:bg-emerald-600 text-white text-xs font-bold py-1.5 rounded-lg transition"
                    >
                      Terima
                    </button>
                    <button
                      onClick={() =>
                        setDepositReports((prev) =>
                          prev.map((r) =>
                            r.id === rep.id ? { ...r, status: "rejected" } : r,
                          ),
                        )
                      }
                      className="flex-1 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold py-1.5 rounded-lg border border-rose-200 transition"
                    >
                      Tolak
                    </button>
                  </div>
                )}
              </div>
            ))
          )
        ) : filteredClients.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-xl border border-slate-100 text-slate-400 text-sm">
            Tidak ada data tagihan.
          </div>
        ) : tab === "lunas" ? (
          filteredClients.map((c) => {
            const isWait = c.status === "menunggu_acc";
            const isLunas = c.status === "lunas";

            return (
              <div
                key={c.id}
                className="bg-white rounded-xl shadow-sm border border-slate-100 p-4"
              >
                <div className="flex justify-between mb-3 items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">
                      {c.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono">
                      ID: {c.id}
                    </p>
                  </div>
                  {isLunas ? (
                    <span className="bg-green-100 text-green-700 px-2 py-1 flex items-center gap-1 rounded text-[9px] font-bold uppercase h-fit">
                      <Check className="w-3 h-3" /> Lunas
                    </span>
                  ) : isWait ? (
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-[9px] font-bold uppercase h-fit">
                      Cek Transfer
                    </span>
                  ) : (
                    <span className="bg-fRedLight text-fRed px-2 py-1 rounded text-[9px] font-bold uppercase h-fit">
                      Isolir
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-end bg-slate-50 p-2 rounded-lg">
                  <div>
                    <p className="text-[9px] text-slate-400 font-semibold uppercase">
                      Nominal / Paket
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                      {c.fee}{" "}
                      <span className="text-[10px] text-slate-500 font-normal">
                        ({c.package})
                      </span>
                    </p>
                  </div>
                  {isLunas ? (
                    <button
                      onClick={() => handleReceipt(c)}
                      className="bg-fDark hover:bg-slate-800 text-white text-[10px] font-bold px-4 py-1.5 flex items-center gap-1 rounded-md shadow-sm transition"
                    >
                      <Receipt className="w-3 h-3" /> Struk WA
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePay(c.id)}
                      className={`${isWait ? "bg-fGreen hover:bg-emerald-700 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-600"} text-[10px] flex items-center gap-1 font-bold px-4 py-1.5 rounded-md shadow-sm transition`}
                    >
                      <Wallet className="w-3 h-3" /> Proses Bayar
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          (() => {
            const grouped = filteredClients.reduce(
              (acc, c) => {
                const day = getInstallDay(c.id);
                if (!acc[day]) acc[day] = [];
                acc[day].push(c);
                return acc;
              },
              {} as Record<number, typeof filteredClients>,
            );

            const sortedDays = Object.keys(grouped)
              .map(Number)
              .sort((a, b) => a - b);

            return sortedDays.map((day) => (
              <div key={day} className="mb-4">
                <h3 className="text-xs font-bold text-slate-500 mb-2 border-b border-slate-200 pb-1 flex items-center justify-between">
                  Tagihan Tanggal {day}
                  {day === today && (
                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[9px] uppercase animate-pulse">
                      Hari Ini!
                    </span>
                  )}
                </h3>
                <div className="space-y-3">
                  {grouped[day].map((c) => {
                    const isWait = c.status === "menunggu_acc";
                    return (
                      <div
                        key={c.id}
                        className="bg-white rounded-xl shadow-sm border border-slate-100 p-4"
                      >
                        <div className="flex justify-between mb-3 items-start">
                          <div>
                            <h3 className="font-bold text-slate-800 text-sm">
                              {c.name}
                            </h3>
                            <p className="text-[10px] text-slate-500 font-mono">
                              ID: {c.id}
                            </p>
                          </div>
                          {isWait ? (
                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-[9px] font-bold uppercase h-fit">
                              Cek Transfer
                            </span>
                          ) : c.isolirRequest === "request_isolir" ? (
                            <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-[9px] font-bold uppercase h-fit">
                              Menunggu Isolir (HD)
                            </span>
                          ) : c.netStatus === "isolir" ? (
                            <span className="bg-fRedLight text-fRed px-2 py-1 rounded text-[9px] font-bold uppercase h-fit">
                              Isolir
                            </span>
                          ) : (
                            <span className="bg-fRedLight text-fRed px-2 py-1 rounded text-[9px] font-bold uppercase h-fit">
                              Nunggak
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-end bg-slate-50 p-2 rounded-lg mt-2">
                          <div>
                            <p className="text-[9px] text-slate-400 font-semibold uppercase">
                              Nominal / Paket
                            </p>
                            <p className="text-sm font-bold text-slate-800">
                              {c.fee}{" "}
                              <span className="text-[10px] text-slate-500 font-normal">
                                ({c.package})
                              </span>
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {!isWait &&
                              c.netStatus !== "isolir" &&
                              c.isolirRequest !== "request_isolir" && (
                                <button
                                  onClick={() => handleIsolirRequest(c.id)}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold px-3 py-1.5 rounded-md shadow-sm transition"
                                >
                                  Minta Isolir
                                </button>
                              )}
                            <button
                              onClick={() => handlePay(c.id)}
                              className={`${isWait ? "bg-fGreen hover:bg-emerald-700 text-white" : "bg-slate-200 hover:bg-slate-300 text-slate-600"} text-[10px] flex items-center gap-1 font-bold px-4 py-1.5 rounded-md shadow-sm transition`}
                            >
                              <Wallet className="w-3 h-3" /> Proses Bayar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ));
          })()
        )}
      </div>
    </div>
  );
}
