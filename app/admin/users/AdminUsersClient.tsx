'use client';

import { useState } from 'react';
import { Search, Shield, User as UserIcon, Mail, Phone, CheckCircle2, MoreHorizontal, Edit2, Plus, X } from 'lucide-react';
import { User } from '@prisma/client';
import { motion } from 'motion/react';
import { getRoleDisplayName } from '@/lib/role-labels';

export default function AdminUsersClient({ initialUsers, userRole }: { initialUsers: User[], userRole: string }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editPriority, setEditPriority] = useState<number>(0);
  const [editRole, setEditRole] = useState<string>('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'CUSTOMER' });
  const [isCreating, setIsCreating] = useState(false);

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        const createdUser = await res.json();
        setUsers([createdUser, ...users]);
        setIsCreateModalOpen(false);
        setNewUser({ name: '', email: '', password: '', role: 'CUSTOMER' });
      } else {
        const data = await res.json();
        alert(data.message || 'Došlo k chybě při vytváření uživatele.');
      }
    } catch (error) {
      console.error(error);
      alert('Došlo k chybě při vytváření uživatele.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveUser = async (userId: string) => {
    try {
      // Save priority
      const resPriority = await fetch(`/api/admin/users/${userId}/priority`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: editPriority }),
      });

      // Save role
      const resRole = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editRole }),
      });

      if (resPriority.ok && resRole.ok) {
        const updatedUser = await resRole.json();
        setUsers(users.map(u => u.id === userId ? { ...u, priority: editPriority, role: editRole } : u));
        setEditingUser(null);
      } else {
        alert('Došlo k chybě při ukládání změn.');
      }
    } catch (error) {
      console.error(error);
      alert('Došlo k chybě při ukládání změn.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Opravdu chcete smazat tohoto uživatele? Tato akce je nevratná.')) return;
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        const data = await res.json();
        alert(data.message || 'Došlo k chybě při mazání uživatele.');
      }
    } catch (error) {
      console.error(error);
      alert('Došlo k chybě při mazání uživatele.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-md flex-1 rounded-xl border border-white/5 bg-[#111] p-3 sm:p-4">
          <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Hledat jméno, email..." 
                  className="w-full rounded-lg border border-white/10 bg-[#1A1A1A] py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 transition-colors focus:border-white/30 focus:outline-none"
              />
          </div>
        </div>
        {userRole === 'ADMIN' && (
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-yellow px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-brand-yellow-hover"
          >
            <Plus className="h-4 w-4" />
            Přidat uživatele
          </button>
        )}
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-xl border border-white/5 bg-[#111]">
        <div className="table-scroll -mx-3 px-3 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-white/5 text-xs font-semibold uppercase text-gray-400">
                    <tr>
                        <th className="px-3 py-3 sm:px-5 sm:py-4">Uživatel</th>
                        <th className="px-3 py-3 sm:px-5 sm:py-4">Role</th>
                        <th className="px-3 py-3 sm:px-5 sm:py-4">Priorita</th>
                        <th className="px-3 py-3 sm:px-5 sm:py-4">Kontakt</th>
                        <th className="px-3 py-3 sm:px-5 sm:py-4">Status</th>
                        <th className="px-3 py-3 sm:px-5 sm:py-4">Registrace</th>
                        <th className="px-3 py-3 text-right sm:px-5 sm:py-4">Akce</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-8 text-center text-gray-500 sm:px-6">
                          Zatím žádní uživatelé.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user, index) => (
                        <motion.tr 
                          key={user.id} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                            <td className="px-3 py-3 sm:px-5 sm:py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-white/10">
                                        <UserIcon className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <span className="font-medium text-white">{user.name || 'Neznámý'}</span>
                                </div>
                            </td>
                            <td className="px-3 py-3 sm:px-5 sm:py-4">
                                {editingUser === user.id ? (
                                  <select 
                                    value={editRole} 
                                    onChange={(e) => setEditRole(e.target.value)}
                                    className="bg-[#1A1A1A] border border-white/10 rounded px-2 py-1 text-white text-xs"
                                  >
                                    <option value="CUSTOMER">Zákazník</option>
                                    <option value="TECHNICIAN">Technik</option>
                                    <option value="COMPANY_ADMIN">Firma</option>
                                    <option value="PRODUCT_MANAGER">Produkt Manager (Realitní makléř)</option>
                                    <option value="REALTY">Produkt Manager (Realitní makléř)</option>
                                    <option value="SVJ">Správce SVJ</option>
                                    <option value="ADMIN">Admin</option>
                                  </select>
                                ) : (
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-500' :
                                      user.role === 'TECHNICIAN' ? 'bg-brand-yellow/10 text-brand-yellow' :
                                      user.role === 'COMPANY_ADMIN' ? 'bg-orange-500/10 text-orange-500' :
                                      user.role === 'REALTY' ? 'bg-blue-500/10 text-blue-500' :
                                      'bg-gray-500/10 text-gray-500'
                                  }`}>
                                      {user.role === 'TECHNICIAN' && <Shield className="w-3 h-3" />}
                                      {getRoleDisplayName(user.role)}
                                  </span>
                                )}
                            </td>
                            <td className="px-3 py-3 sm:px-5 sm:py-4">
                                {editingUser === user.id ? (
                                  <div className="flex items-center gap-2">
                                    <input 
                                      type="number" 
                                      value={editPriority} 
                                      onChange={(e) => setEditPriority(parseInt(e.target.value) || 0)}
                                      className="w-16 bg-[#1A1A1A] border border-white/10 rounded px-2 py-1 text-white text-xs"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <span className="text-white font-mono">{user.priority}</span>
                                  </div>
                                )}
                            </td>
                            <td className="px-3 py-3 text-gray-400 sm:px-5 sm:py-4">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-xs">
                                        <Mail className="w-3 h-3" /> {user.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs">
                                        <Phone className="w-3 h-3" /> {user.phone || 'Nenastaveno'}
                                    </div>
                                </div>
                            </td>
                            <td className="px-3 py-3 sm:px-5 sm:py-4">
                                <span className="flex items-center gap-1.5 text-green-500 text-xs font-medium">
                                    <CheckCircle2 className="w-3 h-3" /> Aktivní
                                </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-xs text-gray-500 sm:px-5 sm:py-4">{new Date(user.createdAt).toLocaleDateString('cs-CZ')}</td>
                            <td className="px-3 py-3 text-right sm:px-5 sm:py-4">
                                {editingUser === user.id ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => handleSaveUser(user.id)} className="text-xs text-brand-yellow hover:underline">Uložit</button>
                                    <button onClick={() => setEditingUser(null)} className="text-xs text-gray-500 hover:underline">Zrušit</button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end gap-2">
                                    {userRole === 'ADMIN' && (
                                      <>
                                        <button onClick={() => { setEditingUser(user.id); setEditPriority(user.priority); setEditRole(user.role); }} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                                            <span className="text-xs font-medium">Smazat</span>
                                        </button>
                                      </>
                                    )}
                                  </div>
                                )}
                            </td>
                        </motion.tr>
                      ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-xl font-bold text-white">Přidat uživatele</h3>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Jméno</label>
                <input 
                  type="text" 
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-yellow/50 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input 
                  type="email" 
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-yellow/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Heslo</label>
                <input 
                  type="password" 
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-yellow/50 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Role</label>
                <select 
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg px-4 py-2 text-white focus:border-brand-yellow/50 outline-none"
                >
                  {[
                    ['CUSTOMER', 'Zákazník'],
                    ['TECHNICIAN', 'Technik'],
                    ['COMPANY_ADMIN', 'Firma'],
                    ['PRODUCT_MANAGER', 'Produkt Manager (Realitní makléř)'],
                    ['REALTY', 'Produkt Manager (Realitní makléř)'],
                    ['SVJ', 'Správce SVJ'],
                    ['ADMIN', 'Admin'],
                    ['SUPPORT', 'Admin'],
                    ['CONTRACTOR', 'Admin'],
                  ].map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Zrušit
                </button>
                <button 
                  type="submit"
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-brand-yellow text-black font-semibold rounded-lg hover:bg-brand-yellow-hover transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Vytvářím...' : 'Vytvořit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
