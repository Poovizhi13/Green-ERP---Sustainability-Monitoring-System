import React, { useState } from 'react';
import { 
  Users as UsersIcon, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  UserPlus, 
  X, 
  Search,
  MoreVertical,
  Mail,
  Shield,
  UserCheck
} from 'lucide-react';
import { User, UserRole } from '../types';

interface UsersProps {
  users: User[];
  currentUser: User | null;
  onDeleteUser: (user: User) => void;
  onCreateUser: (username: string, role: UserRole) => Promise<void>;
}

const Users: React.FC<UsersProps> = ({ users, currentUser, onDeleteUser, onCreateUser }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<UserRole>(UserRole.PROCUREMENT_MANAGER);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onCreateUser(newUsername, newRole);
      setShowModal(false);
      setNewUsername('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: UserRole) => {
    switch(role) {
      case UserRole.ADMIN:
        return <span className="px-3 py-1 rounded-md bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 text-xs font-black uppercase tracking-widest border border-rose-500/10 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Admin</span>;
      case UserRole.SUSTAINABILITY_MANAGER:
        return <span className="px-3 py-1 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-black uppercase tracking-widest border border-emerald-500/10 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Sustainability</span>;
      default:
        return <span className="px-3 py-1 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-black uppercase tracking-widest border border-blue-500/10 flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5" /> Procurement</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Personnel Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-bold tracking-tight">Control system access and organizational roles.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-slate-900 dark:bg-emerald-600 text-white px-6 py-3 rounded-xl font-black hover:opacity-90 transition-all shadow-lg shadow-slate-900/10 dark:shadow-emerald-500/20 flex items-center gap-2 text-xs uppercase tracking-widest"
        >
          <UserPlus className="w-5 h-5" /> Add User
        </button>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search personnel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 pl-12 pr-5 py-3 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest">
            <UsersIcon className="w-4 h-4" /> {users.length} Total
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-xs uppercase font-black tracking-widest border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-8 py-5">User Profile</th>
                <th className="px-8 py-5">System Role</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-emerald-600 dark:text-emerald-400 text-base">
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                          {u.username}
                          {u.id === currentUser?.id && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-400 uppercase tracking-widest font-black">You</span>}
                        </div>
                        <div className="text-xs font-bold text-slate-400 flex items-center gap-2 mt-1">
                          <Mail className="w-3.5 h-3.5" /> {u.username.toLowerCase()}@green-erp.com
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center">
                      {getRoleBadge(u.role)}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Active</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onDeleteUser(u)} 
                        disabled={u.id === currentUser?.id}
                        className="p-2.5 text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create System User</h3>
              <button onClick={() => setShowModal(false)} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">User Name</label>
                <input 
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-base text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-black" 
                  placeholder="e.g. Rahul" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">System Role</label>
                <select 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  required 
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-base text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-black"
                >
                  <option value={UserRole.PROCUREMENT_MANAGER}>Procurement Manager</option>
                  <option value={UserRole.SUSTAINABILITY_MANAGER}>Sustainability Manager</option>
                  <option value={UserRole.ADMIN}>Administrator</option>
                </select>
              </div>
              
              <div className="flex gap-5 mt-12">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50">
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
