import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState('laporan'); // 'laporan' atau 'admin'
  const [menu, setMenu] = useState('aset'); // 'aset', 'mutasi', 'kalibrasi'
  
  // State Data
  const [dataAset, setDataAset] = useState([]);
  const [formAset, setFormAset] = useState({ kode_aset: '', nama_aset: '', kondisi: 'Baik', lokasi_sekarang: '' });

  useEffect(() => {
    // Cek status login session
    const session = supabase.auth.getSession();
    setUser(session?.user ?? null);
    
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    fetchData();
  }, [menu]);

  const fetchData = async () => {
    if (menu === 'aset') {
      let { data } = await supabase.from('aset').select('*');
      setDataAset(data || []);
    }
    // Lakukan hal yang sama untuk menu mutasi dan kalibrasi...
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else setView('admin');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('laporan');
  };

  const handleCreateAset = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('aset').insert([formAset]);
    if (error) alert(error.message);
    else {
      alert('Aset berhasil ditambahkan!');
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* NAVBAR */}
      <nav className="bg-blue-600 p-4 text-white flex justify-between items-center">
        <h1 className="font-bold text-xl">SIM KIR & Kalibrasi</h1>
        <div className="space-x-4">
          <button onClick={() => setView('laporan')} className="underline">Lihat Laporan Public</button>
          {user ? (
            <>
              <button onClick={() => setView('admin')} className="bg-green-500 px-3 py-1 rounded">Menu Admin</button>
              <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">Logout</button>
            </>
          ) : (
            <button onClick={() => setView('login')} className="bg-grey-800 border px-3 py-1 rounded">Login Admin</button>
          )}
        </div>
      </nav>

      {/* RENDER VIEW BERDASARKAN STATE */}
      <div className="p-6">
        {view === 'login' && (
          <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">Login Admin</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} className="w-full border p-2 rounded" required />
              <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} className="w-full border p-2 rounded" required />
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Masuk</button>
            </form>
          </div>
        )}

        {view === 'laporan' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Laporan Aset & Transaksi</h2>
            {/* Navigasi Sub-Laporan */}
            <div className="flex space-x-2 mb-4">
              <button onClick={() => setMenu('aset')} className={`px-4 py-2 rounded ${menu === 'aset' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Daftar KIR Aset</button>
              <button onClick={() => setMenu('mutasi')} className={`px-4 py-2 rounded ${menu === 'mutasi' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Riwayat Mutasi</button>
              <button onClick={() => setMenu('kalibrasi')} className={`px-4 py-2 rounded ${menu === 'kalibrasi' ? 'bg-blue-600 text-white' : 'bg-white'}`}>Jadwal Kalibrasi</button>
            </div>

            {/* Tabel Laporan (Read Only untuk Umum) */}
            <div className="bg-white p-4 rounded shadow overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 border">Kode</th>
                    <th className="p-2 border">Nama Aset</th>
                    <th className="p-2 border">Lokasi</th>
                    <th className="p-2 border">Kondisi</th>
                  </tr>
                </thead>
                <tbody>
                  {dataAset.map(aset => (
                    <tr key={aset.id}>
                      <td className="p-2 border">{aset.kode_aset}</td>
                      <td className="p-2 border">{aset.nama_aset}</td>
                      <td className="p-2 border">{aset.lokasi_sekarang}</td>
                      <td className="p-2 border">{aset.kondisi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === 'admin' && user && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-red-600">Panel Manajemen Admin (Full CRUD)</h2>
            {/* Form Tambah Aset (Hanya muncul di Admin) */}
            <form onSubmit={handleCreateAset} className="bg-white p-4 rounded shadow mb-6 grid grid-cols-2 gap-4">
              <input type="text" placeholder="Kode Aset" onChange={e => setFormAset({...formAset, kode_aset: e.target.value})} className="border p-2 rounded" required />
              <input type="text" placeholder="Nama Aset" onChange={e => setFormAset({...formAset, nama_aset: e.target.value})} className="border p-2 rounded" required />
              <input type="text" placeholder="Lokasi" onChange={e => setFormAset({...formAset, lokasi_sekarang: e.target.value})} className="border p-2 rounded" required />
              <select onChange={e => setFormAset({...formAset, kondisi: e.target.value})} className="border p-2 rounded">
                <option value="Baik">Baik</option>
                <option value="Rusak Ringan">Rusak Ringan</option>
                <option value="Rusak Berat">Rusak Berat</option>
              </select>
              <button type="submit" className="col-span-2 bg-green-600 text-white p-2 rounded">Tambah Aset Baru</button>
            </form>
            
            <p className="text-sm text-gray-500">*Admin juga dapat melakukan fungsi edit dan delete di sini dengan tombol tambahan pada tabel.</p>
          </div>
        )}
      </div>
    </div>
  );
}
