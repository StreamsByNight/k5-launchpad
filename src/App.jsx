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

  // --- LOGIC: DATA FETCHING ---
  const fetchCanvasData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      // 1. Fetch Courses (Crucial: include[]=course_image)
      const courseRes = await fetch(`https://stridek12academy.com/api/v1/courses?include[]=enrollments&include[]=teachers&include[]=course_image&state[]=available&per_page=12`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const courseData = await courseRes.json();
      const validCourses = Array.isArray(courseData) ? courseData.filter(c => c.name) : [];
      setCourses(validCourses);

      // 2. Fetch Planner Items (Agenda)
      const eventRes = await fetch(`https://stridek12academy.com/api/v1/planner/items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const eventData = await eventRes.json();
      setEvents(Array.isArray(eventData) ? eventData : []);

      // 3. Fetch News/Announcements
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
    <div className="bg-[#d9f1fd] min-h-screen flex font-sans text-slate-900 selection:bg-blue-200">
      
      {/* SIDE NAVIGATION */}
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
            className={`p-5 rounded-[2rem] transition-all duration-300 ${activeTab === item.id ? 'bg-white text-blue-600 shadow-xl scale-110' : 'text-blue-200 hover:text-white hover:bg-blue-500'}`}
          >
            {item.icon}
          </button>
        ))}
        <button onClick={logout} className="mt-auto p-5 text-blue-300 hover:text-red-300 transition-colors">
          <LogOut size={28} />
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-5xl font-black text-blue-900 mb-2">My Dashboard</h2>
            <div className="flex items-center gap-3">
              <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-tighter">Live Sync</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-7xl font-black text-blue-600 leading-none">{time}</div>
            <p className="font-black text-blue-900/40 uppercase tracking-widest mt-2">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
        </header>

        {/* TAB: COURSES */}
        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {courses.length > 0 ? courses.map(course => {
              const score = Math.round(course.enrollments?.[0]?.computed_current_score || 0);
              const courseImg = course.image_download_url || "https://via.placeholder.com/400x200?text=Stride+K12";

              return (
                <div key={course.id} className="group bg-white rounded-[3.5rem] shadow-xl overflow-hidden hover:shadow-2xl transition-all border border-white">
                  <div 
                    className="h-48 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${courseImg})` }}
                  >
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                    <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-5 py-3 rounded-[1.5rem] shadow-xl text-center min-w-[80px]">
                      <p className="text-[10px] font-black uppercase opacity-40 mb-1">Score</p>
                      <p className="text-2xl font-black text-blue-600">{score}%</p>
                    </div>
                  </div>

                  <div className="p-10">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                        {course.course_code || 'Class'}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black leading-tight h-16 overflow-hidden line-clamp-2 mb-8">{course.name}</h3>
                    <button 
                      onClick={() => window.open(`https://stridek12academy.com/courses/${course.id}`, '_blank')}
                      className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:bg-blue-600 transition-colors shadow-lg"
                    >
                      Enter Classroom
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full py-32 text-center opacity-40">
                <RefreshCw size={60} className="mx-auto mb-6 animate-spin" />
                <p className="text-2xl font-black tracking-widest uppercase">Syncing your classes...</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: AGENDA */}
        {activeTab === 'agenda' && (
          <div className="max-w-4xl space-y-6 animate-in zoom-in-95 duration-300">
            <h3 className="text-4xl font-black mb-10 flex items-center gap-4 text-blue-900">
              <CalendarIcon size={40} className="text-blue-600"/> Upcoming Lessons
            </h3>
            {events.length > 0 ? events.map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] shadow-md flex justify-between items-center border-l-[16px] border-orange-400 hover:bg-orange-50 transition-colors cursor-pointer" onClick={() => window.open('https://stridek12academy.com/calendar', '_blank')}>
                <div>
                  <p className="text-2xl font-black text-slate-800 mb-1">{item.plannable?.title}</p>
                  <p className="font-bold text-orange-600 uppercase tracking-widest text-xs">
                    {item.plannable_date ? new Date(item.plannable_date).toLocaleDateString() : 'Upcoming'}
                  </p>
                </div>
                <BookOpen className="text-orange-400" size={32} />
              </div>
            )) : (
              <div className="bg-white p-20 rounded-[4rem] text-center shadow-xl">
                <PartyPopper size={100} className="mx-auto text-blue-500 mb-8" />
                <p className="text-3xl font-black text-slate-400">All done! No lessons today.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB: NEWS */}
        {activeTab === 'news' && (
          <div className="max-w-4xl space-y-8 animate-in slide-in-from-right-8 duration-500">
            <h3 className="text-4xl font-black mb-10 text-blue-900">School Updates</h3>
            {announcements.length > 0 ? announcements.map((news, i) => (
              <div key={i} className="bg-white p-12 rounded-[4rem] shadow-xl border-t-8 border-purple-500">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                    <Megaphone size={32} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-purple-900">{news.title}</h4>
                    <p className="font-bold opacity-40 text-sm italic">From: {news.author?.display_name}</p>
                  </div>
                </div>
                <div className="text-lg leading-relaxed text-slate-600 mb-8 line-clamp-3" dangerouslySetInnerHTML={{ __html: news.message }} />
                <button 
                  onClick={() => window.open(`https://stridek12academy.com/courses/${news.context_id}/announcements/${news.id}`, '_blank')}
                  className="bg-purple-50 text-purple-600 px-8 py-3 rounded-2xl font-black uppercase text-xs hover:bg-purple-600 hover:text-white transition-all"
                >
                  Read More
                </button>
              </div>
            )) : (
              <div className="bg-white p-20 rounded-[4rem] text-center shadow-xl">
                 <AlertCircle size={80} className="mx-auto text-slate-200 mb-6" />
                 <p className="text-2xl font-black text-slate-300 uppercase tracking-widest">No new news items</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
