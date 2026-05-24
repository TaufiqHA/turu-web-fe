import React, { useState } from 'react';
import { useAppContext } from '../context';
import Swal from 'sweetalert2';
import { User, Lock } from 'lucide-react';
import { Logo } from './Logo';

export function Login() {
  const { login } = useAppContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!username || !password) {
      Swal.fire('Peringatan', 'Mohon isi Username/No. HP dan Password', 'warning');
      return;
    }

    const success = login(username, password);
    if (!success) {
      Swal.fire('Akses Ditolak', 'Username/No. HP atau Password salah atau akun non-aktif.', 'error');
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80')] bg-center bg-cover z-50">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 to-indigo-600/90"></div>
      <div className="relative z-10 w-full px-8 flex flex-col items-center">
        <div className="w-32 h-32 flex items-center justify-center mb-2 bg-white rounded-3xl shadow-lg relative overflow-hidden">
          <Logo className="w-full h-full" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-widest mb-1 uppercase drop-shadow-md">Turu <span className="text-red-500">Sore</span></h1>
        <p className="text-sm text-green-100 mb-8 font-medium">Smart ISP Management System</p>
        
        <form onSubmit={handleLogin} className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl w-full shadow-2xl">
          <h2 className="text-white text-sm font-bold mb-4 text-center">Masuk ke Sistem</h2>
          
          <div className="space-y-3 mb-6">
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Username Tim / No. HP Klien" 
                className="w-full bg-white/10 border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-green-400 placeholder-white/50 transition" 
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password (Klien Default: 123456)" 
                className="w-full bg-white/10 border border-white/10 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-green-400 placeholder-white/50 transition" 
              />
            </div>
          </div>
          
          <button type="submit" className="w-full bg-fGreen hover:bg-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg transition text-sm">Masuk</button>
        </form>
      </div>
    </div>
  );
}
