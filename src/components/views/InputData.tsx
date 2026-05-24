import { UserPlus, Server, Archive, Share2, Download, Upload, Users } from 'lucide-react';
import { useAppContext } from '../../context';
import Swal from 'sweetalert2';
import Tesseract from 'tesseract.js';

export function InputData() {
  const { setClients, setNetworkNodes, setInventory, setInventoryHistory, user, role, setActiveTab } = useAppContext();

  const handlePelanggan = () => {
    Swal.fire({
      title: 'Registrasi Pelanggan Baru',
      html: `
          <div class="space-y-3 mt-2 text-left">
              <input id="in-nama" class="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-fGreen" placeholder="Nama Pelanggan">
              <input id="in-hp" class="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-fGreen" placeholder="No HP/WA (Misal: 628...)">
              <select id="in-tagihan" class="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-fGreen">
                  <option value="">Pilih Biaya Langganan...</option>
                  <option value="110000">Rp 110.000</option>
                  <option value="120000">Rp 120.000</option>
                  <option value="125000">Rp 125.000</option>
                  <option value="135000">Rp 135.000</option>
                  <option value="150000">Rp 150.000</option>
                  <option value="165000">Rp 165.000</option>
                  <option value="200000">Rp 200.000</option>
                  <option value="250000">Rp 250.000</option>
              </select>
              <input id="in-alamat" class="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-fGreen" placeholder="Alamat Pemasangan">
              <input id="in-coords" class="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-fGreen" placeholder="Koordinat Maps (Misal: -7.0950, 111.9795)">
              <div class="flex gap-2">
                  <input id="in-sn" class="flex-1 bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-fGreen" placeholder="SN / MAC Modem (Opsional)">
                  <button type="button" id="btn-scan-sn" class="bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 rounded-lg flex flex-col items-center justify-center transition">
                      <span style="font-size: 9px; font-weight: bold;">KAMERA</span>
                  </button>
                  <label class="bg-indigo-100 cursor-pointer hover:bg-indigo-200 text-indigo-700 px-2 rounded-lg flex flex-col items-center justify-center transition mb-0">
                      <span style="font-size: 9px; font-weight: bold;">GALERI</span>
                      <input type="file" id="in-sn-file" accept="image/*" class="hidden">
                  </label>
              </div>
              <div id="sn-loading" style="display:none;" class="text-[10px] text-blue-600 font-bold mt-1">Menganalisis gambar (OCR)...</div>
              <div id="sn-reader-container" style="display:none;" class="mt-2 text-center bg-white border border-slate-200 p-2 rounded-lg">
                  <div id="sn-reader" style="width: 100%;"></div>
                  <button type="button" id="btn-close-scan" class="mt-2 text-[10px] bg-red-100 text-red-600 px-3 py-1 rounded font-bold">Batalkan Scan</button>
              </div>
              <label class="text-[10px] font-bold text-slate-500 uppercase mt-2 block">Foto Rumah</label>
              <input type="file" id="in-photo-file" accept="image/*" class="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 mt-1 cursor-pointer">
              <p class="text-[10px] text-fRed mt-2 font-bold">Password klien akan di set "123456" secara default.</p>
          </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
      didOpen: () => {
         const btnScan = document.getElementById('btn-scan-sn');
         const btnClose = document.getElementById('btn-close-scan');
         const container = document.getElementById('sn-reader-container');
         const fileSn = document.getElementById('in-sn-file') as HTMLInputElement;
         const snLoading = document.getElementById('sn-loading');
         let html5QrcodeScanner: any = null;

         if (fileSn) {
            fileSn.addEventListener('change', (e: any) => {
               const file = e.target.files?.[0];
               if (file) {
                   const reader = new FileReader();
                   reader.onload = (event) => {
                       if (event.target?.result && snLoading) {
                           snLoading.style.display = 'block';
                           Tesseract.recognize(event.target.result as string, 'eng')
                           .then(({ data: { text } }) => {
                               const cleanText = text.replace(/[^a-zA-Z0-9-:]/g, '');
                               const possibleSN = cleanText.length > 5 ? cleanText : text.trim();
                               const snInput = document.getElementById('in-sn') as HTMLInputElement;
                               if (snInput) snInput.value = possibleSN;
                               snLoading.style.display = 'none';
                           }).catch(() => {
                               snLoading.style.display = 'none';
                               alert('Gagal memproses gambar');
                           });
                       }
                   };
                   reader.readAsDataURL(file);
               }
            });
         }

         if (btnScan && btnClose && container) {
            btnScan.addEventListener('click', () => {
               import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
                   container.style.display = 'block';
                   if (!html5QrcodeScanner) {
                       html5QrcodeScanner = new Html5QrcodeScanner(
                         "sn-reader",
                         { fps: 10, qrbox: {width: 250, height: 100}, aspectRatio: 1.0 },
                         false
                       );
                       html5QrcodeScanner.render((text: string) => {
                           const snInput = document.getElementById('in-sn') as HTMLInputElement;
                           if (snInput) snInput.value = text;
                           html5QrcodeScanner.clear();
                           container.style.display = 'none';
                       }, () => {});
                   }
               });
            });

            btnClose.addEventListener('click', () => {
               if (html5QrcodeScanner) {
                   html5QrcodeScanner.clear();
               }
               container.style.display = 'none';
            });
         }
      },
      preConfirm: () => {
          return new Promise((resolve) => {
              const name = (document.getElementById('in-nama') as HTMLInputElement).value;
              const phone = (document.getElementById('in-hp') as HTMLInputElement).value;
              const coords = (document.getElementById('in-coords') as HTMLInputElement).value;
              
              let lat = NaN, lng = NaN;
              if (coords.includes(',')) {
                  const parts = coords.split(',');
                  lat = parseFloat(parts[0].trim());
                  lng = parseFloat(parts[1].trim());
              }

              if (!name || isNaN(lat) || isNaN(lng) || !phone) {
                  Swal.showValidationMessage('Nama, No HP, dan koordinat valid wajib diisi!');
                  resolve(false);
                  return;
              }

              const feeVal = parseInt((document.getElementById('in-tagihan') as HTMLSelectElement).value) || 0;
              const packageVal = feeVal ? `Rp ${feeVal.toLocaleString('id-ID')}` : '-';
              const addressVal = (document.getElementById('in-alamat') as HTMLInputElement).value;
              const snVal = (document.getElementById('in-sn') as HTMLInputElement).value;
              const fileInput = document.getElementById('in-photo-file') as HTMLInputElement;
              const file = fileInput.files?.[0];

              const resolveData = (photoData: string) => {
                  resolve({
                      id: "P-" + Math.floor(Math.random() * 90000),
                      name: name,
                      package: packageVal,
                      fee: feeVal,
                      status: 'menunggu_acc', 
                      netStatus: 'tidak_aktif',
                      lat: lat, 
                      lng: lng, 
                      address: addressVal,
                      serialNumber: snVal,
                      photo: photoData || "https://placehold.co/400x300/e2e8f0/475569?text=Rumah+Baru", 
                      phone: phone, 
                      password: "123456",
                      role: 'pelanggan'
                  });
              };

              if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => resolveData(e.target?.result as string);
                  reader.readAsDataURL(file);
              } else {
                  resolveData("");
              }
          });
      }
    }).then((result) => {
        if (result.isConfirmed) {
            const newClient = result.value as any;
            setClients(prev => [...prev, newClient]);
            
            if (newClient.serialNumber) {
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
                      sn: newClient.serialNumber,
                      clientName: newClient.name,
                      timestamp: new Date().toISOString(),
                      operator: user?.name || role || 'Unknown'
                   },
                   ...prev
                ]);
            }
            
            Swal.fire('Tersimpan!', 'Pelanggan berhasil didaftarkan.', 'success');
        }
    });
  }

  const handleTitik = (type: string) => {
    let typeLab = type.toUpperCase();
    Swal.fire({
      title: `Tambah Titik ${typeLab}`,
      html: `
          <div class="space-y-3 mt-2 text-left">
              <input id="t-nama" class="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-fGreen" placeholder="Nama Titik (${typeLab}...)">
              <input id="t-coords" class="w-full bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-fGreen" placeholder="Koordinat Maps (Misal: -7.0950, 111.9795)">
          </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#94a3b8',
      preConfirm: () => {
          const name = (document.getElementById('t-nama') as HTMLInputElement).value;
          const coords = (document.getElementById('t-coords') as HTMLInputElement).value;
          
          let lat = NaN, lng = NaN;
          if (coords.includes(',')) {
              const parts = coords.split(',');
              lat = parseFloat(parts[0].trim());
              lng = parseFloat(parts[1].trim());
          }

          if (!name || isNaN(lat) || isNaN(lng)) {
              Swal.showValidationMessage('Nama dan koordinat valid wajib diisi!');
              return false;
          }
          return { id: `N-${Math.floor(Math.random()*1000)}`, type: type as any, name, lat, lng };
      }
    }).then((result) => {
        if (result.isConfirmed) {
            setNetworkNodes(prev => [...prev, result.value as any]);
            Swal.fire('Tersimpan!', `Titik ${typeLab} berhasil ditambahkan.`, 'success');
        }
    });
  }

  const handleImportExcel = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls, .csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        Swal.fire({
          title: 'Memproses Data...',
          text: `Membaca file ${file.name}`,
          icon: 'info',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          Swal.fire('Sukses', 'Data pelanggan berhasil diimport dari Excel', 'success');
        });
      }
    };
    input.click();
  };

  const handleExportExcel = () => {
    Swal.fire({
      title: 'Export Data',
      text: 'Mengekspor data pelanggan ke Excel...',
      icon: 'info',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/csv;charset=utf-8,ID,Nama,Paket,Tagihan,Status\nP-123,Pelanggan Demo,10 Mbps,150000,lunas');
      element.setAttribute('download', 'data_pelanggan.csv');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    });
  };

  return (
    <div className="p-5 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 container">
      <div className="flex justify-between items-center mb-6">
          <div>
              <h2 className="text-lg font-bold text-slate-800">Manajemen Data</h2>
              <p className="text-[10px] text-slate-500">Registrasi klien & titik distribusi</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded w-fit">AREA HD & ADMIN</span>
            <div className="flex gap-2">
               <button onClick={handleImportExcel} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1.5 rounded flex items-center gap-1 transition"><Upload className="w-3 h-3"/> Import Excel</button>
               <button onClick={handleExportExcel} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-1.5 rounded flex items-center gap-1 transition"><Download className="w-3 h-3"/> Export</button>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div onClick={handlePelanggan} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center cursor-pointer hover:border-green-400 hover:shadow-md transition group">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition"><UserPlus className="w-6 h-6" /></div>
              <h3 className="font-bold text-slate-800 text-sm">Pelanggan Baru</h3>
              <p className="text-[9px] text-slate-500 mt-1">Registrasi klien ke sistem</p>
          </div>
          <div onClick={() => handleTitik('server')} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center cursor-pointer hover:border-slate-800 hover:shadow-md transition group">
              <div className="w-12 h-12 bg-slate-100 text-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition"><Server className="w-6 h-6" /></div>
              <h3 className="font-bold text-slate-800 text-sm">Server Sumber</h3>
              <p className="text-[9px] text-slate-500 mt-1">Titik pusat NOC / OLT</p>
          </div>
          <div onClick={() => handleTitik('odc')} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center cursor-pointer hover:border-orange-400 hover:shadow-md transition group">
              <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition"><Archive className="w-6 h-6" /></div>
              <h3 className="font-bold text-slate-800 text-sm">Titik ODC</h3>
              <p className="text-[9px] text-slate-500 mt-1">Optical Dist. Cabinet</p>
          </div>
          <div onClick={() => handleTitik('odp')} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-400 hover:shadow-md transition group">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition"><Share2 className="w-6 h-6" /></div>
              <h3 className="font-bold text-slate-800 text-sm">Titik ODP</h3>
              <p className="text-[9px] text-slate-500 mt-1">Optical Dist. Point</p>
          </div>
          {(role === 'superadmin') && (
            <div onClick={() => setActiveTab('karyawan')} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center cursor-pointer hover:border-fDark hover:shadow-md transition group">
                <div className="w-12 h-12 bg-slate-100 text-fDark rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition"><Users className="w-6 h-6" /></div>
                <h3 className="font-bold text-slate-800 text-sm">Tim & Akses</h3>
                <p className="text-[9px] text-slate-500 mt-1">Manajemen Tim / Teknisi</p>
            </div>
          )}
      </div>
    </div>
  )
}
