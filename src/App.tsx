import { useState, useEffect, useRef } from 'react';
import Sidebar from './components/layout/Sidebar';
import TripsPage from './pages/TripsPage';
import DashboardPage from './pages/DashboardPage';
import RegistrationPage from './pages/RegistrationPage';
import MedicalProfilePage from './pages/MedicalProfilePage';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import TripDetailPage from './pages/TripDetailPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTrips from './pages/admin/AdminTrips';
import AdminEnrollments from './pages/admin/AdminEnrollments';
import AdminSoapPage from './pages/admin/AdminSoapPage';
import { supabase } from './api/supabase';
import { useOfflineSync } from './hooks/useOfflineSync';
import Logo from './components/common/Logo';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedAdminTripId, setSelectedAdminTripId] = useState<string | null>(null);
  const [selectedSoapEnrollmentId, setSelectedSoapEnrollmentId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isOnline, syncAllAdminData } = useOfflineSync();
  const hasSynced = useRef(false);

  useEffect(() => {
    const fetchProfile = async (sessionUser: any) => {
      if (!sessionUser) {
        setUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .single();

      setUser({ ...sessionUser, profile });
    };

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session?.user ?? null);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchProfile(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Auto-sync admin data when admin user is online
  useEffect(() => {
    if (user?.profile?.role === 'admin' && isOnline && !hasSynced.current) {
      hasSynced.current = true;
      console.log('[App] Admin online — sincronizando datos para uso offline...');
      syncAllAdminData().catch(console.error);
    }
  }, [user, isOnline, syncAllAdminData]);

  const renderContent = () => {
    if (selectedTripId && activeTab !== 'register') {
      return (
        <TripDetailPage
          tripId={selectedTripId}
          onBack={() => setSelectedTripId(null)}
          onRegister={() => {
            setActiveTab('register');
          }}
          user={user}
          isAdmin={user?.profile?.role === 'admin'}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return <HomePage
          onDiscoverClick={() => setActiveTab('trips')}
          onTrekClick={(id) => setSelectedTripId(id)}
          onCreateTrekClick={() => setActiveTab(user?.profile?.role === 'admin' ? 'admin_dashboard' : 'register')}
          user={user}
        />;
      case 'admin_dashboard':
        return user?.profile?.role === 'admin' ? <AdminDashboard onNavigate={setActiveTab} /> : <HomePage />;
      case 'admin_trips':
        return user?.profile?.role === 'admin' ? (
          <AdminTrips
            onViewInscriptos={(id: string) => {
              setSelectedAdminTripId(id);
              setActiveTab('admin_enrollments');
            }}
          />
        ) : <HomePage />;
      case 'admin_enrollments':
        return user?.profile?.role === 'admin' ? (
          <AdminEnrollments
            tripId={selectedAdminTripId || undefined}
            onClearFilter={() => setSelectedAdminTripId(null)}
            onNewSoapReport={(id) => {
              setSelectedSoapEnrollmentId(id);
              setActiveTab('admin_soap');
            }}
          />
        ) : <HomePage />;
      case 'admin_soap':
        return user?.profile?.role === 'admin' && selectedSoapEnrollmentId ? (
          <AdminSoapPage
            enrollmentId={selectedSoapEnrollmentId}
            onBack={() => {
              setSelectedSoapEnrollmentId(null);
              setActiveTab('admin_enrollments');
            }}
          />
        ) : <HomePage />;
      case 'overview':
        return user?.profile?.role === 'admin' ? <AdminDashboard onNavigate={setActiveTab} /> : <DashboardPage />;
      case 'trips':
        return <TripsPage
          onRegister={() => setActiveTab('register')}
          onViewDetails={(id) => setSelectedTripId(id)}
        />;
      case 'register':
        return user ? (
          <RegistrationPage
            userId={user.id}
            tripId={selectedTripId || undefined}
            onComplete={() => {
              setSelectedTripId(null);
              setActiveTab('home');
            }}
          />
        ) : (
          <AuthPage onSuccess={() => setActiveTab('register')} />
        );
      case 'medical':
        return user ? (
          <MedicalProfilePage
            userId={user.id}
            onEdit={() => {
              setSelectedTripId(null);
              setActiveTab('register');
            }}
          />
        ) : (
          <AuthPage onSuccess={() => setActiveTab('medical')} />
        );
      case 'safety':
        return <div className="p-8 text-white uppercase font-black tracking-widest italic">Protocolos de Seguridad (En Construcción)</div>;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white dark:bg-background-dark transition-colors duration-300 z-50">
        <div className="flex items-center gap-4">
          <button
            className="lg:hidden p-2 text-slate-500 hover:text-primary transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <Logo className="h-8" showText={false} onClick={() => setActiveTab('home')} />

          <div className="hidden sm:flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">TrekLogix Precision System</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden lg:flex items-center gap-8">
            {['Inicio', 'Descubrir', 'Ficha Médica'].map((label, idx) => (
              <button
                key={label}
                onClick={() => setActiveTab(['home', 'trips', 'medical'][idx])}
                className={`text-[10px] font-black uppercase tracking-widest transition-all hover:text-primary ${activeTab === ['home', 'trips', 'medical'][idx] ? 'text-primary' : 'text-slate-400'}`}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-400 hover:text-primary cursor-pointer transition-colors">notifications</span>
            <span className="material-symbols-outlined text-slate-400 hover:text-primary cursor-pointer transition-colors" onClick={() => setActiveTab('medical')}>account_circle</span>
          </div>

          {user ? (
            <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4 ml-2">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{user.profile?.full_name || user.user_metadata?.full_name || 'Senderista'}</p>
                <button
                  onClick={() => {
                    supabase.auth.signOut();
                    setActiveTab('home');
                  }}
                  className="text-[10px] text-primary hover:underline font-black uppercase tracking-widest"
                >
                  Cerrar Sesión
                </button>
              </div>
              <div
                className="h-10 w-10 rounded-full bg-cover bg-center border-2 border-primary/40 cursor-pointer"
                onClick={() => setActiveTab('medical')}
                style={{ backgroundImage: user.user_metadata?.avatar_url ? `url(${user.user_metadata.avatar_url})` : "url('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100')" }}
              ></div>
            </div>
          ) : (
            <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4 ml-2">
              <button
                onClick={() => setActiveTab('medical')}
                className="bg-primary text-background-dark px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-primary/20"
              >
                Ingresar
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {!selectedTripId && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={user}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onLogout={() => {
              supabase.auth.signOut();
              setActiveTab('home');
              setSidebarOpen(false);
            }}
          />
        )}

        <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
