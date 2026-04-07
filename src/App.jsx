import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  RefreshCw, 
  LogOut, 
  CloudSun, 
  Megaphone, 
  Mail, 
  PartyPopper, 
  LayoutDashboard, 
  BookOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('canvas_token'));
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // --- LOGIC: DATA FETCHING (Now including course_image) ---
  const fetchCanvasData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Added 'include[]=course_image' to the query parameters
      const courseRes = await fetch(`https://stridek12academy.com/api/v1/courses?include[]=enrollments&include[]=teachers&include[]=course_image&state[]=available&per_page=12`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const courseData = await courseRes.json();
      const validCourses = Array.isArray(courseData) ? courseData.filter(c => c.name) : [];
      setCourses(validCourses);

      const eventRes = await fetch(`https://stridek12academy.com/api/v1/planner/items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const eventData = await eventRes.json();
      setEvents(Array.isArray(eventData) ? eventData : []);

      if (validCourses.length > 0) {
        const codes = validCourses.slice(0, 5).map(c => `course_${c.id}`).join(',');
        const announceRes = await fetch(`https://stridek12academy.com/api/v1/announcements?context_codes[]=${codes.replace(/,/g, '&context_codes[]=')}&active_only=true`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const announceData = await announceRes.json();
        setAnnouncements(Array.isArray(announceData) ? announceData : []);
      }
    } catch (e) {
      console.error("Stride API Sync Error:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchCanvasData();
    const clock = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 30000);
    return () => clearInterval(clock);
  }, [token]);

  const handleLogin = () => {
    const clientId = '10000000000033';
    window.location.href = `https://stridek12academy.com/login/oauth2/auth?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(window.location.origin)}`;
  };

  const logout = () => {
    localStorage.removeItem('canvas_token');
    window.location.reload();
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#f0f7ff] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-12 rounded-[4rem] shadow-2xl max-w-sm w-full border-b-[12px] border-blue-600">
           <h1 className="text-7xl font-black text-blue-600 mb-4">K12</h1>
           <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-lg shadow-lg hover:scale-105 transition-transform">
             START LEARNING
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#d9f1fd] min-h-screen flex font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <nav className="w-28 bg-blue-600 flex flex-col items-center py-10 gap-8 shadow-2xl z-20">
        <div className="text-white font-black text-3xl mb-12 italic">k12</div>
        {[
          { id: 'courses', icon: <LayoutDashboard size={32}/> },
          { id: 'agenda', icon: <CalendarIcon size={32}/> },
          { id: 'news', icon: <Megaphone size={32}/> }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`p-5 rounded-[2rem] transition-all ${activeTab === item.id ? 'bg-white text-blue-600' : 'text-blue-200'}`}
          >
            {item.icon}
          </button>
        ))}
        <button onClick={logout} className="mt-auto p-5 text-blue-300">
          <LogOut size={28} />
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-end mb-12">
          <h2 className="text-5xl font-black text-blue-900">My Dashboard</h2>
          <div className="text-right">
            <div className="text-7xl font-black text-blue-600">{time}</div>
          </div>
        </header>

        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => {
              const score = Math.round(course.enrollments?.[0]?.computed_current_score || 0);
              // Official course image URL from Stride API
              const courseImg = course.image_download_url || "https://via.placeholder.com/400x200?text=Course+Image";

              return (
                <div key={course.id} className="group bg-white rounded-[3.5rem] shadow-xl overflow-hidden hover:shadow-2xl transition-all border border-white">
                  
                  {/* TOP IMAGE SECTION (MATCHES SCREENSHOT) */}
                  <div 
                    className="h-48 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${courseImg})` }}
                  >
                    <div className="absolute inset-0 bg-black/10" />
                    {/* Floating Score Badge */}
                    <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-5 py-3 rounded-[1.5rem] shadow-xl text-center min-w-[80px]">
                      <p className="text-[10px] font-black uppercase opacity-40 leading-none mb-1">Score</p>
                      <p className="text-2xl font-black text-blue-600">{score}%</p>
                    </div>
                  </div>

                  {/* BOTTOM INFO SECTION */}
                  <div className="p-10">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                            {course.course_code || 'Stride K12'}
                        </span>
                    </div>
                    <h3 className="text-2xl font-black leading-tight h-16 overflow-hidden line-clamp-2 mb-8">
                      {course.name}
                    </h3>
                    
                    <button 
                      onClick={() => window.open(`https://stridek12academy.com/courses/${course.id}`, '_blank')}
                      className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-colors shadow-lg"
                    >
                      Enter Classroom
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* AGENDA & NEWS RENDER (Same as previous, omitted for brevity but should be included) */}
        {/* ... (rest of your tab logic) ... */}
      </main>
    </div>
  );
};

export default App;
