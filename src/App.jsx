import React, { useState, useEffect } from 'react';
import { CheckSquare, Moon, Sun, Calendar as CalendarIcon, RefreshCw, LogOut, CloudSun, Megaphone, Mail, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('canvas_token'));
  const [isDark, setIsDark] = useState(false);
  const [courses, setCourses] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [todos, setTodos] = useState(JSON.parse(localStorage.getItem('tigr_todo_list') || "[]"));
  const [todoInput, setTodoInput] = useState('');
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [weather, setWeather] = useState({ temp: '--', city: 'Loading...' });

  const [student, setStudent] = useState(window.studentInfo || {
    firstName: "Student",
    email: "Checking Stride...",
    grade: "K5"
  });

  // 1. DATA FETCHING (Courses, Agenda, Announcements)
  const fetchCanvasData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Fetch Courses with Teacher info
      const courseRes = await fetch(`https://stridek12academy.com/api/v1/courses?include[]=enrollments&include[]=teachers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const courseData = await courseRes.json();
      const activeCourses = Array.isArray(courseData) ? courseData.filter(c => c.name) : [];
      setCourses(activeCourses);

      // Fetch Agenda (Planner)
      const eventRes = await fetch(`https://stridek12academy.com/api/v1/planner/items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const eventData = await eventRes.json();
      if (Array.isArray(eventData)) setEvents(eventData.slice(0, 6));

      // Fetch Announcements for all courses
      if (activeCourses.length > 0) {
        const codes = activeCourses.map(c => `course_${c.id}`).join(',');
        const announceRes = await fetch(`https://stridek12academy.com/api/v1/announcements?context_codes[]=${codes.replace(/,/g, '&context_codes[]=')}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const announceData = await announceRes.json();
        if (Array.isArray(announceData)) setAnnouncements(announceData.slice(0, 4));
      }
    } catch (e) { console.error("Fetch failed", e); }
    setLoading(false);
  };

  useEffect(() => {
    if (window.studentInfo) setStudent(window.studentInfo);
    if (token) fetchCanvasData();
  }, [token]);

  // 2. CLOCK & WEATHER
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. AUTH ACTIONS
  const handleLogin = () => {
    const clientId = '10000000000033';
    const redirectUri = encodeURIComponent(window.location.origin); 
    window.location.href = `https://stridek12academy.com/login/oauth2/auth?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('canvas_token');
    setToken(null);
  };

  const addTodo = () => {
    if (!todoInput.trim()) return;
    const newTodos = [...todos, todoInput];
    setTodos(newTodos);
    localStorage.setItem('tigr_todo_list', JSON.stringify(newTodos));
    setTodoInput('');
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#f0f7ff] flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center">
          <h1 className="text-5xl font-black text-blue-600 mb-2">k12®</h1>
          <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg mt-8">Connect to Classes</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'dark bg-slate-950 text-white' : 'bg-[#f0f7ff] text-slate-900'} min-h-screen p-8 transition-colors duration-500 font-sans`}>
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex justify-between items-start mb-10">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-blue-600 dark:text-white">Hi, {student.firstName}! 🦊</h1>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">Grade {student.grade} • {student.email}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchCanvasData} className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-lg text-slate-400 hover:rotate-180 transition-transform"><RefreshCw size={20}/></button>
            <button onClick={() => setIsDark(!isDark)} className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-white/50">{isDark ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-blue-600" />}</button>
            <button onClick={handleLogout} className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-lg text-red-400"><LogOut size={20}/></button>
          </div>
        </header>

        {/* TOP ROW: CLOCK & WEATHER */}
        <div className="mb-10 bg-blue-600 rounded-[3rem] p-10 text-white flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
             <div className="text-8xl font-black tracking-tighter z-10">{time}</div>
             <div className="bg-white/20 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 mt-4 z-10 backdrop-blur-sm">
               <CloudSun size={18}/> {weather.city}: {weather.temp}°F
             </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* 1. AGENDA / PLANNER */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-xl border border-white/50 dark:border-slate-800">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-orange-500"><CalendarIcon size={20}/> My Agenda</h3>
            <div className="space-y-3">
              {events.length > 0 ? events.map((item, i) => (
                <div key={i} className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border-l-4 border-orange-400">
                  <p className="font-bold text-xs truncate">{item.plannable?.title}</p>
                  <p className="text-[10px] text-orange-600 font-bold uppercase">{new Date(item.plannable_date).toLocaleDateString()}</p>
                </div>
              )) : <p className="text-xs text-slate-400 font-bold text-center py-4">All caught up!</p>}
            </div>
          </div>

          {/* 2. ANNOUNCEMENTS */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-xl border border-white/50 dark:border-slate-800">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-purple-500"><Megaphone size={20}/> School News</h3>
            <div className="space-y-3">
              {announcements.map((news, i) => (
                <div key={i} className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl">
                  <p className="font-bold text-xs line-clamp-1">{news.title}</p>
                  <p className="text-[10px] opacity-60 mt-1 line-clamp-2">Click to read more in Canvas</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. TEACHER EMAILS */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-xl border border-white/50 dark:border-slate-800">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-green-500"><Mail size={20}/> Teachers</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {courses.map((course, i) => {
                const teacher = course.teachers?.[0];
                return (
                  <div key={i} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-2xl">
                    <div className="overflow-hidden">
                      <p className="text-[10px] font-black text-green-700 uppercase truncate">{course.course_code || 'Class'}</p>
                      <p className="text-xs font-bold truncate">{teacher?.display_name || "Primary Teacher"}</p>
                    </div>
                    <a href={`mailto:${teacher?.email || ''}`} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-green-600 hover:scale-110 transition-transform">
                      <Mail size={16}/>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ACTIVE COURSES */}
        <section>
          <h3 className="text-3xl font-black mb-8 flex items-center gap-3"><BookOpen className="text-blue-600"/> Active Classes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map(course => {
                const enrollment = course.enrollments?.[0] || {};
                return (
                  <div key={course.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-white/50 dark:border-slate-800 flex flex-col justify-between hover:translate-y-[-5px] transition-all group">
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📖</div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase">Grade</p>
                          <p className="text-lg font-black text-blue-600">{enrollment.computed_current_score || 0}%</p>
                        </div>
                      </div>
                      <h4 className="font-black text-sm mb-2 leading-tight h-10 overflow-hidden line-clamp-2">{course.name}</h4>
                    </div>
                    <a href={`https://stridek12academy.com/courses/${course.id}`} target="_blank" rel="noreferrer" className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase text-center tracking-widest shadow-lg hover:bg-blue-700 transition-all mt-4">Go to Class</a>
                  </div>
                );
              })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default App;
