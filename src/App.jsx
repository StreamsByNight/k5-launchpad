import React, { useState, useEffect } from 'react';
import { CheckSquare, Moon, Sun, Calendar as CalendarIcon, RefreshCw, LogOut, CloudSun, User } from 'lucide-react';
import confetti from 'canvas-confetti';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('canvas_token'));
  const [isDark, setIsDark] = useState(false);
  const [courses, setCourses] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [todos, setTodos] = useState(JSON.parse(localStorage.getItem('tigr_todo_list') || "[]"));
  const [todoInput, setTodoInput] = useState('');
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [weather, setWeather] = useState({ temp: '--', city: 'Loading...' });

  // NEW: State for the grabbed student data
  const [student, setStudent] = useState({
    firstName: "Student",
    email: "Checking Stride...",
    grade: "K5"
  });

  // 1. OAUTH & STUDENT DATA HANDLER
  useEffect(() => {
    // Grab the data saved in index.html by our script
    if (window.studentInfo) {
      setStudent(window.studentInfo);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      setLoading(true);
      fetch('/auth/canvas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      })
      .then(res => res.json())
      .then(data => {
        if (data.access_token) {
          localStorage.setItem('canvas_token', data.access_token);
          setToken(data.access_token);
          window.history.replaceState({}, document.title, "/");
        }
      })
      .catch(err => console.error("Auth swap failed", err))
      .finally(() => setLoading(false));
    }
  }, []);

  // 2. CLOCK & WEATHER LOGIC
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);

    const fetchWeather = async () => {
      try {
        const geoRes = await fetch('https://ipapi.co/json/');
        const geoData = await geoRes.json();
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${geoData.latitude}&longitude=${geoData.longitude}&current_weather=true&temperature_unit=fahrenheit`);
        const weatherData = await weatherRes.json();
        setWeather({ temp: Math.round(weatherData.current_weather.temperature), city: geoData.city });
      } catch (e) { console.error("Weather error"); }
    };

    fetchWeather();
    return () => clearInterval(timer);
  }, []);

  // 3. CANVAS DATA FETCHING
  const fetchCanvasData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`https://stridek12academy.com/api/v1/courses?include[]=enrollments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setCourses(data.filter(c => c.name));
      }

      const eventRes = await fetch(`https://stridek12academy.com/api/v1/planner/items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const eventData = await eventRes.json();
      if (Array.isArray(eventData)) {
        setEvents(eventData.slice(0, 5));
      }
    } catch (e) { console.error("Fetch failed"); }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchCanvasData();
  }, [token]);

  // 4. ACTIONS
  const handleLogin = () => {
    const clientId = '10000000000033';
    const redirectUri = encodeURIComponent(window.location.origin); 
    const canvasUrl = `https://stridek12academy.com/login/oauth2/auth?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}`;
    window.location.href = canvasUrl;
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
      <div className="min-h-screen bg-[#f0f7ff] flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl max-w-md w-full text-center">
          <h1 className="text-5xl font-black text-blue-600 mb-2">k12®</h1>
          <p className="text-slate-500 font-bold mb-8">Launchpad Login</p>
          <button onClick={handleLogin} disabled={loading} className={`w-full ${loading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-black py-4 rounded-2xl shadow-lg transition-all`}>
            {loading ? 'Connecting...' : 'Connect to Classes'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isDark ? 'dark bg-slate-950 text-white' : 'bg-[#f0f7ff] text-slate-900'} min-h-screen p-8 transition-colors duration-500 font-sans`}>
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER WITH STUDENT INFO */}
        <header className="flex justify-between items-start mb-12">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-5xl font-black tracking-tighter text-blue-600 dark:text-white">
                Hi, {student.firstName}! 🦊
              </h1>
              <div className="flex gap-1">
                <button onClick={fetchCanvasData} className="p-2 hover:rotate-180 transition-transform text-slate-400"><RefreshCw size={18} /></button>
                <button onClick={handleLogout} className="p-2 text-red-400 hover:scale-110 transition-transform"><LogOut size={18} /></button>
              </div>
            </div>
            {/* Displaying Grade and Email */}
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
              Grade {student.grade} • {student.email}
            </p>
          </div>
          
          <button onClick={() => setIsDark(!isDark)} className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-white/50">
            {isDark ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-blue-600" />}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* UPCOMING EVENTS */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-xl border border-white/50 dark:border-slate-800">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-orange-500"><CalendarIcon size={20}/> Upcoming</h3>
            <div className="space-y-3">
              {events.length > 0 ? events.map((item, i) => (
                <div key={i} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-800/30">
                  <p className="font-bold text-xs truncate">{item.plannable?.title || "Assignment"}</p>
                  <p className="text-[10px] text-orange-600 font-bold uppercase">{new Date(item.plannable_date).toLocaleDateString()}</p>
                </div>
              )) : <p className="text-xs text-slate-400 font-bold text-center py-4">No events found</p>}
            </div>
          </div>

          {/* CLOCK & WEATHER CARD */}
          <div className="bg-blue-600 rounded-[3rem] p-10 text-white flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
               <CloudSun size={120} />
             </div>
             <div className="text-7xl font-black mb-2 tracking-tighter z-10">{time}</div>
             <div className="bg-white/20 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 z-10 backdrop-blur-sm">
               {weather.city}: {weather.temp}°F
             </div>
          </div>

          {/* TO-DO LIST */}
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 shadow-xl border border-white/50 dark:border-slate-800">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2 text-blue-600"><CheckSquare size={20}/> To-Do</h3>
            <div className="space-y-3 mb-4 max-h-[140px] overflow-y-auto">
              {todos.map((t, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                  <input type="checkbox" onChange={() => {
                    const next = todos.filter((_, idx) => idx !== i);
                    setTodos(next);
                    localStorage.setItem('tigr_todo_list', JSON.stringify(next));
                    confetti({ particleCount: 40, spread: 60, colors: ['#2563eb', '#fbbf24'] });
                  }} className="w-4 h-4 rounded-full border-2 border-blue-500 text-blue-500 focus:ring-blue-500" />
                  <span className="text-xs font-bold">{t}</span>
                </div>
              ))}
            </div>
            <input 
              value={todoInput}
              onChange={(e) => setTodoInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="What's next?" 
              className="w-full bg-slate-100 dark:bg-slate-800 rounded-2xl px-5 py-3 text-xs outline-none border-2 border-transparent focus:border-blue-500 transition-all" 
            />
          </div>
        </div>

        {/* COURSE GRID */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-black">My Classes</h3>
            <span className="bg-blue-100 text-blue-600 px-4 py-1 rounded-full text-xs font-black">{courses.length} Active</span>
          </div>
          
          {loading && courses.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
              {[1,2,3,4].map(i => <div key={i} className="h-56 bg-slate-200 dark:bg-slate-800 rounded-[2.5rem]"></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map(course => {
                const enrollment = course.enrollments?.[0] || {};
                const score = enrollment.computed_current_score || 0;
                return (
                  <div key={course.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-white/50 dark:border-slate-800 flex flex-col justify-between hover:translate-y-[-5px] transition-all group">
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">📚</div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase">Grade</p>
                          <p className="text-lg font-black text-blue-600">{score}%</p>
                        </div>
                      </div>
                      <h4 className="font-black text-sm mb-2 leading-tight h-10 overflow-hidden line-clamp-2">{course.name}</h4>
                    </div>
                    <a href={`https://stridek12academy.com/courses/${course.id}`} target="_blank" rel="noreferrer" className="w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase text-center tracking-widest shadow-lg hover:bg-blue-700 transition-all mt-4">Go to Class</a>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default App;
