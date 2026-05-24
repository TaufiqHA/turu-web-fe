import { useAppContext } from '../../context';
import { Plus, CheckCheck, Clock, CheckCircle2, Play, PauseCircle, AlertTriangle, Timer } from 'lucide-react';
import Swal from 'sweetalert2';
import { sendWABlast } from '../../utils/waBlast';

export function Complaints() {
  const { complaints, setComplaints, role, user, clients, setTechnicianHistory } = useAppContext();

  let filtered = complaints;
  if (role === 'pelanggan') {
      filtered = complaints.filter(c => c.clientId === user?.id);
  }

  const ajukan = () => {
    Swal.fire({
        title: 'Ajukan Komplain',
        input: 'textarea',
        inputLabel: 'Jelaskan kendala jaringan Anda',
        inputPlaceholder: 'Misal: Internet mati total sejak jam 10 pagi...',
        showCancelButton: true,
        confirmButtonColor: '#059669',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Kirim Laporan'
    }).then(async (result) => {
        if (result.isConfirmed && result.value) {
            setComplaints(prev => [{
                id: Date.now(),
                clientId: user?.id || Date.now(),
                name: user?.name || 'Pelanggan',
                issue: result.value,
                status: "open",
                date: "Barusan"
            }, ...prev]);
            
            Swal.fire({
              title: 'Memproses...',
              text: 'Mengirim notifikasi ke Group WA Teknisi...',
              allowOutsideClick: false,
              didOpen: () => {
                Swal.showLoading();
              }
            });

            const waMsg = `*GANGGUAN BARU*\nPelanggan: ${user?.name}\nKendala: ${result.value}\nHarap segera dicek.`;
            await sendWABlast("Group_Teknisi", waMsg);

            Swal.fire('Terkirim!', 'Komplain Anda sudah masuk ke sistem dan masuk ke WA Group Teknisi.', 'success');
        }
    });
  };

  const startProgress = (id: number) => {
    Swal.fire({
      title: 'Mulai Kerjakan?',
      text: "Waktu SLA teknisi akan mulai dihitung dari sekarang.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Mulai Progress'
    }).then((result) => {
        if (result.isConfirmed) {
            setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'progress', progressStartTime: Date.now(), technicianId: user?.id, technicianName: user?.name } : c));
            Swal.fire('Berhasil!', 'Progress dimulai, SLA berjalan.', 'success');
        }
    });
  };

  const markPending = (id: number) => {
    Swal.fire({
        title: 'Tunda Pengerjaan',
        input: 'textarea',
        inputLabel: 'Alasan pending (Misal: Hujan Deras, Pelanggan Tidak di Tempat)',
        showCancelButton: true,
        confirmButtonColor: '#f59e0b',
        cancelButtonColor: '#94a3b8',
        confirmButtonText: 'Set Pending'
    }).then((result) => {
        if (result.isConfirmed && result.value) {
            setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'pending', pendingReason: result.value, technicianId: user?.id, technicianName: user?.name } : c));
            Swal.fire('Ditunda!', 'Status komplain diubah ke pending.', 'success');
        }
    });
  }

  const selesaikan = (id: number) => {
    Swal.fire({
      title: 'Tandai Selesai?',
      text: "Pastikan kendala klien benar-benar sudah ditangani.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Ya, Sudah Selesai'
    }).then((result) => {
        if (result.isConfirmed) {
            setComplaints(prev => {
                const complaint = prev.find(c => c.id === id);
                if (complaint && user) {
                   const client = clients.find(cl => cl.id === complaint.clientId);
                   if (client) {
                       setTechnicianHistory(h => [{
                           id: Date.now(),
                           technicianId: user.id,
                           technicianName: user.name || 'Teknisi',
                           action: 'Penyelesaian Komplain',
                           locationName: client.name,
                           lat: client.lat,
                           lng: client.lng,
                           timestamp: Date.now()
                       }, ...h]);
                   }
                }
                return prev.map(c => c.id === id ? { ...c, status: 'resolved', progressEndTime: Date.now(), technicianId: user?.id, technicianName: user?.name } : c);
            });
            Swal.fire('Berhasil!', 'Komplain telah ditutup dan SLA tercatat.', 'success');
        }
    });
  }

  return (
    <div className="p-5 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 container">
      <div className="flex justify-between items-center mb-2 shrink-0">
          <div>
              <h2 className="text-lg font-bold text-slate-800">Layanan Komplain</h2>
              <p className="text-[10px] text-slate-500">{role === 'pelanggan' ? 'Riwayat pelaporan kendala Anda' : 'Daftar laporan gangguan jaringan klien'}</p>
          </div>
          {role === 'pelanggan' && (
            <button onClick={ajukan} className="bg-fGreen hover:bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg shadow-sm transition">
                <Plus className="w-3 h-3" /> Buat Laporan
            </button>
          )}
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-3 pb-[100px]">
        {filtered.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-xl border border-slate-100 text-slate-400 text-sm">Tidak ada data komplain.</div>
        ) : (
          filtered.slice().reverse().map(c => {
            const isOpen = c.status === 'open';
            const isProgress = c.status === 'progress';
            const isPending = c.status === 'pending';
            const isResolved = c.status === 'resolved';

            let slaText = '';
            let slaGrade = '';
            if (isResolved && c.progressStartTime && c.progressEndTime) {
               const diffMins = Math.round((c.progressEndTime - c.progressStartTime) / 60000);
               slaText = `${diffMins} Menit`;
               if (diffMins <= 60) slaGrade = 'SLA A (Sangat Baik)';
               else if (diffMins <= 180) slaGrade = 'SLA B (Baik)';
               else slaGrade = 'SLA C (Lambat)';
            }

            return (
              <div key={c.id} className={`bg-white rounded-xl shadow-sm border p-4 ${isPending ? 'border-yellow-300' : 'border-slate-100'}`}>
                  <div className="flex justify-between items-start mb-2">
                      <div>
                          <h3 className="font-bold text-slate-800 text-sm">{role === 'pelanggan' ? 'Kendala Anda' : c.name}</h3>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {c.clientId}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {isOpen && <span className="bg-red-100 text-red-600 flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold uppercase h-fit"><Clock className="w-3 h-3" /> Menunggu</span>}
                        {isProgress && <span className="bg-blue-100 text-blue-700 flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold uppercase h-fit animate-pulse"><Play className="w-3 h-3" /> Diproses ({c.technicianName})</span>}
                        {isPending && <span className="bg-yellow-100 text-yellow-700 flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold uppercase h-fit"><AlertTriangle className="w-3 h-3" /> Pending</span>}
                        {isResolved && <span className="bg-green-100 text-green-700 flex items-center gap-1 px-2 py-1 rounded text-[9px] font-bold uppercase h-fit"><CheckCheck className="w-3 h-3" /> Selesai</span>}
                      </div>
                  </div>
                  
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-3">"{c.issue}"</p>
                  
                  {isPending && c.pendingReason && (
                      <p className="text-[10px] text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-200 mb-3"><span className="font-bold">Alasan Pending:</span> {c.pendingReason}</p>
                  )}

                  {isResolved && slaText && (
                      <div className="flex items-center gap-2 mb-3 bg-slate-50 p-2 rounded border border-slate-100">
                          <Timer className="w-4 h-4 text-slate-400" />
                          <span className="text-[10px] text-slate-600">Durasi: <span className="font-bold text-slate-800">{slaText}</span></span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${slaGrade.includes('A') ? 'bg-emerald-100 text-emerald-700' : slaGrade.includes('B') ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{slaGrade}</span>
                          <span className="text-[9px] text-slate-400 ml-auto">Teknisi: {c.technicianName}</span>
                      </div>
                  )}

                  <div className="flex flex-wrap justify-between items-center gap-2">
                      <span className="text-[9px] text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3"/> {c.date}</span>
                      <div className="flex gap-2">
                          {((isOpen || isPending) && (role === 'teknisi' || role === 'superadmin')) && (
                            <button onClick={() => startProgress(c.id)} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1 text-white text-[10px] font-bold px-3 py-1.5 rounded-md shadow-sm transition"><Play className="w-3 h-3"/> Mulai Progress</button>
                          )}
                          {(isProgress && (role === 'teknisi' || role === 'superadmin')) && (
                            <>
                                <button onClick={() => markPending(c.id)} className="bg-yellow-500 hover:bg-yellow-600 flex items-center gap-1 text-white text-[10px] font-bold px-3 py-1.5 rounded-md shadow-sm transition"><PauseCircle className="w-3 h-3"/> Pending</button>
                                <button onClick={() => selesaikan(c.id)} className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-1 text-white text-[10px] font-bold px-3 py-1.5 rounded-md shadow-sm transition"><CheckCircle2 className="w-3 h-3"/> Selesai</button>
                            </>
                          )}
                      </div>
                  </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
