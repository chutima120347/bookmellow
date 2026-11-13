import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import Home from './pages/Home';
import Explore from './pages/Explore';
import BookDetail from './pages/BookDetail';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import Recommendations from './pages/Recommendations';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import Favorites from './pages/Favorites';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageBooks from './pages/ManageBooks';
import AdminMembers from './pages/admin/AdminMembers';
import RequireRole from './components/RequireRole';

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
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route
            path="/admin"
            element={
              <RequireRole role="admin">
                <AdminDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/admin/manage-books"
            element={
              <RequireRole role="admin">
                <ManageBooks />
              </RequireRole>
            }
          />
          <Route
            path="/admin/members"
            element={
              <RequireRole role="admin">
                <AdminMembers />
              </RequireRole>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;