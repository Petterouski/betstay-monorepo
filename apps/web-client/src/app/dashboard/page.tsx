'use client';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://44.197.107.26:3001/api';

export default function Dashboard() {
  const { user, logout, token, login } = useAuth(); // Importamos login para actualizar estado local si editamos perfil propio
  const [activeTab, setActiveTab] = useState('perfil');

  if (!user) return <div className="p-10 text-center font-bold text-gray-600">Cargando sesión...</div>;

  const isStaff = user.role === 'ADMIN' || user.role === 'HOTEL_MANAGER';

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR UNIFICADO (Visible para todos los roles) */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col shrink-0 transition-all">
        <div className="p-6 font-bold text-xl border-b border-gray-700 tracking-wide">
          BetStay <span className="text-xs font-normal text-gray-400 block">{user.role}</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {/* Menú Común */}
          <button onClick={() => setActiveTab('perfil')}
            className={`w-full text-left p-3 rounded flex items-center gap-2 ${activeTab === 'perfil' ? 'bg-blue-600 shadow-lg' : 'hover:bg-gray-800'}`}>
            👤 Mi Perfil
          </button>

          {/* Menú Solo Clientes */}
          {!isStaff && (
            <button disabled className="w-full text-left p-3 rounded flex items-center gap-2 hover:bg-gray-800 text-gray-400 cursor-not-allowed">
              🎲 Apuestas (Próximamente)
            </button>
          )}

          {/* Menú Solo Staff */}
          {isStaff && (
            <button onClick={() => setActiveTab('usuarios')}
              className={`w-full text-left p-3 rounded flex items-center gap-2 ${activeTab === 'usuarios' ? 'bg-blue-600 shadow-lg' : 'hover:bg-gray-800'}`}>
              👥 Gestión Usuarios
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={logout} className="w-full bg-red-600/90 text-white p-2 rounded hover:bg-red-700 transition font-medium">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        {/* Header Móvil / Título */}
        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            {activeTab === 'perfil' ? 'Mi Perfil' : 'Gestión de Usuarios'}
          </h1>
        </div>

        {activeTab === 'perfil' && <ProfileView user={user} token={token} updateContextUser={login} />}
        {activeTab === 'usuarios' && isStaff && <UserManagementView currentUser={user} token={token} />}
      </main>
    </div>
  );
}

// ==========================================
// COMPONENTE 1: VISTA DE PERFIL (PATCH /me)
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
      // Usamos PATCH /users/me
      const res = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Error actualizando perfil');

      const updatedUser = await res.json();
      
      // Actualizamos el contexto global (localStorage y estado) sin cambiar el token
      // Nota: updatedUser debe contener el objeto completo del usuario
      updateContextUser(token, updatedUser); 
      
      alert("Perfil actualizado correctamente");
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-700">Información Personal</h2>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`px-6 py-2 rounded-lg font-bold transition ${isEditing ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
        >
          {isEditing ? 'Guardar Cambios' : 'Editar Información'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        <Field label="Nombre" name="firstName" val={formData.firstName} edit={isEditing} set={setFormData} data={formData} />
        <Field label="Apellido" name="lastName" val={formData.lastName} edit={isEditing} set={setFormData} data={formData} />
        <Field label="Cédula" name="cedula" val={formData.cedula} edit={isEditing} set={setFormData} data={formData} />
        <Field label="Teléfono" name="phone" val={formData.phone} edit={isEditing} set={setFormData} data={formData} />
        
        <div className="col-span-1 md:col-span-2 p-4 bg-gray-50 rounded-lg border border-gray-100 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase">Email (Inmutable)</label>
              <div className="text-gray-700 font-medium">{user.email}</div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase">Rol Actual</label>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mt-1 ${
                user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
                user.role === 'HOTEL_MANAGER' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Field = ({ label, name, val, edit, set, data }: any) => (
  <div>
    <label className="block text-sm font-bold text-gray-700 mb-1">{label}</label>
    {edit ? (
      <input 
        className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
        value={val || ''} 
        onChange={e => set({...data, [name]: e.target.value})}
      />
    ) : (
      <div className={`p-2.5 rounded-lg border border-transparent ${val ? 'text-gray-800' : 'text-gray-400 italic bg-gray-50'}`}>
        {val || 'No registrado'}
      </div>
    )}
  </div>
);

// ==========================================
// COMPONENTE 2: GESTIÓN DE USUARIOS (CRUD)
// ==========================================
function UserManagementView({ currentUser, token }: any) {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  // Estado para el formulario (Crear o Editar)
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialFormState = { 
    firstName: '', lastName: '', email: '', password: '', cedula: '', phone: '', role: 'CLIENT' 
  };
  const [formData, setFormData] = useState(initialFormState);

  // 1. Cargar usuarios (GET /users)
  const fetchUsers = () => {
    fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : [])) // Manejo seguro si devuelve paginación
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // 2. Manejar Submit (Crear POST o Editar PUT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const url = isEditingMode ? `${API_URL}/users/${editingId}` : `${API_URL}/users`;
    const method = isEditingMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Error en la operación');
      }

      alert(isEditingMode ? 'Usuario actualizado (PUT)' : 'Usuario creado (POST)');
      fetchUsers(); // Recargar tabla
      resetForm();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 3. Eliminar Usuario (DELETE /users/:id)
  const handleDelete = async (id: string) => {
    if(!confirm("¿Estás seguro de desactivar este usuario?")) return;
    
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        alert("Usuario eliminado correctamente");
        fetchUsers();
      } else {
        alert("Error al eliminar");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 4. Preparar edición
  const startEdit = (user: any) => {
    setIsEditingMode(true);
    setEditingId(user.id);
    // Rellenamos el form con los datos del usuario seleccionado
    // Nota: El password no se suele traer del back, lo dejamos vacío. Si el back lo requiere obligatorio en PUT, habría que gestionarlo.
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '', // Dejar vacío para no cambiar, o manejar lógica de cambio de pass
      cedula: user.cedula || '',
      phone: user.phone || '',
      role: user.role
    });
    // Scroll hacia el formulario
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
    <div className="space-y-8">
      {/* FORMULARIO UNIFICADO (CREAR / EDITAR) */}
      <div className={`bg-white p-6 rounded-lg shadow-sm border-l-4 ${isEditingMode ? 'border-orange-500' : 'border-green-500'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            {isEditingMode ? '✏️ Editando Usuario' : '✨ Registrar Nuevo Usuario'}
          </h3>
          {isEditingMode && (
            <button onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-700 underline">
              Cancelar edición
            </button>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input placeholder="Nombre" className="border p-2 rounded" required 
            value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
          
          <input placeholder="Apellido" className="border p-2 rounded" required 
            value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
          
          <input placeholder="Cédula" className="border p-2 rounded" required 
            value={formData.cedula} onChange={e => setFormData({...formData, cedula: e.target.value})} />
          
          <input placeholder="Teléfono" className="border p-2 rounded" required 
            value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          
          <input placeholder="Email" type="email" className="border p-2 rounded" required 
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          
          <input placeholder={isEditingMode ? "Nueva Contraseña (Opcional)" : "Contraseña"} 
            type="password" className="border p-2 rounded" 
            required={!isEditingMode} // Obligatorio solo al crear
            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          
          {/* Lógica de Roles en Select */}
          {currentUser.role === 'ADMIN' ? (
            <select className="border p-2 rounded bg-white" 
              value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="CLIENT">CLIENT</option>
              <option value="HOTEL_MANAGER">HOTEL_MANAGER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          ) : (
            <div className="border p-2 rounded bg-gray-100 text-gray-500 flex items-center px-3 text-sm">
              Rol forzado: CLIENT
            </div>
          )}

          <button className={`font-bold p-2 rounded text-white shadow-md transition transform active:scale-95 md:col-span-1 ${isEditingMode ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'}`}>
            {isEditingMode ? 'Actualizar Usuario' : 'Crear Usuario'}
          </button>
        </form>
      </div>

      {/* LISTA DE USUARIOS */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h3 className="text-lg font-bold text-gray-800">Directorio de Usuarios</h3>
          <input 
            placeholder="🔍 Buscar por Cédula o Nombre..." 
            className="border p-2 rounded-lg w-full md:w-72 focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3">Usuario</th>
                <th className="px-6 py-3">Identificación</th>
                <th className="px-6 py-3">Contacto</th>
                <th className="px-6 py-3">Rol</th>
                <th className="px-6 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isMe = u.id === currentUser.id;
                // REGLAS DE NEGOCIO VISUALES:
                // Admin puede editar a todos menos a sí mismo.
                // Manager solo puede editar CLIENTS.
                const canEdit = currentUser.role === 'ADMIN' || (currentUser.role === 'HOTEL_MANAGER' && u.role === 'CLIENT');
                
                return (
                  <tr key={u.id} className="bg-white border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {u.firstName} {u.lastName}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{u.cedula || 'S/N'}</td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{u.email}</div>
                      <div className="text-xs text-blue-500">{u.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        u.role === 'HOTEL_MANAGER' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center space-x-3">
                      {isMe ? (
                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">TÚ</span>
                      ) : canEdit ? (
                        <>
                          <button onClick={() => startEdit(u)} className="text-blue-600 hover:text-blue-900 font-medium text-xs uppercase tracking-wide">
                            Editar
                          </button>
                          <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900 font-medium text-xs uppercase tracking-wide">
                            Eliminar
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-300 text-xs">🔒</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No se encontraron resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-xs text-gray-400 text-right">
          Mostrando {filteredUsers.length} registros
        </div>
      </div>
    </div>
  );
}