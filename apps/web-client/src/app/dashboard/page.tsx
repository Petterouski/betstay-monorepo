'use client';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://44.197.107.26:3001/api';

export default function Dashboard() {
  const { user, logout, token, login } = useAuth();
  const [activeTab, setActiveTab] = useState('perfil');

  if (!user) return <div className="p-10 text-center font-bold text-gray-600">Cargando sesión...</div>;

  const isStaff = user.role === 'ADMIN' || user.role === 'HOTEL_MANAGER';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0 transition-all duration-300">
        <div className="p-6 font-bold text-xl border-b border-gray-700 tracking-wide">
          BetStay <span className="text-xs font-normal text-gray-400 block mt-1">{user.role}</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('perfil')}
            className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'perfil' ? 'bg-blue-600 shadow-lg' : 'hover:bg-gray-800'}`}>
            <span>👤</span> Mi Perfil
          </button>
          
          {!isStaff && (
            <button disabled className="w-full text-left p-3 rounded flex items-center gap-3 text-gray-500 cursor-not-allowed hover:bg-gray-800/50">
              <span>🎲</span> Apuestas (Próximamente)
            </button>
          )}

          {isStaff && (
            <button onClick={() => setActiveTab('usuarios')}
              className={`w-full text-left p-3 rounded flex items-center gap-3 transition-colors ${activeTab === 'usuarios' ? 'bg-blue-600 shadow-lg' : 'hover:bg-gray-800'}`}>
              <span>👥</span> Gestión Usuarios
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={logout} className="w-full bg-red-600/90 text-white p-2 rounded hover:bg-red-700 transition font-medium text-sm">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto h-screen bg-gray-50">
        <header className="mb-8 border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            {activeTab === 'perfil' ? 'Mi Perfil' : 'Gestión de Usuarios'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeTab === 'perfil' ? 'Gestiona tu información personal' : 'Administra el directorio de usuarios del sistema'}
          </p>
        </header>

        {activeTab === 'perfil' && <ProfileView user={user} token={token} updateContextUser={login} />}
        {activeTab === 'usuarios' && isStaff && <UserManagementView currentUser={user} token={token} />}
      </main>
    </div>
  );
}

// ==========================================
// VISTA DE PERFIL (PATCH /users/me) - YA FUNCIONA BIEN
// ==========================================
function ProfileView({ user, token, updateContextUser }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    firstName: user.firstName, 
    lastName: user.lastName, 
    cedula: user.cedula, 
    phone: user.phone 
  });

  const handleSave = async () => {
    try {
      // Payload limpio para PATCH
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      };

      const res = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Error actualizando perfil');
      }

      const updatedUser = await res.json();
      updateContextUser(token, updatedUser); 
      alert("Perfil actualizado correctamente");
      setIsEditing(false);
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-gray-700">Información Personal</h2>
        <button onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`px-6 py-2.5 rounded-lg font-bold text-white shadow transition transform active:scale-95 ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {isEditing ? '💾 Guardar Cambios' : '✏️ Editar Información'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <Field label="Nombre" name="firstName" val={formData.firstName} edit={isEditing} set={setFormData} data={formData} />
        <Field label="Apellido" name="lastName" val={formData.lastName} edit={isEditing} set={setFormData} data={formData} />
        {/* Campos bloqueados visualmente */}
        <Field label="Cédula" name="cedula" val={formData.cedula} edit={false} set={setFormData} data={formData} locked={true} />
        <Field label="Teléfono" name="phone" val={formData.phone} edit={isEditing} set={setFormData} data={formData} />
        
        <div className="col-span-1 md:col-span-2 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center">
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Correo Electrónico</span>
            <span className="text-gray-700 font-medium">{user.email}</span>
          </div>
          <div>
            <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Rol de Usuario</span>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-1 ${
                user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
                user.role === 'HOTEL_MANAGER' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {user.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper para inputs con label
const Field = ({ label, name, val, edit, set, data, locked }: any) => (
  <div className="flex flex-col">
    <label className="text-sm font-bold text-gray-700 mb-1.5 flex items-center justify-between">
      {label}
      {locked && <span className="text-[10px] text-gray-400 font-normal bg-gray-100 px-1.5 rounded">NO EDITABLE</span>}
    </label>
    {edit && !locked ? (
      <input 
        className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
        value={val || ''} 
        onChange={e => set({...data, [name]: e.target.value})}
      />
    ) : (
      <div className={`p-2.5 rounded-lg border ${locked || !edit ? 'bg-gray-50 border-gray-200 text-gray-600' : 'bg-white border-transparent'}`}>
        {val || <span className="italic text-gray-400">No registrado</span>}
      </div>
    )}
  </div>
);

// ==========================================
// GESTIÓN DE USUARIOS (CRUD + FIX DE EDIT)
// ==========================================
function UserManagementView({ currentUser, token }: any) {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialFormState = { firstName: '', lastName: '', email: '', password: '', cedula: '', phone: '', role: 'CLIENT' };
  const [formData, setFormData] = useState(initialFormState);

  // Cargar usuarios
  const fetchUsers = () => {
    fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
        else if (data.data && Array.isArray(data.data)) setUsers(data.data);
        else setUsers([]);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchUsers(); }, [token]);

  // Manejar Guardado (Crear o Editar)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = isEditingMode ? `${API_URL}/users/${editingId}` : `${API_URL}/users`;
    const method = isEditingMode ? 'PUT' : 'POST';

    try {
      let bodyData;

      if (isEditingMode) {
        // --- LÓGICA DE ACTUALIZACIÓN (PUT) ---
        // Solo enviamos lo que se permite editar.
        // OJO: Si eres admin y quieres cambiar el rol, lo incluimos. Si no, no.
        bodyData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            role: currentUser.role === 'ADMIN' ? formData.role : undefined, // Solo Admin cambia roles
            // NO enviamos email, password ni cedula en el update para evitar conflictos
        };
      } else {
        // --- LÓGICA DE CREACIÓN (POST) ---
        bodyData = formData;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(bodyData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Error en la operación');
      }

      alert(isEditingMode ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
      fetchUsers();
      resetForm();
    } catch (err: any) { 
      alert("Error: " + err.message); 
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("¿Estás seguro de desactivar/eliminar este usuario?")) return;
    try {
      const res = await fetch(`${API_URL}/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if(res.ok) {
        alert("Usuario eliminado");
        fetchUsers();
      } else {
        alert("Error al eliminar");
      }
    } catch(e) { console.error(e); }
  };

  const startEdit = (user: any) => {
    setIsEditingMode(true);
    setEditingId(user.id);
    setFormData({
      firstName: user.firstName, lastName: user.lastName, email: user.email,
      password: '', // Password vacío al editar
      cedula: user.cedula || '', phone: user.phone || '', role: user.role
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditingMode(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  // Filtrado Frontend
  const filteredUsers = users.filter(u => 
    (u.cedula?.includes(search) || 
    u.firstName?.toLowerCase().includes(search.toLowerCase()) || 
    u.lastName?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-10">
      {/* FORMULARIO UNIFICADO (MEJORADO) */}
      <div className={`bg-white p-6 rounded-xl shadow-sm border-t-4 transition-all ${isEditingMode ? 'border-orange-500 ring-1 ring-orange-100' : 'border-green-500'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            {isEditingMode ? <span className="text-orange-600 text-xl">✏️</span> : <span className="text-green-600 text-xl">✨</span>}
            {isEditingMode ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
          </h3>
          {isEditingMode && (
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-bold">Modo Edición</span>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Campos con Labels explícitos */}
          <div className="form-group">
            <label className="text-sm font-bold text-gray-700 block mb-1">Nombre</label>
            <input className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="Ej. Juan" />
          </div>
          
          <div className="form-group">
            <label className="text-sm font-bold text-gray-700 block mb-1">Apellido</label>
            <input className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Ej. Pérez" />
          </div>

          <div className="form-group">
            <label className="text-sm font-bold text-gray-700 block mb-1">Cédula {isEditingMode && <span className="text-xs text-gray-400">(Bloqueado)</span>}</label>
            <input className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isEditingMode ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} 
              required disabled={isEditingMode} // Cédula inmutable en edición
              value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value})} placeholder="Ej. 1720..." />
          </div>

          <div className="form-group">
            <label className="text-sm font-bold text-gray-700 block mb-1">Teléfono</label>
            <input className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Ej. 099..." />
          </div>

          <div className="form-group">
            <label className="text-sm font-bold text-gray-700 block mb-1">Email {isEditingMode && <span className="text-xs text-gray-400">(Bloqueado)</span>}</label>
            <input type="email" className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isEditingMode ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`} 
              required disabled={isEditingMode} // Email inmutable en edición
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="correo@ejemplo.com" />
          </div>

          <div className="form-group">
            <label className="text-sm font-bold text-gray-700 block mb-1">Contraseña {isEditingMode && <span className="text-xs text-gray-400 font-normal">(Dejar vacío para no cambiar)</span>}</label>
            <input type="password" className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${isEditingMode ? 'bg-yellow-50' : ''}`} 
              required={!isEditingMode} 
              value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="******" />
          </div>
          
          <div className="form-group md:col-span-2">
            <label className="text-sm font-bold text-gray-700 block mb-1">Rol de Usuario</label>
            {currentUser.role === 'ADMIN' ? (
              <select className="w-full border p-2.5 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="CLIENT">CLIENT (Cliente)</option>
                <option value="HOTEL_MANAGER">HOTEL_MANAGER (Gerente)</option>
                <option value="ADMIN">ADMIN (Administrador)</option>
              </select>
            ) : (
              <div className="w-full border p-2.5 rounded-lg bg-gray-100 text-gray-500 flex items-center gap-2">
                🔒 Rol fijo: <span className="font-bold text-gray-700">CLIENT</span>
              </div>
            )}
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-4 flex gap-4 mt-2 border-t pt-4">
            <button className={`flex-1 text-white font-bold py-3 px-6 rounded-lg shadow transition transform active:scale-95 flex justify-center items-center gap-2 ${isEditingMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'}`}>
              {isEditingMode ? '💾 Actualizar Usuario' : '➕ Crear Usuario'}
            </button>
            
            {isEditingMode && (
              <button type="button" onClick={resetForm} 
                className="flex-none bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-300 transition flex items-center gap-2">
                🚫 Cancelar Edición
              </button>
            )}
          </div>
        </form>
      </div>

      {/* LISTA DE USUARIOS */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h3 className="text-lg font-bold text-gray-800">Directorio de Usuarios ({filteredUsers.length})</h3>
          <div className="relative w-full md:w-80">
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            <input 
              placeholder="Buscar por Cédula, Nombre..." 
              className="border p-2 pl-10 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none"
              value={search} onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-100">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b">
              <tr>
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Identificación</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => {
                const canEdit = currentUser.role === 'ADMIN' || (currentUser.role === 'HOTEL_MANAGER' && u.role === 'CLIENT');
                const isMe = u.id === currentUser.id;
                
                return (
                  <tr key={u.id} className="border-b hover:bg-gray-50 transition bg-white">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{u.firstName} {u.lastName}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600 bg-gray-50 w-fit rounded px-2 py-1">
                      {u.cedula || 'S/N'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{u.email}</div>
                      {u.phone && <div className="text-xs text-blue-600 font-medium mt-0.5">📞 {u.phone}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        u.role === 'HOTEL_MANAGER' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {!isMe && canEdit ? (
                        <div className="flex justify-center gap-3">
                          <button onClick={() => startEdit(u)} className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase hover:underline">
                            Editar
                          </button>
                          <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase hover:underline">
                            Eliminar
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs italic">{isMe ? 'Tu Usuario' : 'Bloqueado'}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400 bg-gray-50">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}