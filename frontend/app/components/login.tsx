'use client';
import { useState } from 'react';
import axios from 'axios';

export default function Login({ onOk }: { onOk: (t: string) => void }) {
  const [u, setU] = useState('admin');
  const [p, setP] = useState('admin');
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL as string;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backend}/auth/login`, { username: u, password: p });
      onOk(data.token);
    } catch {
      alert('Error de credenciales o backend no accesible');
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 bg-white p-6 rounded-2xl shadow w-full max-w-sm">
      <h2 className="text-lg font-semibold text-center">Acceso</h2>
      <input className="border rounded p-2 w-full" placeholder="Usuario" value={u} onChange={(e)=>setU(e.target.value)} />
      <input className="border rounded p-2 w-full" type="password" placeholder="Contraseña" value={p} onChange={(e)=>setP(e.target.value)} />
      <button className="w-full rounded-2xl bg-brand-600 text-white font-semibold px-6 py-2">Entrar</button>
    </form>
  );
}
