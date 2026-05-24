import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../context';
import { Camera, Search, User, Check, X, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import Tesseract from 'tesseract.js';
import { Client } from '../../types';

export function ScanModem() {
  const { clients, setClients, role, inventory, setInventory, setInventoryHistory, user } = useAppContext();
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedText, setScannedText] = useState('');
  const [foundClient, setFoundClient] = useState<Client | null>(null);
  const [showAssign, setShowAssign] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setIsCapturing(true);
      setScannedText('');
      setFoundClient(null);
      setShowAssign(false);
    } catch (err) {
      Swal.fire('Error', 'Kamera tidak dapat diakses', 'error');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const processImage = async (imageSrc: string) => {
    setIsProcessing(true);
    setScannedText('');
    setFoundClient(null);
    setShowAssign(false);
    try {
      const { data: { text } } = await Tesseract.recognize(
        imageSrc,
        'eng',
        { logger: m => console.log(m) }
      );
      
      const cleanText = text.replace(/[^a-zA-Z0-9-:]/g, ''); // Basic cleanup for SN or MAC
      const possibleSN = cleanText.length > 5 ? cleanText : text.trim();
      setScannedText(possibleSN);
      
      // Look for client with this SN
      const existing = clients.find(c => c.serialNumber && possibleSN.includes(c.serialNumber));
      
      if (existing) {
        setFoundClient(existing);
      } else {
        if (role === 'gudang') {
           addToGudang(possibleSN);
        } else {
           setShowAssign(true);
        }
      }
    } catch (error) {
      Swal.fire('Error', 'Gagal memproses gambar', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const addToGudang = (scannedSN?: string) => {
    const targetSN = scannedSN || scannedText;
    if (!targetSN) return;
    
    setInventory(prev => {
      const currentRouter = prev['router'] || { id: 'router', name: 'Router Modem', stock: 0, inToday: 0, outToday: 0, icon: 'router', color: 'blue' };
      return {
        ...prev,
        'router': {
           ...currentRouter,
           stock: currentRouter.stock + 1,
           inToday: currentRouter.inToday + 1
        }
      };
    });
    
    setInventoryHistory?.(prev => [
       {
          id: Date.now().toString(),
          itemId: 'router',
          itemName: 'Router Modem',
          type: 'in',
          quantity: 1,
          sn: targetSN,
          timestamp: new Date().toISOString(),
          operator: user?.name || role || 'Unknown'
       },
       ...prev
    ]);

    Swal.fire('Berhasil', `SN ${targetSN} berhasil ditambahkan ke stok Gudang (Modem)`, 'success');
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageSrc = canvas.toDataURL('image/jpeg');
        stopCamera();
        processImage(imageSrc);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const assignToClient = (clientId: string | number) => {
    if (!scannedText) return;
    const currentClient = clients.find(c => c.id == clientId);
    setClients(prev => prev.map(c => c.id == clientId ? { ...c, serialNumber: scannedText } : c));
    
    // Log inventory out
    setInventory(prev => {
       const currentRouter = prev['router'] || { id: 'router', name: 'Router Modem', stock: 0, inToday: 0, outToday: 0, icon: 'router', color: 'blue' };
       return {
          ...prev,
          'router': { ...currentRouter, stock: Math.max(0, currentRouter.stock - 1), outToday: currentRouter.outToday + 1 }
       }
    });

    setInventoryHistory?.(prev => [
       {
          id: Date.now().toString(),
          itemId: 'router',
          itemName: 'Router Modem',
          type: 'out',
          quantity: 1,
          sn: scannedText,
          clientName: currentClient?.name,
          timestamp: new Date().toISOString(),
          operator: user?.name || role || 'Unknown'
       },
       ...prev
    ]);

    Swal.fire('Berhasil', 'SN berhasil di-assign ke pelanggan', 'success');
    setShowAssign(false);
    setFoundClient(clients.find(c => c.id == clientId) || null);
  };

  return (
    <div className="p-5 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 container max-w-lg mx-auto pb-[100px]">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div>
           <h1 className="text-xl font-black text-slate-800">Scan SN Modem</h1>
           <p className="text-[10px] text-slate-500 font-medium">Foto barcode/SN belakang modem</p>
        </div>
      </div>

      {!isCapturing && !isProcessing && !scannedText && (
        <div className="flex flex-col gap-4">
          <button onClick={startCamera} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-lg active:scale-95 transition">
             <Camera className="w-12 h-12" />
             <span className="font-bold">Buka Kamera</span>
          </button>
          <div className="relative text-center">
            <span className="bg-slate-50 relative z-10 px-4 text-xs text-slate-400 font-bold uppercase">Atau</span>
            <div className="absolute top-1/2 left-0 w-full h-px bg-slate-200"></div>
          </div>
          <label className="bg-white border-2 border-dashed border-slate-300 hover:bg-slate-50 text-slate-600 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-sm cursor-pointer transition">
             <Search className="w-8 h-8 text-slate-400" />
             <span className="text-sm font-bold">Pilih dari Galeri</span>
             <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      )}

      {isCapturing && (
        <div className="bg-black rounded-2xl overflow-hidden relative shadow-lg">
          <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover"></video>
          <div className="absolute inset-x-0 bottom-6 flex justify-center gap-4">
             <button onClick={stopCamera} className="w-12 h-12 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center backdrop-blur">
               <X className="w-6 h-6" />
             </button>
             <button onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full border-4 border-slate-300 flex items-center justify-center shadow-lg active:scale-95 transition">
             </button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />

      {isProcessing && (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-4 text-center">
           <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
           <div>
             <p className="font-bold text-slate-800">Menganalisis Gambar</p>
             <p className="text-xs text-slate-500 mt-1">Membaca teks dari gambar menggunakan AI OCR...</p>
           </div>
        </div>
      )}

      {scannedText && !isProcessing && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
           <div>
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Hasil Scan (Teks Terdeteksi)</p>
              <div className="bg-slate-100 p-3 rounded-xl border border-slate-200">
                <p className="font-mono text-sm break-all font-semibold text-slate-800">{scannedText}</p>
                <p className="text-[9px] text-slate-400 mt-1">Pastikan Anda membaca bagian yang mengandung SN/MAC</p>
              </div>
           </div>

           {foundClient ? (
             <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-4">
               <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center shrink-0">
                 <Check className="w-5 h-5 text-emerald-700" />
               </div>
               <div>
                 <p className="text-[10px] uppercase font-bold text-emerald-600 mb-0.5">Perangkat Terdaftar</p>
                 <p className="font-bold text-slate-800">{foundClient.name}</p>
                 <p className="text-[10px] text-slate-500 mt-1">Alamat: {foundClient.address || '-'}</p>
                 <p className="text-[10px] text-slate-500">Paket: {foundClient.package}</p>
               </div>
             </div>
           ) : showAssign ? (
             <div className="space-y-4 pt-3 border-t border-slate-100">
               {role === 'gudang' ? (
                  <div>
                     <p className="text-xs font-bold text-slate-800 mb-2">Ditambahkan ke Gudang</p>
                     <p className="text-[10px] text-slate-500 block">Modem dengan SN ini telah otomatis ditambahkan sebagai stok baru.</p>
                  </div>
               ) : (
                  <div>
                     <p className="text-xs font-bold text-rose-600 flex items-center gap-1 mb-2">
                       <X className="w-4 h-4" /> Perangkat belum terdaftar di pelanggan mana pun.
                     </p>
                     <p className="text-xs text-slate-600 mb-3">Pilih pelanggan untuk di-assign perangkat ini:</p>
                     <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                       {clients.filter(c => c.status === 'lunas' || c.status === 'menunggu_acc').map(client => (
                         <div key={client.id} onClick={() => assignToClient(client.id)} className="flex justify-between items-center bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 p-3 rounded-xl cursor-pointer transition">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center shrink-0"><User className="w-4 h-4"/></div>
                               <div>
                                  <p className="text-xs font-bold text-slate-800">{client.name}</p>
                                  <p className="text-[10px] text-slate-500">{client.package}</p>
                               </div>
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">Pilih</span>
                         </div>
                       ))}
                     </div>
                  </div>
               )}
             </div>
           ) : null}

           <button onClick={() => { setScannedText(''); setIsCapturing(true); startCamera(); }} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition mt-4">
              Scan Ulang
           </button>
        </div>
      )}
    </div>
  );
}
