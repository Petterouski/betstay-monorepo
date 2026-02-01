'use client';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');

  // Protección simple: si no hay usuario, no mostramos nada (o podrías redirigir)
  if (!user) return <div className="p-10">Cargando sesión...</div>;

  const isAdminOrManager = user.role === 'ADMIN' || user.role === 'HOTEL_MANAGER';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* SIDEBAR (Solo Staff) */}
      {isAdminOrManager && (
        <aside className="w-64 bg-gray-900 text-white flex flex-col">
          <div className="p-4 font-bold text-xl border-b border-gray-700">BetStay Staff</div>
          <nav className="flex-1 p-4 space-y-2">
            <button 
              onClick={() => setActiveTab('perfil')}
              className={`block w-full text-left p-2 rounded ${activeTab === 'perfil' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
            >
              Mi Perfil
            </button>
            <button 
              onClick={() => setActiveTab('usuarios')}
              className={`block w-full text-left p-2 rounded ${activeTab === 'usuarios' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
            >
              Gestión Usuarios
            </button>
          </nav>
          <div className="p-4">
            <button onClick={logout} className="w-full bg-red-600 p-2 rounded">Cerrar Sesión</button>
          </div>
        </aside>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8">
        {/* Header simple para Clientes */}
        {!isAdminOrManager && (
          <div className="flex justify-between items-center mb-8 pb-4 border-b">
            <h1 className="text-2xl font-bold">Bienvenido a BetStay</h1>
            <button onClick={logout} className="text-red-600 font-bold">Salir</button>
          </div>
        )}

        {/* VISTA: PERFIL */}
        {activeTab === 'perfil' && (
          <div className="bg-white p-6 rounded shadow max-w-lg">
            <h2 className="text-xl font-bold mb-4">Mis Datos</h2>
            <div className="space-y-2">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Nombre:</strong> {user.firstName} {user.lastName}</p>
              <p><strong>Rol:</strong> <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{user.role}</span></p>
            </div>
          </div>
        )}

        {/* VISTA: GESTIÓN DE USUARIOS (Solo Staff) */}
        {activeTab === 'usuarios' && isAdminOrManager && (
          <UserManagementPanel user={user} />
        )}
      </main>
    </div>
  );
}

// Sub-componente para crear usuarios
function UserManagementPanel({ user }: { user: any }) {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', lastName: '', cedula: '', phone: '', role: 'CLIENT'
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://44.197.107.26:3001/api/users', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(formData),
    });
    
    if (res.ok) {
      alert('Usuario creado con éxito');
      setFormData({ ...formData, email: '' }); // Limpiar un poco
    } else {
      alert('Error al crear usuario');
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-bold mb-4">Registrar Nuevo Usuario</h2>
      <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
        <input placeholder="Email" className="border p-2 rounded" onChange={e => setFormData({...formData, email: e.target.value})} />
        <input placeholder="Password" type="password" className="border p-2 rounded" onChange={e => setFormData({...formData, password: e.target.value})} />
        <input placeholder="Nombre" className="border p-2 rounded" onChange={e => setFormData({...formData, firstName: e.target.value})} />
        <input placeholder="Apellido" className="border p-2 rounded" onChange={e => setFormData({...formData, lastName: e.target.value})} />
        <input placeholder="Cédula" className="border p-2 rounded" onChange={e => setFormData({...formData, cedula: e.target.value})} />
        
        {/* Selector de Rol: Solo ADMIN puede elegir. MANAGER siempre crea CLIENT */}
        {user.role === 'ADMIN' ? (
          <select className="border p-2 rounded bg-gray-50" onChange={e => setFormData({...formData, role: e.target.value})}>
            <option value="CLIENT">CLIENT</option>
            <option value="HOTEL_MANAGER">HOTEL_MANAGER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        ) : (
          <div className="border p-2 rounded bg-gray-200 text-gray-500">Rol: CLIENT (Fijo)</div>
        )}

        <button className="col-span-2 bg-green-600 text-white py-2 rounded font-bold hover:bg-green-700">
          Crear Usuario
        </button>
      </form>
    </div>
  );
}