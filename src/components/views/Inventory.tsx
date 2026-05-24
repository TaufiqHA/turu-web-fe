import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context';
import { ArrowDown, ArrowUp, Plus, QrCode, ScanLine, Printer } from 'lucide-react';
import Swal from 'sweetalert2';
import QRCode from 'react-qr-code';
import { Html5QrcodeScanner } from 'html5-qrcode';

export function Inventory() {
  const { inventory, clients, setActiveTab, inventoryHistory } = useAppContext();
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState('');
  
  const inventoryList = Object.values(inventory) as any[];
  const totalIn = inventoryList.reduce((acc, item) => acc + item.inToday, 0);
  const totalOut = inventoryList.reduce((acc, item) => acc + item.outToday, 0);

  useEffect(() => {
    let scanner: Html5QrcodeScanner;
    if (isScanning) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: {width: 250, height: 250}, aspectRatio: 1.0 },
        false
      );
      scanner.render((text) => {
        setScanResult(text);
        setIsScanning(false);
        scanner.clear();
        Swal.fire('Scan Berhasil!', `Data QR: ${text}`, 'success');
      }, (err) => {
        // ignore errors
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error(e));
      }
    }
  }, [isScanning]);

  const handleCetakQR = (client: any) => {
    Swal.fire({
       title: 'Cetak QR Unik',
       html: `
         <div class="flex flex-col items-center justify-center p-4">
            <div id="qr-print-area" class="bg-white p-4 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center">
               <p class="text-xs font-bold mb-2">ID: ${client.id}</p>
               <div id="qr-code-wrapper"></div>
               <p class="text-[10px] mt-2 font-bold">${client.name}</p>
               <p class="text-[8px] text-slate-500">${client.package}</p>
            </div>
         </div>
       `,
       showCancelButton: true,
       confirmButtonText: '<i class="lucide-printer"></i> Cetak',
       cancelButtonText: 'Tutup',
       didOpen: () => {
          import('react-dom/client').then((ReactDOM) => {
              const root = ReactDOM.createRoot(document.getElementById('qr-code-wrapper')!);
              root.render(<QRCode value={client.id} size={128} />);
          });
       }
    }).then((res) => {
       if (res.isConfirmed) {
           const printWindow = window.open('', '_blank');
           if (printWindow) {
               printWindow.document.write(`
                   <html>
                   <head>
                       <title>Print Label</title>
                       <style>
                           @page { size: 40mm 30mm; margin: 0; }
                           body {
                               margin: 0;
                               padding: 2mm;
                               display: flex;
                               flex-direction: column;
                               align-items: center;
                               justify-content: center;
                               width: 40mm;
                               height: 30mm;
                               box-sizing: border-box;
                               font-family: monospace;
                           }
                           .qr-container { display: flex; justify-content: center; align-items: center; margin-bottom: 2mm; }
                           p { margin: 0; font-size: 8px; text-align: center; font-weight: bold; color: black; }
                           .id-text { font-size: 10px; margin-bottom: 1mm; }
                       </style>
                       <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
                   </head>
                   <body>
                       <p class="id-text">${client.id}</p>
                       <div class="qr-container" id="qr-render"></div>
                       <p>${client.name.substring(0, 15)}</p>
                       <script>
                           new QRCode(document.getElementById("qr-render"), {
                               text: "${client.id}",
                               width: 50,
                               height: 50,
                               colorDark : "#000000",
                               colorLight : "#ffffff",
                               correctLevel : QRCode.CorrectLevel.L
                           });
                           setTimeout(() => {
                               window.print();
                               window.close();
                           }, 500);
                       </script>
                   </body>
                   </html>
               `);
               printWindow.document.close();
           }
       }
    });
  }

  return (
    <div className="p-5 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-0 container max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-2 shrink-0">
          <h2 className="text-lg font-bold text-slate-800">Manajemen Aset & Gudang</h2>
          <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded uppercase" id="inventory-role-badge">Gudang & Logistik</span>
      </div>

      <div className="flex gap-2 mb-2">
         <button onClick={() => setIsScanning(!isScanning)} className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-xl p-3 flex flex-col items-center justify-center gap-1 shadow-sm transition">
             <ScanLine className="w-6 h-6" />
             <span className="text-[10px] font-bold tracking-wide uppercase">Scan QR Invetaris</span>
         </button>
         <button onClick={() => setActiveTab('scan-modem')} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl p-3 flex flex-col items-center justify-center gap-1 shadow-sm transition">
             <QrCode className="w-6 h-6" />
             <span className="text-[10px] font-bold tracking-wide uppercase">Scan SN Modem</span>
         </button>
      </div>

      {isScanning && (
         <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
             <div id="reader" className="w-full"></div>
             <button onClick={() => setIsScanning(false)} className="w-full mt-2 bg-red-50 text-red-600 text-xs font-bold py-2 rounded-lg">Batal Scan</button>
         </div>
      )}

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[100px]">
        <h3 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wide">Cetak QR Pelanggan Baru</h3>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 mb-6 max-h-48 overflow-y-auto hide-scrollbar">
           {clients.filter(c => c.status === 'menunggu_acc' || c.status === 'lunas').map(client => (
              <div key={client.id} className="flex justify-between items-center p-2 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition rounded-lg">
                  <div>
                      <p className="text-xs font-bold text-slate-800">{client.name}</p>
                      <p className="text-[10px] text-slate-500">{client.id} &bull; {client.package}</p>
                  </div>
                  <button onClick={() => handleCetakQR(client)} className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center transition" title="Cetak Label QR">
                      <QrCode className="w-4 h-4" />
                  </button>
              </div>
           ))}
        </div>

        <h3 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wide">Stok Gudang</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {inventoryList.map(item => {
            const isLow = item.stock <= 5;
            return (
              <div key={item.id} className={`${isLow ? 'bg-red-50 border-red-200' : 'bg-white border-slate-100'} p-4 pt-6 rounded-2xl shadow-sm border text-center relative overflow-hidden group`}>
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wide leading-tight mb-1 h-6 flex items-center justify-center mt-2">{item.name}</h4>
                <p className={`text-2xl font-black ${isLow ? 'text-fRed' : 'text-slate-800'}`}>{item.stock} <span className="text-xs font-normal">Unit</span></p>
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 min-h-[200px]">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-slate-800">Riwayat Keluar Masuk</h3>
                <button className="bg-slate-800 hover:bg-slate-900 text-white text-[9px] flex items-center gap-1 px-2 py-1 rounded shadow-sm transition"><Plus className="w-3 h-3" />Barang</button>
            </div>
            <div className="space-y-3 mt-4">
                {inventoryHistory.length === 0 ? (
                   <p className="text-center text-[10px] text-slate-400 py-4">Belum ada riwayat tercatat</p>
                ) : (
                   inventoryHistory.map(hist => (
                      <div key={hist.id} className="flex justify-between items-start text-[11px] border-b border-slate-100 pb-2">
                          <div className="flex-1">
                             <span className="text-slate-700 font-bold block">{hist.itemName}</span>
                             <span className="text-[9px] text-slate-500 block">
                                {new Date(hist.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })} &bull; {hist.operator}
                             </span>
                             {hist.sn && <span className="text-[9px] text-blue-600 block">SN: {hist.sn}</span>}
                             {hist.clientName && <span className="text-[9px] text-slate-500 block">Ke: {hist.clientName}</span>}
                          </div>
                          <span className={`${hist.type === 'in' ? 'text-emerald-500 bg-emerald-50' : 'text-rose-500 bg-rose-50'} font-bold px-2 py-0.5 rounded shrink-0`}>
                             {hist.type === 'in' ? '+' : '-'}{hist.quantity} Unit
                          </span>
                      </div>
                   ))
                )}
            </div>
        </div>
      </div>
    </div>
  )
}

