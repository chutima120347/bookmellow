import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ books: 0, members: 0, admins: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูลสถิติภาพรวมจาก Backend (GET /api/admin/dashboard)
  useEffect(() => {
    async function fetchAdminStats() {
      try {
        setIsLoading(true);
        try {
          const statsRes = await apiRequest('/api/admin/dashboard');
          const s = statsRes?.data || statsRes;
          setStats({
            books: s?.books ?? 0,
            members: s?.members ?? 0,
            admins: s?.admins ?? 0,
          });
        } catch {
          // กรณี Backend ยังไม่มี route /api/admin/dashboard ให้คำนวณจากรายการหนังสือและสมาชิกแทน
          const booksRes = await apiRequest('/api/books');
          const booksList = Array.isArray(booksRes) ? booksRes : (booksRes?.data || booksRes?.books || []);
          
          let membersList = [];
          try {
            const membersRes = await apiRequest('/api/admin/members');
            membersList = Array.isArray(membersRes) ? membersRes : (membersRes?.data || membersRes?.members || []);
          } catch {
            membersList = [];
          }

          setStats({
            books: booksList.length,
            members: membersList.filter((m) => m.role !== 'admin').length,
            admins: membersList.filter((m) => m.role === 'admin').length,
          });
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAdminStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2A26] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 sm:px-8 py-12 space-y-10">
        
        {/* ส่วนหัว Admin Dashboard และปุ่ม + จัดการหนังสือ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#1E1C1A]">
              Admin Dashboard
            </h1>
            <p className="text-sm text-[#7A756E]">
              ภาพรวมและจัดการระบบ BookMellow
            </p>
          </div>

          <button
            onClick={() => navigate('/admin/manage-books')}
            className="px-6 py-3 bg-[#232129] hover:bg-[#36333F] text-white rounded-xl text-xs sm:text-sm font-medium shadow-sm transition inline-flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <span>+</span>
            <span>จัดการหนังสือ</span>
          </button>
        </div>

        {/* การ์ดสถิติ 3 ช่อง ตามแบบในรูป */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* การ์ดที่ 1: หนังสือทั้งหมด */}
          <div className="bg-[#F3EFE8]/80 border border-[#E6E0D6] rounded-2xl p-6 sm:p-7 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <p className="text-xs font-medium text-[#7A756E]">
              หนังสือทั้งหมด
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-[#1E1C1A]">
              {isLoading ? '...' : stats.books}
            </p>
          </div>

          {/* การ์ดที่ 2: สมาชิกทั้งหมด */}
          <div className="bg-[#F3EFE8]/80 border border-[#E6E0D6] rounded-2xl p-6 sm:p-7 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <p className="text-xs font-medium text-[#7A756E]">
              สมาชิกทั้งหมด
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-[#1E1C1A]">
              {isLoading ? '...' : stats.members}
            </p>
          </div>

          {/* การ์ดที่ 3: ผู้ดูแลระบบ */}
          <div className="bg-[#F3EFE8]/80 border border-[#E6E0D6] rounded-2xl p-6 sm:p-7 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <p className="text-xs font-medium text-[#7A756E]">
              ผู้ดูแลระบบ
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-[#1E1C1A]">
              {isLoading ? '...' : stats.admins}
            </p>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}

export default AdminDashboard;