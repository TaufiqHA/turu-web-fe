import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context';
import { Clock, Key, AlertTriangle, Wallet, TrendingUp, Users, ArrowUpRight, ArrowDownRight, Play, Gauge, Bot, CircleUser, QrCode, Camera, MapPin } from 'lucide-react';
import Swal from 'sweetalert2';
import { Client } from '../../types';
import { createSpreadsheet, syncToSheets, fetchFromSheets } from '../../sheetsService';

export function Dashboard() {
  const { user, role, clients, setClients, complaints, setComplaints, billingHistory, setBillingHistory, inventory, setInventory, activeTab, setActiveTab, googleUser, connectGoogle, disconnectGoogle, inventoryHistory } = useAppContext();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const clientData = user as Client; 
  
  const isPelanggan = role === 'pelanggan';
  const isSuperadmin = role === 'superadmin';
  const isFinance = role === 'finance';
  const isTeknisi = role === 'teknisi';
  const isGudang = role === 'gudang';
  const isHelpdesk = role === 'helpdesk';
  const isKolektor = role === 'kolektor';

  const paidClientsCount = clients.filter(c => c.status === 'lunas').length;
  const unpaidClientsCount = clients.filter(c => c.status !== 'lunas').length;

  const runSpeedtest = (clientName = '') => {
    Swal.fire({
      title: 'Fitur Belum Tersedia',
      text: 'Fitur uji kecepatan sedang dalam pemeliharaan server.',
      icon: 'info'
    });
  }

  const handleCreateSpreadsheet = async () => {
    try {
      const id = await createSpreadsheet();
      Swal.fire('Success', `Spreadsheet Created. ID: ${id}`, 'success');
    } catch (e: any) {
      Swal.fire('Error', e.message, 'error');
    }
  };

  const handleSyncToSheets = async () => {
    try {
      await syncToSheets(clients, complaints, billingHistory, inventory);
      Swal.fire('Success', 'Data synced to Google Sheets successfully!', 'success');
    } catch (e: any) {
      Swal.fire('Error', e.message, 'error');
    }
  };

  const handleFetchFromSheets = async () => {
    try {
      const ranges = await fetchFromSheets();
      
      const clientsData = ranges.find((r: any) => r.range.startsWith('Clients'))?.values || [];
      const complaintsData = ranges.find((r: any) => r.range.startsWith('Complaints'))?.values || [];
      const billingData = ranges.find((r: any) => r.range.startsWith('BillingHistory'))?.values || [];
      const inventoryData = ranges.find((r: any) => r.range.startsWith('Inventory'))?.values || [];

      if (clientsData.length > 1) {
        const newClients = clientsData.slice(1).map((row: any) => ({
          id: row[0],
          name: row[1],
          phone: row[2],
          package: row[3],
          fee: row[4],
          status: row[5],
          netStatus: row[6],
          address: row[7],
          lat: parseFloat(row[8]),
          lng: parseFloat(row[9]),
          photo: 'https://placehold.co/400x300/e2e8f0/475569?text=Image',
          password: '123456',
          role: 'pelanggan'
        }));
        setClients(newClients);
      }

      if (complaintsData.length > 1) {
        const newComplaints = complaintsData.slice(1).map((row: any) => ({
          id: parseInt(row[0]),
          clientId: row[1],
          name: row[2],
          issue: row[3],
          status: row[4],
          date: row[5]
        }));
        setComplaints(newComplaints);
      }

      if (billingData.length > 1) {
        const newBilling = billingData.slice(1).map((row: any) => ({
          clientId: row[0],
          month: row[1],
          amount: row[2],
          status: row[3],
          date: row[4],
          method: row[5]
        }));
        setBillingHistory(newBilling);
      }

      if (inventoryData.length > 1) {
        const newInventory: any = {};
        inventoryData.slice(1).forEach((row: any) => {
          newInventory[row[0]] = {
            id: row[0],
            name: row[1],
            stock: parseInt(row[2]),
            inToday: parseInt(row[3]),
            outToday: parseInt(row[4]),
            icon: 'box',
            color: 'slate'
          };
        });
        setInventory(newInventory);
      }

      Swal.fire('Success', 'Data loaded from Google Sheets!', 'success');
    } catch (e: any) {
      Swal.fire('Error', e.message, 'error');
    }
  };

  return (
    <div className="p-5 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 container max-w-lg mx-auto">
      
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div>
           <h1 className="text-xl font-black text-slate-800">Dashboard</h1>
           <p className="text-[10px] text-slate-500 font-medium">Selamat datang, {user?.name}</p>
        </div>
        <div className="text-right flex flex-col items-end">
           <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <p className="text-sm font-bold text-slate-800 font-mono tracking-tight">{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
           </div>
           <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">{currentTime.toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
        </div>
      </div>

      {isPelanggan && (
        <div className="bg-gradient-to-br from-fDark via-slate-800 to-slate-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden ring-1 ring-white/10">
          <div className="absolute -right-8 -top-8 opacity-10 blur-md"><CircleUser className="w-48 h-48" /></div>
          
          <div className="relative z-10 flex items-center justify-between mb-5 border-b border-white/10 pb-5">
              <div>
                  <h2 className="text-2xl font-bold mb-1 tracking-tight">Halo, {clientData?.name}</h2>
                  <p className="text-[11px] text-slate-300 font-mono tracking-wider">ID: {clientData?.id} &bull; {clientData?.package}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-tr from-blue-500 to-emerald-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 p-0.5">
                  <div className="w-full h-full bg-fDark rounded-full flex items-center justify-center">
                     <span className="text-lg font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-tr from-blue-400 to-emerald-300">{clientData?.name?.charAt(0).toUpperCase()}</span>
                  </div>
              </div>
          </div>
          
          <div className="relative z-10 bg-black/20 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-inner mb-5">
            <p className="text-[10px] text-emerald-400 font-bold tracking-widest mb-3 uppercase">Status Koneksi Internet</p>
            <div className="flex items-center gap-3 mb-5">
              {clientData?.netStatus === 'aktif' ? (
                <><div className="w-4 h-4 bg-emerald-400 rounded-full pulsing-dot shadow-[0_0_15px_rgba(52,211,153,0.6)]"></div><span className="text-3xl font-black text-white tracking-tight">Online</span></>
              ) : clientData?.netStatus === 'isolir' ? (
                <><div className="w-4 h-4 bg-rose-500 rounded-full pulsing-dot shadow-[0_0_15px_rgba(244,63,94,0.6)]"></div><span className="text-3xl font-black text-rose-100 tracking-tight">TERISOLIR</span></>
              ) : (
                <><div className="w-4 h-4 bg-slate-400 rounded-full"></div><span className="text-3xl font-black text-slate-200 tracking-tight">Offline</span></>
              )}
            </div>
            <div className="bg-white/5 rounded-xl p-4 flex justify-between items-center border border-white/5">
              <div>
                <p className="text-[10px] text-slate-300 mb-1 uppercase tracking-wide">Tagihan Bulan Ini</p>
                <p className="text-2xl font-bold text-white tracking-tight">Rp {clientData?.fee}</p>
              </div>
              <span className={`text-xs font-bold px-4 py-2 rounded-xl shadow-sm border ${clientData?.status === 'lunas' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : clientData?.status === 'menunggu_acc' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'}`}>
                {clientData?.status === 'lunas' ? 'LUNAS' : clientData?.status === 'menunggu_acc' ? 'MENUNGGU ACC' : 'MENUNGGAK'}
              </span>
            </div>
          </div>
          
          <div className="relative z-10 grid grid-cols-3 gap-3">
            <button className="bg-white/5 hover:bg-white/10 backdrop-blur text-white text-[11px] py-3.5 rounded-xl transition border border-white/10 flex flex-col items-center justify-center gap-2 font-medium shadow-sm">
              <Clock className="w-5 h-5 text-blue-300" /> Riwayat
            </button>
            <a href="http://192.168.1.1" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] text-white text-[11px] py-3.5 rounded-xl transition border border-blue-400/50 flex flex-col items-center justify-center gap-2 font-medium">
              <Key className="w-5 h-5 text-blue-100" /> Setting WiFi
            </a>
            <button onClick={() => setActiveTab('komplain')} className="bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] text-white text-[11px] py-3.5 rounded-xl transition border border-rose-400/50 flex flex-col items-center justify-center gap-2 font-medium">
              <AlertTriangle className="w-5 h-5 text-rose-100" /> Lapor Gangguan
            </button>
          </div>
        </div>
      )}

      {(isSuperadmin || isFinance) && (
        <div className="bg-gradient-to-br from-fDark to-slate-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-10"><Users className="w-32 h-32" /></div>
          
          {isSuperadmin && (
            <div className="mb-5 pb-5 border-b border-white/10">
              <p className="text-xs text-slate-300 mb-1">Total Pendapatan Bulan Ini</p>
              <h2 className="text-3xl font-bold mb-3">Rp 12.450<span className="text-lg text-slate-400">.000</span></h2>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> +15% dari bulan lalu</p>
            </div>
          )}

          <h2 className="text-sm font-bold text-slate-200 mb-4 tracking-wide uppercase">Status Tagihan Bulan Ini</h2>
          <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-white/5">
                  <p className="text-[10px] text-slate-300 font-semibold mb-1">Sudah Membayar</p>
                  <p className="text-3xl font-black text-emerald-400">{paidClientsCount} <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Klien</span></p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-3 border border-red-500/20">
                  <p className="text-[10px] text-slate-300 font-semibold mb-1">Belum Membayar</p>
                  <p className="text-3xl font-black text-rose-400">{unpaidClientsCount} <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Klien</span></p>
              </div>
          </div>
          <div className="flex justify-between items-end mt-4">
              <div>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Pantau tagihan secara real-time</p>
              </div>
              <button onClick={() => setActiveTab('finance')} className="bg-white/20 hover:bg-white/30 backdrop-blur text-white text-xs px-3 py-1.5 rounded-lg transition font-bold">Menu Keuangan</button>
          </div>
        </div>
      )}

      {isSuperadmin && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-4">
          <h3 className="text-sm font-bold text-slate-700 md-4 flex justify-between items-center mb-4">
            <span>Google Sheets Sync</span>
            {googleUser && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold">Connected</span>}
          </h3>
          
          {!googleUser ? (
            <button 
              onClick={connectGoogle} 
              className="w-full border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2 rounded-lg transition shadow-sm mb-3"
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
                Sign in with Google
              </div>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-3">
               <button 
                  onClick={handleCreateSpreadsheet} 
                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 text-[10px] font-bold py-2 rounded-lg transition"
               >
                  1. Setup Spreadsheet
               </button>
               <button 
                  onClick={handleSyncToSheets} 
                  className="bg-fGreenLight text-fGreen hover:bg-emerald-200 text-[10px] font-bold py-2 rounded-lg transition flex items-center justify-center gap-1"
               >
                 <ArrowUpRight className="w-3 h-3" /> 2. Push to Sheets
               </button>
               <button 
                  onClick={handleFetchFromSheets} 
                  className="bg-orange-50 text-orange-600 hover:bg-orange-100 text-[10px] font-bold py-2 rounded-lg transition col-span-2 flex items-center justify-center gap-1"
               >
                  <ArrowDownRight className="w-3 h-3" /> 3. Load from Sheets
               </button>
               <button onClick={disconnectGoogle} className="text-slate-400 text-[9px] underline text-center col-span-2 mt-1">Disconnect Google</button>
            </div>
          )}
          <p className="text-[9px] text-slate-500 text-center mt-2 border-t border-slate-50 pt-2">Sync current network data directly to Google Sheets in real-time.</p>
        </div>
      )}

      {(isSuperadmin || isHelpdesk) && clients.some(c => c.isolirRequest) && (
        <div className="bg-rose-50 rounded-xl shadow-sm border border-rose-100 p-4 mb-4">
          <h3 className="text-sm font-bold text-rose-700 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Permintaan HD (Isolir & Buka)
          </h3>
          <div className="space-y-2">
            {clients.filter(c => c.isolirRequest).map(c => (
              <div key={c.id} className="bg-white p-3 rounded-lg border border-rose-100 flex justify-between items-center shadow-sm">
                 <div>
                    <p className="text-xs font-bold text-slate-800">{c.name}</p>
                    <p className="text-[10px] font-bold mt-0.5 uppercase tracking-wide flex items-center gap-1">
                      {c.isolirRequest === 'request_isolir' ? (
                         <span className="text-rose-600">Minta Isolir (Dari Finance)</span>
                      ) : (
                         <span className="text-emerald-600">Minta Buka Isolir (Sudah Bayar)</span>
                      )}
                    </p>
                 </div>
                 <button 
                    onClick={() => {
                        setClients(prev => prev.map(cl => {
                            if (cl.id === c.id) {
                                if (cl.isolirRequest === 'request_isolir') return { ...cl, netStatus: 'isolir', isolirRequest: undefined };
                                if (cl.isolirRequest === 'request_buka') return { ...cl, netStatus: 'aktif', isolirRequest: undefined };
                            }
                            return cl;
                        }));
                        Swal.fire('ACC', 'Permintaan telah dikonfirmasi dan status diubah.', 'success');
                    }} 
                    className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-4 py-2 rounded-lg shadow-sm transition uppercase"
                 >
                    ACC
                 </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isSuperadmin && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-5 text-fGreen"><TrendingUp className="w-32 h-32" /></div>
              <div className="flex justify-between items-center mb-2 relative z-10">
                  <h3 className="text-sm font-bold text-slate-700">Performa SLA Jaringan</h3>
                  <span className="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-1 rounded">SANGAT BAIK</span>
              </div>
              <div className="flex items-end gap-3 relative z-10">
                  <h2 className="text-3xl font-black text-fGreen">99.8%</h2>
                  <p className="text-[10px] text-slate-500 mb-1">Rata-rata penanganan &lt; 2 Jam</p>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3 relative z-10"><div className="bg-fGreen h-1.5 rounded-full" style={{ width: '99.8%' }}></div></div>
          </div>

          <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3 mt-4">Laporan Modem Masuk & Keluar</h3>
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
                  {inventoryHistory && inventoryHistory.length > 0 ? (
                      <div className="space-y-3">
                         {inventoryHistory.slice(0, 5).map(hist => (
                            <div key={hist.id} className="flex justify-between items-start text-xs border-b border-slate-100 pb-2">
                                <div className="flex-1">
                                   <span className="font-bold text-slate-800 block">{hist.itemName}</span>
                                   <span className="text-[10px] text-slate-500 block">SN/MAC: {hist.sn || '-'}</span>
                                   {hist.type === 'out' && hist.clientName && <span className="text-[10px] text-blue-600 block">Dipasang ke: {hist.clientName}</span>}
                                   <span className="text-[9px] text-slate-400 block">{new Date(hist.timestamp).toLocaleString('id-ID')} &bull; Oleh: {hist.operator}</span>
                                </div>
                                <span className={`${hist.type === 'in' ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'} font-bold px-2 py-1 rounded text-[10px]`}>
                                   {hist.type === 'in' ? 'Stok Masuk' : 'Dipasang'}
                                </span>
                            </div>
                         ))}
                         {inventoryHistory.length > 5 && <button onClick={() => setActiveTab('inventory')} className="text-[10px] text-blue-600 font-bold w-full text-center mt-2">Lihat Semua Laporan Gudang</button>}
                      </div>
                  ) : (
                      <p className="text-xs text-slate-400 text-center py-4">Belum ada laporan modem.</p>
                  )}
              </div>
          </div>

          <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3 mt-4">Pertumbuhan Pelanggan</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                          <p className="text-[9px] text-slate-500 font-bold uppercase">Total Klien</p>
                          <div className="w-6 h-6 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-[10px]"><Users className="w-3 h-3" /></div>
                      </div>
                      <p className="text-xl font-black text-slate-800">{clients.length}</p>
                  </div>
                  <div className="grid grid-rows-2 gap-2">
                      <div className="bg-green-50 border border-green-100 rounded-lg p-2 flex justify-between items-center">
                          <p className="text-[9px] text-slate-600 font-bold">PSB Baru</p>
                          <span className="text-xs font-black text-green-600 flex items-center gap-1">+{clients.length} <ArrowUpRight className="w-3 h-3" /></span>
                      </div>
                      <div className="bg-red-50 border border-red-100 rounded-lg p-2 flex justify-between items-center">
                          <p className="text-[9px] text-slate-600 font-bold">Berhenti</p>
                          <span className="text-xs font-black text-red-600 flex items-center gap-1">-2 <ArrowDownRight className="w-3 h-3" /></span>
                      </div>
                  </div>
              </div>
          </div>
        </>
      )}

      {!isPelanggan && (
        <div onClick={() => runSpeedtest()} className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl p-4 text-white shadow-md flex items-center justify-between cursor-pointer active:scale-95 transition">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur text-2xl shadow-inner">
                    <Gauge className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-sm">Uji Kecepatan Jaringan</h3>
                    <p className="text-[10px] text-teal-100">Cek ping, download & upload server</p>
                </div>
            </div>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                <Play className="w-3 h-3 text-white ml-0.5" fill="currentColor" />
            </div>
        </div>
      )}

      {isKolektor && (
        <div className="grid grid-cols-1 gap-2 mt-2">
            <div onClick={() => setActiveTab('kolektor')} className="bg-gradient-to-r from-rose-600 to-pink-600 rounded-xl p-4 text-white shadow-md flex items-center justify-between cursor-pointer active:scale-95 transition">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur text-2xl shadow-inner">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Daftar Tagihan Berjalan</h3>
                        <p className="text-[10px] text-rose-100">Cek daftar penagihan ke lokasi</p>
                    </div>
                </div>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                    <ArrowUpRight className="w-4 h-4 text-white" />
                </div>
            </div>
        </div>
      )}

      {isTeknisi && (
        <div className="grid grid-cols-1 gap-2 mt-2">
            <div onClick={() => setActiveTab('inventory')} className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white shadow-md flex items-center justify-between cursor-pointer active:scale-95 transition">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur text-2xl shadow-inner">
                        <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Cetak Label Pelanggan</h3>
                        <p className="text-[10px] text-blue-100">Cetak QR Code format Niimbot & gudang</p>
                    </div>
                </div>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur text-white">
                    <ArrowUpRight className="w-4 h-4" />
                </div>
            </div>
            
            <div onClick={() => setActiveTab('scan-modem')} className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-4 text-white shadow-md flex items-center justify-between cursor-pointer active:scale-95 transition">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur text-2xl shadow-inner">
                        <Camera className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">Scan SN Modem</h3>
                        <p className="text-[10px] text-emerald-100">Foto SN belakang modem untuk melacak</p>
                    </div>
                </div>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur text-white">
                    <ArrowUpRight className="w-4 h-4" />
                </div>
            </div>
        </div>
      )}

    </div>
  );
}
