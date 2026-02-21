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
import AdminNewsPage from './pages/admin/AdminNewsPage';
import UniversityPage from './pages/UniversityPage';
import UniversityNewsPage from './pages/UniversityNewsPage';
import { supabase } from './api/supabase';
import { useOfflineSync } from './hooks/useOfflineSync';
import Navbar from './components/layout/Navbar';
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
        // Try to restore from cache if offline
        const cachedSessionUser = localStorage.getItem('cached_session_user');
        if (cachedSessionUser) {
          const restoredUser = JSON.parse(cachedSessionUser);
          const cachedProfile = localStorage.getItem('cached_user_profile');
          const profile = cachedProfile ? JSON.parse(cachedProfile) : null;
          console.log('[App] Session null — restoring from cache:', restoredUser.email, 'role:', profile?.role);
          setUser({ ...restoredUser, profile });
        } else {
          setUser(null);
        }
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .single();

        if (error) throw error;

        // Cache profile AND session user to localStorage for offline use
        if (profile) {
          localStorage.setItem('cached_user_profile', JSON.stringify(profile));
          localStorage.setItem('cached_session_user', JSON.stringify(sessionUser));
        }
        setUser({ ...sessionUser, profile });
      } catch {
        // Offline or fetch failed — use cached profile
        const cachedProfile = localStorage.getItem('cached_user_profile');
        const profile = cachedProfile ? JSON.parse(cachedProfile) : null;
        console.log('[App] Using cached profile (offline):', profile?.role);
        setUser({ ...sessionUser, profile });
      }
    };

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchProfile(session?.user ?? null);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_OUT') {
        localStorage.removeItem('cached_session_user');
        localStorage.removeItem('cached_user_profile');
        setUser(null);
        return;
      }
      if (session?.user) {
        fetchProfile(session.user);
      }
      // If no session but not signed out, preserve current user (offline)
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
      case 'admin_news':
        return user?.profile?.role === 'admin' ? <AdminNewsPage onBack={() => setActiveTab('admin_dashboard')} /> : <HomePage />;
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
            onTripChange={(id) => setSelectedAdminTripId(id)}
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
      case 'university':
        return <UniversityPage onNavigateNews={() => setActiveTab('university_news')} />;
      case 'university_news':
        return <UniversityNewsPage onBack={() => setActiveTab('university')} />;
      case 'safety':
        return <div className="p-8 text-white uppercase font-black tracking-widest italic">Protocolos de Seguridad (En Construcción)</div>;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onMenuClick={() => setSidebarOpen(true)}
        onBack={activeTab !== 'home' ? () => {
          if (selectedTripId) {
            setSelectedTripId(null);
            if (activeTab === 'register') return;
          }

          if (activeTab === 'admin_soap') {
            setSelectedSoapEnrollmentId(null);
            setActiveTab('admin_enrollments');
            return;
          }

          if (activeTab === 'admin_enrollments') {
            setActiveTab('admin_trips');
            return;
          }

          if (activeTab === 'admin_trips') {
            setActiveTab('admin_dashboard');
            return;
          }

          if (activeTab === 'register' || activeTab === 'medical' || activeTab === 'university' || activeTab === 'university_news' || activeTab === 'admin_news') {
            setActiveTab('home');
            return;
          }

          setActiveTab('home');
        } : undefined}
      />

      <div className="flex flex-1 overflow-hidden">
        {!selectedTripId && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            user={user}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onLogout={() => {
              localStorage.removeItem('cached_session_user');
              localStorage.removeItem('cached_user_profile');
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
