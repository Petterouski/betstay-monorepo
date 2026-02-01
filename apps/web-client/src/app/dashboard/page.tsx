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
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="p-6 font-bold text-xl border-b border-gray-700">
          BetStay <span className="text-xs font-normal text-gray-400 block">{user.role}</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('perfil')}
            className={`w-full text-left p-3 rounded flex gap-2 ${activeTab === 'perfil' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
            👤 Mi Perfil
          </button>
          
          {!isStaff && (
            <button disabled className="w-full text-left p-3 rounded flex gap-2 text-gray-500 cursor-not-allowed">
              🎲 Apuestas (Próximamente)
            </button>
          )}

          {isStaff && (
            <button onClick={() => setActiveTab('usuarios')}
              className={`w-full text-left p-3 rounded flex gap-2 ${activeTab === 'usuarios' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}>
              👥 Gestión Usuarios
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={logout} className="w-full bg-red-600 p-2 rounded hover:bg-red-700 font-bold">Cerrar Sesión</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b pb-4">
          {activeTab === 'perfil' ? 'Mi Perfil' : 'Gestión de Usuarios'}
        </h1>

        {activeTab === 'perfil' && <ProfileView user={user} token={token} updateContextUser={login} />}
        {activeTab === 'usuarios' && isStaff && <UserManagementView currentUser={user} token={token} />}
      </main>
    </div>
  );
}

// ==========================================
// VISTA DE PERFIL (PATCH /users/me)
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
      // FIX 1: Solo enviamos los campos permitidos
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
        // NO enviamos ni cedula, ni email, ni role
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
    <div className="bg-white p-8 rounded-xl shadow border max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-700">Información Personal</h2>
        <button onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`px-6 py-2 rounded font-bold text-white ${isEditing ? 'bg-green-600' : 'bg-blue-600'}`}>
          {isEditing ? 'Guardar' : 'Editar'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Nombre" name="firstName" val={formData.firstName} edit={isEditing} set={setFormData} data={formData} />
        <Field label="Apellido" name="lastName" val={formData.lastName} edit={isEditing} set={setFormData} data={formData} />
        {/* Cédula NO editable */}
        <Field label="Cédula (No editable)" name="cedula" val={formData.cedula} edit={false} set={setFormData} data={formData} />
        <Field label="Teléfono" name="phone" val={formData.phone} edit={isEditing} set={setFormData} data={formData} />
        
        <div className="col-span-2 text-gray-500 text-sm mt-4 bg-gray-50 p-4 rounded">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Rol:</strong> {user.role}</p>
        </div>
      </div>
    </div>
  );
}

const Field = ({ label, name, val, edit, set, data }: any) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
    {edit ? (
      <input className="w-full border p-2 rounded" value={val || ''} onChange={e => set({...data, [name]: e.target.value})} />
    ) : (
      <div className="p-2 bg-gray-50 rounded text-gray-800 border border-transparent">{val || 'No registrado'}</div>
    )}
  </div>
);

// ==========================================
// GESTIÓN DE USUARIOS (CRUD + Paginación Fix)
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
        // FIX 2: Manejo de Paginación (NestJS suele devolver { data: [], meta: ... })
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data.data && Array.isArray(data.data)) {
          setUsers(data.data);
        } else {
          setUsers([]);
        }
      })
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchUsers(); }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEditingMode ? `${API_URL}/users/${editingId}` : `${API_URL}/users`;
    const method = isEditingMode ? 'PUT' : 'POST'; // Back pide PUT para editar admin

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Error en la operación');

      alert(isEditingMode ? 'Usuario actualizado' : 'Usuario creado');
      fetchUsers();
      resetForm();
    } catch (err: any) { alert(err.message); }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("¿Desactivar usuario?")) return;
    await fetch(`${API_URL}/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchUsers();
  };

  const startEdit = (user: any) => {
    setIsEditingMode(true);
    setEditingId(user.id);
    setFormData({
      firstName: user.firstName, lastName: user.lastName, email: user.email,
      password: '', cedula: user.cedula || '', phone: user.phone || '', role: user.role
    });
  };

  const resetForm = () => {
    setIsEditingMode(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  // Filtrado en Frontend (sobre los datos cargados)
  const filteredUsers = users.filter(u => 
    (u.cedula?.includes(search) || 
    u.firstName?.toLowerCase().includes(search.toLowerCase()) || 
    u.lastName?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* FORMULARIO */}
      <div className={`bg-white p-6 rounded shadow border-l-4 ${isEditingMode ? 'border-orange-500' : 'border-green-500'}`}>
        <h3 className="font-bold mb-4">{isEditingMode ? '✏️ Editando Usuario' : '✨ Nuevo Usuario'}</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <input placeholder="Nombre" className="border p-2 rounded" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
          <input placeholder="Apellido" className="border p-2 rounded" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
          <input placeholder="Cédula" className="border p-2 rounded" required value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value})} />
          <input placeholder="Teléfono" className="border p-2 rounded" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          <input placeholder="Email" type="email" className="border p-2 rounded" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <input placeholder={isEditingMode ? "Pass (Opcional)" : "Password"} type="password" className="border p-2 rounded" required={!isEditingMode} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          
          {currentUser.role === 'ADMIN' ? (
            <select className="border p-2 rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="CLIENT">CLIENT</option>
              <option value="HOTEL_MANAGER">HOTEL_MANAGER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          ) : (
            <div className="border p-2 rounded bg-gray-100 flex items-center justify-center text-gray-500 text-sm">Rol: CLIENT</div>
          )}

          <div className="col-span-2 md:col-span-1 flex gap-2">
            <button className={`flex-1 text-white font-bold p-2 rounded ${isEditingMode ? 'bg-orange-500' : 'bg-green-600'}`}>
              {isEditingMode ? 'Actualizar' : 'Crear'}
            </button>
            {isEditingMode && <button type="button" onClick={resetForm} className="bg-gray-300 px-3 rounded">X</button>}
          </div>
        </form>
      </div>

      {/* LISTA */}
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold">Directorio ({filteredUsers.length})</h3>
          <input placeholder="Buscar por Cédula..." className="border p-2 rounded w-64" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Cédula</th>
              <th className="px-4 py-2">Contacto</th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => {
              const canEdit = currentUser.role === 'ADMIN' || (currentUser.role === 'HOTEL_MANAGER' && u.role === 'CLIENT');
              const isMe = u.id === currentUser.id;
              return (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-3">{u.cedula}</td>
                  <td className="px-4 py-3">{u.email}<br/><span className="text-xs text-blue-500">{u.phone}</span></td>
                  <td className="px-4 py-3"><span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-0.5 rounded">{u.role}</span></td>
                  <td className="px-4 py-3">
                    {!isMe && canEdit ? (
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(u)} className="text-blue-600 hover:underline">Editar</button>
                        <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:underline">Eliminar</button>
                      </div>
                    ) : <span className="text-gray-300">-</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}