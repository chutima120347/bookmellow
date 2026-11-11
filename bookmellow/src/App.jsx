import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Explore from './pages/Explore';
import BookDetail from './pages/BookDetail';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import Auth from './pages/Auth';
import Favorites from './pages/Favorites';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/book/:id" element={<BookDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route 
          path="/admin" 
          element={
            <div className="min-h-screen bg-[#FFFDF9] p-8 text-center text-slate-700">
              <h1 className="text-2xl font-bold">🛠️ ระบบหลังบ้าน (Admin Dashboard)</h1>
              <p className="mt-2 text-sm text-slate-500">กำลังอยู่ระหว่างการพัฒนา...</p>
            </div>
          } 
        />
      </Routes>
    </Router>
  );
}
export default App;