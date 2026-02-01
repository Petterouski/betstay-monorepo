'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', lastName: '', cedula: '', phone: ''
  });
  const [error, setError] = useState('');
  
  // Fallback seguro si la variable de entorno no carga
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://44.197.107.26:3001/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Error al registrarse');
      }

      alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
      router.push('/login');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Crear Cuenta</h1>
        {error && <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input 
              placeholder="Nombre" required className="border p-2 rounded w-full"
              onChange={e => setFormData({...formData, firstName: e.target.value})} 
            />
            <input 
              placeholder="Apellido" required className="border p-2 rounded w-full"
              onChange={e => setFormData({...formData, lastName: e.target.value})} 
            />
          </div>
          <input 
            placeholder="Cédula" required className="w-full border p-2 rounded"
            onChange={e => setFormData({...formData, cedula: e.target.value})} 
          />
          <input 
            placeholder="Teléfono / Celular" required className="w-full border p-2 rounded"
            onChange={e => setFormData({...formData, phone: e.target.value})} 
          />
          <input 
            type="email" placeholder="Email" required className="w-full border p-2 rounded"
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />
          <input 
            type="password" placeholder="Contraseña" required className="w-full border p-2 rounded"
            onChange={e => setFormData({...formData, password: e.target.value})} 
          />

          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition">
            Registrarse
          </button>
        </form>

        <div className="mt-4 text-center border-t pt-4">
          <p className="text-sm text-gray-600 mb-2">¿Ya tienes cuenta?</p>
          <Link href="/login" className="text-blue-500 hover:text-blue-700 font-semibold text-sm">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}