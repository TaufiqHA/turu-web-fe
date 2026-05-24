import { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../context';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Bed, Crosshair } from 'lucide-react';

export function MapView() {
  const { clients, networkNodes } = useAppContext();
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const stats = {
    aktif: clients.filter(c => c.netStatus === 'aktif').length,
    tdkaktif: clients.filter(c => c.netStatus === 'tidak_aktif').length,
    isolir: clients.filter(c => c.netStatus === 'isolir').length,
  };

  useEffect(() => {
    if (!containerRef.current) return;
    
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, { zoomControl: false }).setView([-7.1509, 111.8817], 14);
      L.control.zoom({ position: 'bottomright' }).addTo(mapRef.current);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OSM'
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    
    markersRef.current.forEach(m => mapRef.current?.removeLayer(m));
    markersRef.current = [];

    const searchLower = searchTerm.toLowerCase();

    clients.forEach(c => {
      if (searchTerm && !c.name.toLowerCase().includes(searchLower) && !String(c.id).includes(searchLower)) return;

      let mColor = 'grey';
      if (c.netStatus === 'aktif') mColor = 'green';
      else if (c.netStatus === 'isolir') mColor = 'red';

      const icon = L.icon({
          iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${mColor}.png`,
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34]
      });

      const waMessage = encodeURIComponent(`Halo ${c.name}, saya team teknisi wifi mau menanyakan kondisi jaringan anda, soalnya disistem kami terpantau off.`);
      
      const popupContent = `
        <div style="width: 15rem; font-family: sans-serif;">
          <img src="${c.photo || 'https://placehold.co/400x300/e2e8f0/475569?text=Image'}" alt="Foto Rumah" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
          <h3 style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${c.name}</h3>
          <p style="font-size: 10px; color: #64748b; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.address}</p>
          ${c.serialNumber ? `<p style="font-size: 10px; color: #3b82f6; margin-bottom: 8px; font-weight: bold;">SN: ${c.serialNumber}</p>` : `<div style="margin-bottom: 8px;"></div>`}
          <div style="display: flex; gap: 4px; margin-bottom: 8px;">
             <a href="https://www.google.com/maps?q=${c.lat},${c.lng}" target="_blank" style="flex:1; background-color: #eff6ff; color: #2563eb; text-align: center; font-size: 10px; font-weight: bold; padding: 6px; border-radius: 6px; text-decoration: none;">Buka di Maps</a>
          </div>
          <a href="https://wa.me/${c.phone}?text=${waMessage}" target="_blank" style="display: block; width: 100%; background-color: #f0fdf4; color: #16a34a; text-align: center; font-size: 10px; font-weight: bold; padding: 6px; border-radius: 6px; text-decoration: none;">Chat WA Teknisi</a>
        </div>
      `;

      const marker = L.marker([c.lat, c.lng], {icon}).bindPopup(popupContent, { minWidth: 200 });
      marker.addTo(mapRef.current!);
      markersRef.current.push(marker);
    });

    networkNodes.forEach(n => {
      if (searchTerm && !n.name.toLowerCase().includes(searchLower)) return;
      
      let html = '';
      if(n.type === 'server') html = '<div class="w-7 h-7 bg-slate-800 text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg">S</div>';
      else if(n.type === 'odc') html = '<div class="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md">O</div>';
      else if(n.type === 'odp') html = '<div class="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow-md">P</div>';

      const icon = L.divIcon({ html, className: '', iconSize: [28, 28], iconAnchor: [14, 14] });
      const popupContent = `<div style="text-align: center; font-family: sans-serif;"><p style="font-size: 9px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">${n.type}</p><h4 style="font-size: 14px; font-weight: bold;">${n.name}</h4></div>`;
      
      const marker = L.marker([n.lat, n.lng], {icon}).bindPopup(popupContent);
      marker.addTo(mapRef.current!);
      markersRef.current.push(marker);
    });
  }, [clients, networkNodes, searchTerm]);

  const recenterMap = () => {
    mapRef.current?.setView([-7.1509, 111.8817], 14);
  }

  return (
    <div className="absolute inset-0 bg-slate-200 animate-in fade-in flex flex-col pt-1 pb-[90px]">
      <div className="absolute top-3 left-3 right-3 z-[400] pointer-events-none">
          <div className="bg-white/95 backdrop-blur shadow-sm rounded-xl p-2 pointer-events-auto border-l-4 border-fRed flex flex-col gap-1.5 relative">
              <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                      <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                      <input 
                        type="text" 
                        placeholder="Cari pelanggan atau ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-8 pr-2 py-1.5 focus:outline-none focus:border-fGreen transition"
                      />
                  </div>
                  <button onClick={recenterMap} className="bg-fDark hover:bg-slate-800 transition text-white w-8 h-8 rounded-lg flex items-center justify-center shadow shrink-0">
                      <Crosshair className="w-4 h-4"/>
                  </button>
              </div>

              <div className="flex justify-between items-center bg-slate-100 rounded-lg p-1.5 border border-slate-200">
                  <div className="flex flex-col items-center flex-1">
                      <span className="flex items-center gap-1 text-[9px] font-bold text-green-700"><span className="w-2 h-2 rounded-full bg-green-500"></span>Aktif</span>
                      <span className="text-[11px] font-black text-slate-800">{stats.aktif}</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 border-l border-r border-slate-300">
                      <span className="flex items-center gap-1 text-[9px] font-bold text-slate-500"><span className="w-2 h-2 rounded-full bg-slate-400"></span>Off</span>
                      <span className="text-[11px] font-black text-slate-800">{stats.tdkaktif}</span>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                      <span className="flex items-center gap-1 text-[9px] font-bold text-red-700"><span className="w-2 h-2 rounded-full bg-red-500"></span>Isolir</span>
                      <span className="text-[11px] font-black text-slate-800">{stats.isolir}</span>
                  </div>
              </div>
          </div>
      </div>
      <div ref={containerRef} className="flex-1 w-full h-full z-0" style={{ isolation: 'isolate' }}></div>
    </div>
  )
}
