'use client';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link'; // <--- IMPORTANTE

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [error, setError] = useState('');
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://44.197.107.26:3001/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({})); 
        throw new Error(errorData.message || 'Credenciales inválidas');
      }

      const data = await res.json();

      const userRes = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      
      const userData = await userRes.json();
      login(data.access_token, userData);

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">BetStay Login</h1>
        
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input type="email" required className="w-full border p-2 rounded"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
            <input type="password" required className="w-full border p-2 rounded"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
            Ingresar
          </button>
        </form>

        {/* --- SECCIÓN DE REGISTRO --- */}
        <div className="mt-6 text-center border-t pt-4">
          <p className="text-sm text-gray-600">¿No tienes cuenta?</p>
          <Link href="/register" className="text-blue-600 font-bold hover:underline mt-2 inline-block">
            👉 Regístrate aquí
          </Link>
        </div>
        {/* --------------------------- */}
      </div>
    </div>
  );
}