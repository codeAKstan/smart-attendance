import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import AddLecturerModal from './AddLecturerModal';

interface AdminHomeProps {
  user: User;
}

const AdminHome: React.FC<AdminHomeProps> = ({ user }) => {
  const [showAddLecturer, setShowAddLecturer] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{email: string, password: string} | null>(null);
  const [stats, setStats] = useState({
    students: 0,
    lecturers: 0,
    courses: 0,
    checkins: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      const data = await res.json();
      if (data.stats) setStats(data.stats);
      if (data.recentActivity) setRecentActivity(data.recentActivity);
      if (data.chartData) setChartData(data.chartData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    console.log('Action clicked:', action);
    if (action === 'Add Lecturer') {
      setShowAddLecturer(true);
    }
  };

  const handleLecturerCreated = (credentials: {email: string, password: string}) => {
    setShowAddLecturer(false);
    setCreatedCredentials(credentials);
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 relative">
      {/* Success Notification Modal */}
      {createdCredentials && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Lecturer Account Created!</h2>
              <p className="text-slate-500 mt-2">
                An email has been sent to the lecturer with these login details:
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-xl mb-6">
              <div className="flex flex-col gap-2">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold">Email</span>
                  <p className="font-medium text-slate-900 dark:text-white select-all">{createdCredentials.email}</p>
                </div>
                <div className="h-px bg-slate-200 dark:bg-slate-600 my-1"></div>
                {/* <div>
                  <span className="text-xs text-slate-400 uppercase font-bold">Password</span>
                  <p className="font-mono font-medium text-slate-900 dark:text-white select-all">{createdCredentials.password}</p>
                </div> */}
              </div>
            </div>

            <button 
              onClick={() => setCreatedCredentials(null)}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Add Lecturer Modal */}
      {showAddLecturer && (
        <AddLecturerModal 
          onClose={() => setShowAddLecturer(false)} 
          onSuccess={handleLecturerCreated}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <button className="p-2 -ml-2 text-slate-900 dark:text-white">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <div className="h-9 w-9 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
          <img 
            src={user.avatar || "https://ui-avatars.com/api/?name=Admin&background=random"} 
            alt="Profile" 
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, Admin</h2>
        <p className="text-slate-500 dark:text-slate-400">Here's what's happening in your institution today.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: 'qr_code_scanner', label: 'Gen QR', color: 'bg-blue-100 text-blue-600' },
          { icon: 'person_add', label: 'Add Lecturer', color: 'bg-indigo-100 text-indigo-600' },
          { icon: 'description', label: 'Reports', color: 'bg-green-100 text-green-600' },
          { icon: 'settings', label: 'Settings', color: 'bg-orange-100 text-orange-600' },
        ].map((action, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center gap-2 cursor-pointer group"
            onClick={() => handleActionClick(action.label)}
          >
            <button 
              type="button"
              className={`h-14 w-14 rounded-full flex items-center justify-center ${action.color} group-hover:opacity-80 transition-opacity pointer-events-none`}
            >
              <span className="material-symbols-outlined">{action.icon}</span>
            </button>
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors">{action.label}</span>
          </div>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Total Students', value: loading ? '...' : stats.students.toString(), trend: '+2%', trendColor: 'text-green-600 bg-green-100', icon: 'school', iconColor: 'text-blue-600 bg-blue-50' },
          { label: 'Lecturers', value: loading ? '...' : stats.lecturers.toString(), trend: '0%', trendColor: 'text-slate-600 bg-slate-100', icon: 'cast_for_education', iconColor: 'text-purple-600 bg-purple-50' },
          { label: 'Active Courses', value: loading ? '...' : stats.courses.toString(), trend: '~5%', trendColor: 'text-green-600 bg-green-100', icon: 'book', iconColor: 'text-orange-600 bg-orange-50' },
          { label: 'Check-ins', value: loading ? '...' : stats.checkins.toString(), trend: '~12%', trendColor: 'text-green-600 bg-green-100', icon: 'check_circle', iconColor: 'text-green-600 bg-green-50' },
        ].map((stat, index) => (
          <div key={index} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-lg ${stat.iconColor}`}>
                <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
              </div>
              {/* <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${stat.trendColor}`}>{stat.trend}</span> */}
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Attendance Overview Chart Placeholder */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Attendance Overview</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Weekly average</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-blue-500">92%</p>
            <p className="text-xs font-medium text-green-500">+4.5% vs last week</p>
          </div>
        </div>
        
        {/* Simple SVG Chart */}
        <div className="h-32 w-full flex items-end justify-between gap-1 mt-2">
            <svg viewBox="0 0 300 100" className="w-full h-full overflow-visible">
                <path 
                    d="M0,80 C20,70 40,30 60,40 C80,50 100,80 120,60 C140,40 160,50 180,45 C200,40 220,90 240,85 C260,80 280,20 300,40" 
                    fill="none" 
                    stroke="#3b82f6" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    className="drop-shadow-sm"
                />
                <path 
                    d="M0,80 C20,70 40,30 60,40 C80,50 100,80 120,60 C140,40 160,50 180,45 C200,40 220,90 240,85 C260,80 280,20 300,40 V150 H0 Z" 
                    fill="url(#gradient)" 
                    opacity="0.2"
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400 font-medium uppercase">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="flex flex-col gap-3">
            {recentActivity.length === 0 ? (
                <p className="text-slate-500 text-sm">No recent activity.</p>
            ) : (
                recentActivity.map((item, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm flex gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-green-100 text-green-600`}>
                        <span className="material-symbols-outlined text-[20px]">person_check</span>
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                            <span className="text-xs text-slate-400">{new Date(item.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                    </div>
                </div>
            )))}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
