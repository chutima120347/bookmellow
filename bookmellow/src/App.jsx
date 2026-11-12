import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Explore from './pages/Explore';
import BookDetail from './pages/BookDetail';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import Recommendations from './pages/Recommendations';
import Auth from './pages/Auth';
import Favorites from './pages/Favorites';
import AdminDashboard from './pages/AdminDashboard';
import ManageBooks from './pages/ManageBooks';
import AdminMembers from './pages/AdminMembers';

function Forbidden403() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#4A2B1D] flex flex-col justify-between font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center space-y-4">
        <div className="text-6xl font-extrabold text-[#8C533A]">403</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1E1C1A]">
          ไม่มีสิทธิ์เข้าถึง
        </h1>
        <p className="text-xs sm:text-sm text-[#7A756E] max-w-md">
          ขออภัย หน้านี้สงวนสิทธิ์ไว้สำหรับผู้ดูแลระบบ (Admin) เท่านั้น คุณไม่มีสิทธิ์เข้าถึงเนื้อหาในส่วนนี้
        </p>
        <div className="pt-2">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-[#8C533A] hover:bg-[#633A27] text-white rounded-full text-xs sm:text-sm font-semibold transition shadow-sm"
          >
            กลับสู่หน้าหลัก
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function AdminRoute({ children }) {
  const { user, isLoggedIn, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isLoggedIn || !user?.isAdmin) {
    return <Forbidden403 />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/interests" element={<Onboarding />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/favorites" element={<Favorites />} />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/manage-books"
            element={
              <AdminRoute>
                <ManageBooks />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/members"
            element={
              <AdminRoute>
                <AdminMembers />
          </AdminRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;