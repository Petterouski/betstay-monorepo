'use client';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // 1. Login para obtener Token
      const res = await fetch('http://44.197.107.26:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!res.ok) throw new Error('Credenciales inválidas');
      const data = await res.json();

      // 2. Obtener datos del usuario (Rol) usando el Token
      const userRes = await fetch('http://44.197.107.26:3001/api/users/me', {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      const userData = await userRes.json();

      // 3. Guardar en contexto y redirigir
      login(data.access_token, userData);

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">BetStay Login</h1>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <input 
          type="email" placeholder="Email" required
          className="w-full border p-2 mb-4 rounded"
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
        <input 
          type="password" placeholder="Contraseña" required
          className="w-full border p-2 mb-6 rounded"
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Ingresar
        </button>
      </form>
    </div>
  );
}