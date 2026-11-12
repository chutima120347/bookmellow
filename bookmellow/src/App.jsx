import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import Home from './pages/Home';
import Explore from './pages/Explore';
import BookDetail from './pages/BookDetail';
import Favorites from './pages/Favorites';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ManageBooks from './pages/ManageBooks';

// ตัวป้องกันสิทธิ์เข้าหน้า Admin
function AdminRoute({ children }) {
  const { user, isLoggedIn, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isLoggedIn || !user?.isAdmin) {
    return <Navigate to="/" replace />;
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
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* หน้าสำหรับ Admin เท่านั้น */}
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
        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;