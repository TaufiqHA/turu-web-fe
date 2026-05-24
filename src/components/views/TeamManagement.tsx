import { useAppContext } from '../../context';
import { UserPlus, User, UserCheck, Wrench, Calculator, Headphones, Boxes, Trash2, MapPin, ClipboardList } from 'lucide-react';
import Swal from 'sweetalert2';

export function TeamManagement({ filterRole }: { filterRole?: string }) {
  const { teamMembers, setTeamMembers, role, technicianHistory, clients, setClients } = useAppContext();


  const handleLihatHistory = (tId: number | string, tName: string) => {
      const history = technicianHistory.filter(h => h.technicianId === tId);
      if (history.length === 0) {
          Swal.fire('Info', 'Belum ada data riwayat perjalanan untuk teknisi ini.', 'info');
          return;
      }
      const historyHtml = history.map(h => `
          <div class="border-b border-slate-100 py-2 flex flex-col gap-1 items-start">
             <div class="flex justify-between w-full">
                 <span class="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 rounded">${h.action}</span>
                 <span class="text-[9px] text-slate-400">${new Date(h.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
             </div>
             <div class="text-xs text-left w-full"><span class="font-bold">${h.locationName}</span></div>
             <a href="https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lng}" target="_blank" class="text-[9px] text-emerald-600 underline text-left w-full">Lihat di Maps</a>
          </div>
      `).join('');

      Swal.fire({
          title: `Riwayat Lokasi ${tName}`,
          html: `<div class="max-h-[300px] overflow-y-auto">${historyHtml}</div>`,
          confirmButtonColor: '#fDark'
      });
  };

  const handleBagiWilayah = (kId: number | string, kName: string) => {
      const unpaidClients = clients.filter(c => c.status !== 'lunas');
      if (unpaidClients.length === 0) {
          Swal.fire('Info', 'Tidak ada tagihan yang belum lunas (menunggak) saat ini.', 'info');
          return;
      }

      const clientHtml = unpaidClients.map(c => `
          <div class="flex items-center gap-2 mb-2 p-2 bg-slate-50 border border-slate-100 rounded-lg">
             <input type="checkbox" id="kolektor-client-${c.id}" value="${c.id}" ${c.kolektorId === kId ? 'checked' : ''} class="w-4 h-4 text-rose-600 rounded">
             <label for="kolektor-client-${c.id}" class="text-xs text-slate-700 flex-1 flex flex-col items-start leading-tight">
                 <span class="font-bold">${c.name}</span>
                 <span class="text-[9px] text-slate-500">${c.address} (${c.fee})</span>
             </label>
             <span class="text-[9px] ${c.kolektorId && c.kolektorId !== kId ? 'text-red-500 font-bold' : 'text-slate-400'}">
                 ${c.kolektorId && c.kolektorId !== kId ? '(Diserahkan ke Kolektor Lain)' : c.kolektorId === kId ? '(Tugas Saat Ini)' : ''}
             </span>
          </div>
      `).join('');

      Swal.fire({
          title: `Bagi Tugas Tagih`,
          text: `Pilih klien yang akan ditugaskan kepada ${kName}`,
          html: `<div class="max-h-[60vh] overflow-y-auto mt-3 border-t border-b border-slate-100 py-3">${clientHtml}</div>`,
          confirmButtonColor: '#059669',
          confirmButtonText: 'Simpan Penugasan',
          showCancelButton: true,
          cancelButtonText: 'Batal',
          preConfirm: () => {
              const selectedIds: (number | string)[] = [];
              unpaidClients.forEach(c => {
                 const checkbox = document.getElementById(`kolektor-client-${c.id}`) as HTMLInputElement;
                 if (checkbox && checkbox.checked) {
                     selectedIds.push(c.id);
                 }
              });
              return selectedIds;
          }
      }).then(result => {
          if (result.isConfirmed) {
              const assignedIds = result.value || [];
              setClients(prev => prev.map(c => {
                  if (assignedIds.includes(c.id)) {
                      return { ...c, kolektorId: kId };
                  }
                  // Jika sebelumnya ditugaskan ke kolektor ini tapi sekarang tidak di centang, maka copot penugasannya
                  if (c.kolektorId === kId && !assignedIds.includes(c.id)) {
                      return { ...c, kolektorId: undefined };
                  }
                  return c;
              }));
              Swal.fire('Disimpan!', `Tugas penagihan untuk ${kName} telah diperbarui.`, 'success');
          }
      });
  };

  const handleDelete = (id: number | string) => {
    if (id === 1) {
      Swal.fire('Gagal', 'Akses akun Superadmin Utama tidak boleh dihapus!', 'error');
      return;
    }
    Swal.fire({
      title: 'Hapus Akses?',
      text: "Karyawan tidak akan bisa login ke dalam sistem lagi.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Hapus'
    }).then((res) => {
      if(res.isConfirmed) {
        setTeamMembers(prev => prev.filter(t => t.id !== id));
        Swal.fire('Dihapus', 'Akses login berhasil dicabut.', 'success');
      }
    });
  };

  const handleTambah = () => {
    Swal.fire({
      title: 'Tambah Akses Tim',
      html: `
        <div class="space-y-3 mt-2 text-left">
          <div>
            <label class="text-[10px] font-bold text-slate-500 uppercase">Nama Lengkap</label>
            <input id="swal-name" class="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-fGreen" placeholder="Misal: Joko Susilo">
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-500 uppercase">Username (Login)</label>
            <input id="swal-username" class="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-fGreen" placeholder="Bebas spasi, misal: joko123">
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-500 uppercase">Kata Sandi</label>
            <input type="password" id="swal-pass" class="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-fGreen" placeholder="Minimal 6 karakter">
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-500 uppercase">No Whatsapp</label>
            <input id="swal-phone" class="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-fGreen" placeholder="Misal: 628...">
          </div>
          <div>
            <label class="text-[10px] font-bold text-slate-500 uppercase">Pilih Akses (Role)</label>
            <select id="swal-role" class="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 mt-1 focus:outline-none focus:border-fGreen">
              <option value="helpdesk">Helpdesk (Input Data & Komplain)</option>
              <option value="teknisi">Teknisi (Akses Peta, Gudang)</option>
              <option value="kolektor">Kolektor (Akses Penagihan)</option>
              <option value="finance">Finance (Akses Tagihan)</option>
              <option value="gudang">Admin Gudang (Akses Inventori)</option>
              <option value="superadmin">Superadmin (Akses Penuh)</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#94a3b8',
      preConfirm: () => {
        const name = (document.getElementById('swal-name') as HTMLInputElement).value;
        const user = (document.getElementById('swal-username') as HTMLInputElement).value;
        const pass = (document.getElementById('swal-pass') as HTMLInputElement).value;
        const phone = (document.getElementById('swal-phone') as HTMLInputElement).value;
        const role = (document.getElementById('swal-role') as HTMLSelectElement).value;
        
        if (!name || !user || !pass) {
          Swal.showValidationMessage('Semua kolom harus diisi!');
          return false;
        }
        return { name, username: user.toLowerCase().replace(/\s/g, ''), password: pass, phone, role };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setTeamMembers(prev => [...prev, {
          id: Date.now(),
          name: result.value.name,
          username: result.value.username,
          password: result.value.password,
          phone: result.value.phone,
          role: result.value.role as any,
          status: 'aktif'
        }]);
        Swal.fire('Berhasil!', `Akses login untuk ${result.value.name} telah dibuat.`, 'success');
      }
    });
  }

  const getIcon = (roleName: string) => {
    switch(roleName) {
      case 'superadmin': return <UserCheck className="w-5 h-5"/>;
      case 'teknisi': return <Wrench className="w-5 h-5"/>;
      case 'finance': return <Calculator className="w-5 h-5"/>;
      case 'helpdesk': return <Headphones className="w-5 h-5"/>;
      case 'gudang': return <Boxes className="w-5 h-5"/>;
      default: return <User className="w-5 h-5"/>;
    }
  }

  return (
    <div className="p-5 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 container">
      <div className="flex justify-between items-center mb-6 shrink-0">
          <div>
              <h2 className="text-lg font-bold text-slate-800">{filterRole === 'kolektor' ? 'Tim Kolektor' : 'Manajemen Tim'}</h2>
              <p className="text-[10px] text-slate-500">{filterRole === 'kolektor' ? 'Daftar kolektor lapangan' : 'Akses login staf Turu Sore'}</p>
          </div>
          {!filterRole && (
              <button onClick={handleTambah} className="bg-fDark hover:bg-slate-800 text-white text-[10px] font-bold flex items-center gap-1 px-3 py-2 rounded-lg shadow-sm transition">
                  <UserPlus className="w-3 h-3" /> Akses Baru
              </button>
          )}
      </div>
      
      <div className="flex-1 overflow-y-auto hide-scrollbar space-y-3 pb-[100px]">
        {teamMembers.filter(t => !filterRole || t.role === filterRole).map(t => {
          let bgColor = 'bg-slate-100 text-slate-600';
          if(t.role === 'superadmin') bgColor = 'bg-slate-200 text-fDark';
          else if(t.role === 'finance') bgColor = 'bg-green-100 text-green-600';
          else if(t.role === 'teknisi') bgColor = 'bg-blue-100 text-blue-600';
          else if(t.role === 'gudang') bgColor = 'bg-orange-100 text-orange-600';
          else if(t.role === 'helpdesk') bgColor = 'bg-purple-100 text-purple-600';
          else if(t.role === 'kolektor') bgColor = 'bg-pink-100 text-pink-600';

          return (
            <div key={t.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 flex items-center gap-3">
                <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center`}>
                    {getIcon(t.role || '')}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 text-sm leading-none mb-1">{t.name}</h3>
                        <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-[8px] font-bold">AKTIF</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Username: <b className="text-slate-700">{t.username}</b> | Pass: <span className="text-slate-400">****</span></p>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t.role}</span>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => handleDelete(t.id)} className="w-8 h-8 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg shadow-sm transition flex items-center justify-center shrink-0">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    {(role === 'superadmin' && t.role === 'teknisi') && (
                        <button onClick={() => handleLihatHistory(t.id, t.name)} className="w-8 h-8 bg-blue-50 text-blue-500 hover:bg-blue-100 rounded-lg shadow-sm transition flex items-center justify-center shrink-0" title="Riwayat Lokasi">
                           <MapPin className="w-4 h-4" />
                        </button>
                    )}
                    {((role === 'superadmin' || role === 'finance') && t.role === 'kolektor') && (
                        <button onClick={() => handleBagiWilayah(t.id, t.name)} className="w-8 h-8 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-lg shadow-sm transition flex items-center justify-center shrink-0" title="Bagi Tugas/Wilayah">
                           <ClipboardList className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
