import React, { useState, useEffect } from 'react';
import { UserRole } from '../../types';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

const AdminUsers: React.FC = () => {
  const [filter, setFilter] = useState<'ALL' | UserRole>('ALL');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'ALL' || user.role === filter;
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || 
                          user.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case UserRole.LECTURER: return 'bg-purple-100 text-purple-600';
      case UserRole.STUDENT: return 'bg-blue-100 text-blue-600';
      case UserRole.ADMIN: return 'bg-slate-100 text-slate-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatRole = (role: UserRole) => {
    return role.charAt(0) + role.slice(1).toLowerCase();
  }

  return (
    <div className="flex flex-col h-full bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-slate-800 shadow-sm z-10 sticky top-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">User Management</h1>
          <button className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors">
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 dark:bg-slate-700 border-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { label: 'All Users', value: 'ALL' },
            { label: 'Students', value: UserRole.STUDENT },
            { label: 'Lecturers', value: UserRole.LECTURER },
            { label: 'Admins', value: UserRole.ADMIN },
          ].map((f) => (
            <button
              key={f.label}
              onClick={() => setFilter(f.value as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f.value 
                  ? 'bg-primary text-white' 
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* User List */}
      <div className="p-4 flex flex-col gap-3 pb-24 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-10">
            <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
          </div>
        ) : (
          <>
            {filteredUsers.map(user => (
              <div key={user.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm flex items-center gap-4 relative overflow-hidden group">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="h-12 w-12 rounded-full object-cover border border-slate-100 dark:border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{user.name}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getRoleBadgeStyle(user.role)}`}>
                      {formatRole(user.role)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                </div>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
                <p>No users found</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
