import React, { useState } from 'react';
import { User, Course } from '../types';
import { GoogleGenAI } from "@google/genai";
import RequestCourseModal from './lecturer/RequestCourseModal';
import StartAttendanceModal, { AttendanceSettings } from './lecturer/StartAttendanceModal';
import AttendanceSession from './lecturer/AttendanceSession';

interface LecturerDashboardProps {
  user: User;
  onLogout: () => void;
  onStartAttendance: (course: Course) => void;
}

const LecturerDashboard: React.FC<LecturerDashboardProps> = ({ user, onLogout, onStartAttendance }) => {
  const [showInsights, setShowInsights] = useState(false);
  const [insightText, setInsightText] = useState<string | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'settings'>('dashboard');
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Attendance Session State
  const [showStartModal, setShowStartModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeSession, setActiveSession] = useState<{course: Course, settings: AttendanceSettings} | null>(null);

  React.useEffect(() => {
    fetchCourses();
  }, [user.id]);

  React.useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/lecturer/history?lecturerId=${user.id}`);
      const data = await res.json();
      if (data.history) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`/api/lecturer/courses?lecturerId=${user.id}`);
      const data = await res.json();
      if (data.courses) {
        const formattedCourses: Course[] = data.courses.map((c: any) => ({
          id: c._id,
          code: c.courseCode,
          name: c.courseName,
          room: c.room || 'NA',
          time: c.time || 'NA',
          imageUrl: `https://source.unsplash.com/random/200x200?education,${encodeURIComponent(c.courseName)}`,
          isActive: true, // You might want to add logic for active state
        }));
        setCourses(formattedCourses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleStartAttendanceClick = (course: Course) => {
    setSelectedCourse(course);
    setShowStartModal(true);
  };

  const handleStartSession = (settings: AttendanceSettings) => {
    if (selectedCourse) {
      setActiveSession({
        course: selectedCourse,
        settings
      });
      setShowStartModal(false);
    }
  };

  const handleEndSession = () => {
    setActiveSession(null);
    setSelectedCourse(null);
  };

  const generateSmartInsights = async () => {
    setIsInsightLoading(true);
    setShowInsights(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "You are an educational data analyst. Given that student attendance is 85% today with a slight drop in the 9:00 AM session, provide a professional, one-paragraph engagement insight for the lecturer. Focus on actionable advice.",
      });
      setInsightText(response.text || "Engagement is steady at 85%. Consider a quick interactive poll in the morning sessions to boost early attendance.");
    } catch (err) {
      setInsightText("Currently analyzing semester data... Overall trends suggest peak engagement between 10am and 2pm.");
    } finally {
      setIsInsightLoading(false);
    }
  };

  if (activeSession) {
    return (
      <AttendanceSession 
        course={activeSession.course}
        settings={activeSession.settings}
        onEndSession={handleEndSession}
      />
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 bg-slate-50 dark:bg-background-dark max-w-lg mx-auto shadow-xl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-50 dark:bg-background-dark px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={user.avatar} className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm" alt="Profile" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Welcome back,</p>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{user.name}</h2>
            </div>
          </div>
          <button onClick={onLogout} className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors">
            <span className="material-symbols-outlined text-xl">logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 space-y-6">
        {activeTab === 'dashboard' && (
        <>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-blue-500 bg-blue-50 w-fit px-2 py-1 rounded-lg">
              <span className="material-symbols-outlined text-lg">school</span>
              <span className="text-[10px] font-bold uppercase tracking-wide">Courses</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{courses.length}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-green-500 bg-green-50 w-fit px-2 py-1 rounded-lg">
              <span className="material-symbols-outlined text-lg">groups</span>
              <span className="text-[10px] font-bold uppercase tracking-wide">Students</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">185</p>
          </div>
        </div>

        {/* Smart AI Section (Preserved) */}
        <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-6 text-white shadow-lg">
          <div className="absolute -top-10 -right-10 size-40 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary animate-pulse">auto_awesome</span>
              <h3 className="text-sm font-black uppercase tracking-widest text-primary/80">Smart Analysis</h3>
            </div>
            
            {showInsights ? (
              <div className="animate-in fade-in duration-700">
                {isInsightLoading ? (
                  <div className="flex items-center gap-3 py-4">
                    <div className="size-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <span className="text-xs text-slate-400 font-medium">Analyzing engagement...</span>
                  </div>
                ) : (
                  <p className="text-sm text-slate-300 leading-relaxed font-medium italic">
                    {insightText}
                  </p>
                )}
                <button 
                  onClick={() => setShowInsights(false)}
                  className="mt-4 text-xs font-bold text-white/40 hover:text-white transition-colors"
                >
                  Close Insights
                </button>
              </div>
            ) : (
              <>
                <h4 className="text-xl font-bold mb-2">View AI Attendance Trends</h4>
                <p className="text-slate-400 text-xs mb-5">Analyze student engagement patterns across your courses.</p>
                <button 
                  onClick={generateSmartInsights}
                  className="bg-primary hover:bg-blue-600 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                  Generate Report
                </button>
              </>
            )}
          </div>
        </div>

        {/* Current Semester Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Current Semester</h3>
            <button className="text-xs font-medium text-primary hover:underline">View Schedule</button>
          </div>

          <div className="space-y-4">
            {loadingCourses ? (
              <div className="flex justify-center py-10">
                <span className="material-symbols-outlined animate-spin text-primary text-3xl">progress_activity</span>
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <p>No courses assigned yet.</p>
                <p className="text-sm">Request a new course below.</p>
              </div>
            ) : (
              courses.map((course) => (
              <div key={course.id} className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm relative overflow-hidden ${course.isActive ? 'border-l-4 border-l-primary' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase rounded">
                        {course.code}
                      </span>
                      {course.isActive && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight max-w-[200px]">{course.name}</h4>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 pt-1">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {course.room}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        {course.time}
                      </div>
                    </div>
                  </div>
                  <img src={course.imageUrl} className="w-16 h-16 rounded-xl object-cover shadow-sm" alt="Course" />
                </div>
                
                <button 
                  onClick={() => handleStartAttendanceClick(course)}
                  className={`w-full flex items-center justify-center gap-2 h-11 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${
                    course.isActive 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-blue-600' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
                  Start Attendance
                </button>
              </div>
            )))}

            {/* Request New Course Button */}
            <button 
              onClick={() => setShowRequestModal(true)}
              className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-white text-slate-400 group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined">add</span>
              </div>
              <span className="text-sm font-medium">Request New Course Assignment</span>
            </button>
          </div>
        </div>
        </>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4 pt-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Attendance History</h3>
            
            {loadingHistory ? (
               <div className="flex justify-center py-20">
                 <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
               </div>
            ) : history.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                 <span className="material-symbols-outlined text-6xl mb-4 text-slate-200">history_edu</span>
                 <p className="font-bold">No history found</p>
                 <p className="text-xs">Past attendance sessions will appear here</p>
               </div>
            ) : (
              history.map((item) => (
                <div key={item.sessionCode} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex flex-col items-center justify-center">
                          <span className="text-xs font-bold uppercase">{new Date(item.timestamp).toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-lg font-black">{new Date(item.timestamp).getDate()}</span>
                      </div>
                      <div>
                          <div className="flex items-center gap-2">
                             <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-500">{item.courseCode}</span>
                             <span className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white mt-1">{item.courseName}</h4>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="text-2xl font-black text-slate-900 dark:text-white">{item.attendees}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Present</div>
                   </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'settings' && (
           <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <span className="material-symbols-outlined text-6xl mb-4 text-slate-200">settings</span>
              <p>Settings coming soon</p>
           </div>
        )}
      </main>

      {/* Start Attendance Modal */}
      {showStartModal && selectedCourse && (
        <StartAttendanceModal
          course={selectedCourse}
          onClose={() => setShowStartModal(false)}
          onStart={handleStartSession}
        />
      )}

      {/* Request Course Modal */}
      {showRequestModal && (
        <RequestCourseModal 
          user={user} 
          onClose={() => setShowRequestModal(false)} 
        />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 pb-safe z-50">
        <div className="flex items-center justify-around h-[70px] max-w-lg mx-auto px-6">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
          >
            <span className={`material-symbols-outlined text-[24px] ${activeTab === 'dashboard' ? 'filled' : ''}`}>grid_view</span>
            <span className="text-[10px] font-bold">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
          >
            <span className={`material-symbols-outlined text-[24px] ${activeTab === 'history' ? 'filled' : ''}`}>history</span>
            <span className="text-[10px] font-medium">History</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
          >
            <span className={`material-symbols-outlined text-[24px] ${activeTab === 'settings' ? 'filled' : ''}`}>settings</span>
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default LecturerDashboard;
