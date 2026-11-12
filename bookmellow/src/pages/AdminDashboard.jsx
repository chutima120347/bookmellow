import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../services/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState({ books: 0, members: 0, admins: 0 });
  const [usersList, setUsersList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // ดึงข้อมูลหนังสือและสมาชิกทั้งหมด
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // 1. ดึงข้อมูลหนังสือเพื่อแสดงจำนวน
      const booksRes = await apiRequest('/api/books');
      const booksData = Array.isArray(booksRes) ? booksRes : (booksRes?.data || booksRes?.books || []);

      // 2. ดึงรายชื่อสมาชิกทั้งหมดจาก Backend
      let membersData = [];
      try {
        const membersRes = await apiRequest('/api/admin/members');
        membersData = Array.isArray(membersRes) ? membersRes : (membersRes?.data || membersRes?.members || []);
      } catch {
        // สำรองเผื่อ Backend ใช้ endpoint /api/users
        const usersRes = await apiRequest('/api/users');
        membersData = Array.isArray(usersRes) ? usersRes : (usersRes?.data || usersRes?.users || []);
      }

      setUsersList(membersData);

      // คำนวณตัวเลขสถิติ
      const adminCount = membersData.filter(
        (m) => String(m.role || '').toLowerCase() === 'admin' || m.isAdmin === true || m.is_admin === 1
      ).length;
      const memberCount = membersData.length - adminCount;

      setStats({
        books: booksData.length,
        members: memberCount,
        admins: adminCount,
      });
    } catch (err) {
      console.error('โหลดข้อมูลแดชบอร์ดไม่สำเร็จ:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ฟังก์ชันเปลี่ยนสิทธิ์ Member <-> Admin
  const handleToggleRole = async (targetUser) => {
    const currentIsAdmin =
      String(targetUser.role || '').toLowerCase() === 'admin' ||
      targetUser.isAdmin === true ||
      targetUser.is_admin === 1;

    const newRole = currentIsAdmin ? 'member' : 'admin';
    const actionText = currentIsAdmin
      ? `ลดสิทธิ์ "${targetUser.username || targetUser.email}" เป็น Member ทั่วไป`
      : `เลื่อนสิทธิ์ "${targetUser.username || targetUser.email}" เป็น Admin`;

    if (!window.confirm(`คุณต้องการ${actionText} ใช่หรือไม่?`)) return;

    try {
      setUpdatingId(targetUser.id);

      // เรียก API อัปเดตสิทธิ์ (รองรับรูปแบบเส้นทางมาตรฐานของระบบ)
      try {
        await apiRequest(`/api/admin/members/${targetUser.id}/role`, {
          method: 'PATCH',
          body: JSON.stringify({ role: newRole }),
        });
      } catch {
        await apiRequest(`/api/admin/members/${targetUser.id}`, {
          method: 'PUT',
          body: JSON.stringify({ role: newRole }),
        });
      }

      // อัปเดต State ในหน้าจอทันที
      const updatedUsers = usersList.map((u) =>
        u.id === targetUser.id ? { ...u, role: newRole, isAdmin: newRole === 'admin' } : u
      );
      setUsersList(updatedUsers);

      const newAdminCount = updatedUsers.filter(
        (m) => String(m.role || '').toLowerCase() === 'admin' || m.isAdmin === true
      ).length;

      setStats((prev) => ({
        ...prev,
        admins: newAdminCount,
        members: updatedUsers.length - newAdminCount,
      }));
    } catch (err) {
      alert(err.message || 'ไม่สามารถเปลี่ยนสิทธิ์ผู้ใช้ได้ กรุณาตรวจสอบ API ฝั่งเซิร์ฟเวอร์');
    } finally {
      setUpdatingId(null);
    }
  };

  // กรองรายชื่อตามช่องค้นหา
  const filteredUsers = usersList.filter((u) => {
    const name = (u.username || u.displayName || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const q = searchTerm.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E1C1A] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* ส่วนหัวและปุ่ม + จัดการหนังสือ */}
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

        {/* การ์ดสถิติ 3 ช่อง */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#F3EFE8]/90 border border-[#E6E0D6] rounded-2xl p-6 sm:p-7 space-y-3">
            <p className="text-xs font-medium text-[#7A756E]">หนังสือทั้งหมด</p>
            <p className="text-3xl sm:text-4xl font-bold text-[#1E1C1A]">
              {isLoading ? '...' : stats.books}
            </p>
          </div>

          <div className="bg-[#F3EFE8]/90 border border-[#E6E0D6] rounded-2xl p-6 sm:p-7 space-y-3">
            <p className="text-xs font-medium text-[#7A756E]">สมาชิกทั้งหมด</p>
            <p className="text-3xl sm:text-4xl font-bold text-[#1E1C1A]">
              {isLoading ? '...' : stats.members}
            </p>
          </div>

          <div className="bg-[#F3EFE8]/90 border border-[#E6E0D6] rounded-2xl p-6 sm:p-7 space-y-3">
            <p className="text-xs font-medium text-[#7A756E]">ผู้ดูแลระบบ</p>
            <p className="text-3xl sm:text-4xl font-bold text-[#1E1C1A]">
              {isLoading ? '...' : stats.admins}
            </p>
          </div>
        </div>

        {/* ส่วนจัดการสมาชิก (เลื่อนขั้น Member <-> Admin) */}
        <section className="bg-white border border-[#E6E0D6] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#4A2B1D]">
                จัดการสมาชิกและสิทธิ์การใช้งาน
              </h2>
              <p className="text-xs text-[#7A756E] mt-0.5">
                สามารถเลื่อนระดับสมาชิก (Member) เป็นผู้ดูแลระบบ (Admin) หรือปรับลดสิทธิ์ได้
              </p>
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อผู้ใช้ หรืออีเมล..."
              className="w-full sm:w-64 px-4 py-2 bg-[#FAF7F2] border border-[#E6E0D6] rounded-xl text-xs text-[#4A2B1D] focus:outline-none focus:ring-1 focus:ring-[#8C533A]"
            />
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#8C533A] animate-pulse">
              กำลังโหลดรายชื่อสมาชิก...
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-[#E6E0D6] text-[#7A756E] text-xs">
                    <th className="py-3 px-4 font-semibold">ชื่อผู้ใช้</th>
                    <th className="py-3 px-4 font-semibold">อีเมล</th>
                    <th className="py-3 px-4 font-semibold">สิทธิ์ปัจจุบัน</th>
                    <th className="py-3 px-4 font-semibold text-right">จัดการสิทธิ์</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3EFE8]">
                  {filteredUsers.map((member) => {
                    const isMemberAdmin =
                      String(member.role || '').toLowerCase() === 'admin' ||
                      member.isAdmin === true ||
                      member.is_admin === 1;
                    const isSelf = user?.id === member.id || user?.email === member.email;

                    return (
                      <tr key={member.id} className="hover:bg-[#FAF7F2]/60 transition">
                        <td className="py-3.5 px-4 font-semibold text-[#4A2B1D]">
                          {member.username || member.displayName || 'ไม่ระบุชื่อ'}
                          {isSelf && (
                            <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-[#E8DCC4] text-[#4A2B1D]">
                              คุณ
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">{member.email}</td>
                        <td className="py-3.5 px-4">
                          {isMemberAdmin ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#4A2B1D] text-[#FDFBF7]">
                              👑 Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#F3EFE8] text-[#7A756E] border border-[#E6E0D6]">
                              Member
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isSelf ? (
                            <span className="text-[11px] text-gray-400">บัญชีปัจจุบัน</span>
                          ) : (
                            <button
                              disabled={updatingId === member.id}
                              onClick={() => handleToggleRole(member)}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-50 ${
                                isMemberAdmin
                                  ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                                  : 'bg-[#8C533A] text-white hover:bg-[#633A27]'
                              }`}
                            >
                              {updatingId === member.id
                                ? 'กำลังบันทึก...'
                                : isMemberAdmin
                                ? 'ลดเป็น Member'
                                : 'เลื่อนเป็น Admin'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-gray-400">
              ไม่พบข้อมูลสมาชิกในระบบ
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default AdminDashboard;