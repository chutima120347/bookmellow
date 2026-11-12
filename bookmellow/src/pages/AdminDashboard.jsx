import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/api';
import BookCover from '../components/BookCover';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('books'); // 'books' | 'members'
  const [booksList, setBooksList] = useState([]);
  const [membersList, setMembersList] = useState([]);
  const [stats, setStats] = useState({ books: 0, members: 0, admins: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูล Dashboard Stats, Books และ Members
  useEffect(() => {
    async function fetchAdminData() {
      try {
        setIsLoading(true);
        // 1. ดึงข้อมูลสถิติภาพรวม (GET /api/admin/dashboard)
        const statsRes = await apiRequest('/api/admin/dashboard');
        setStats(statsRes || { books: 0, members: 0, admins: 0 });

        // 2. ดึงรายการหนังสือ (GET /api/admin/books)
        const booksRes = await apiRequest('/api/admin/books');
        setBooksList(booksRes?.data || booksRes || []);

        // 3. ดึงรายการสมาชิก (GET /api/admin/members)
        const membersRes = await apiRequest('/api/admin/members');
        setMembersList(membersRes?.data || membersRes || []);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAdminData();
  }, []);

  // ฟิลเตอร์ค้นหาหนังสือ
  const filteredBooks = booksList.filter((book) =>
    book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ฟิลเตอร์ค้นหาสมาชิก
  const filteredMembers = membersList.filter((m) =>
    m.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // การลบหนังสือ (DELETE /api/admin/books/{id})
  const handleDeleteBook = async (id, title) => {
    if (window.confirm(`คุณต้องการลบหนังสือเรื่อง "${title}" ใช่หรือไม่?`)) {
      try {
        await apiRequest(`/api/admin/books/${id}`, { method: 'DELETE' });
        setBooksList(booksList.filter((b) => b.id !== id));
        alert('ลบหนังสือเรียบร้อยแล้วค่ะ');
      } catch (err) {
        alert(err.message || 'ไม่สามารถลบหนังสือได้');
      }
    }
  };

  // เปลี่ยนสิทธิ์สมาชิก (PUT /api/admin/members/{id}/role)
  const handleToggleRole = async (memberId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    try {
      await apiRequest(`/api/admin/members/${memberId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });
      setMembersList(
        membersList.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
      alert('อัปเดตสิทธิ์สมาชิกเรียบร้อยแล้ว');
    } catch (err) {
      alert(err.message || 'ไม่สามารถเปลี่ยนสิทธิ์สมาชิกได้');
    }
  };

  // ลบสมาชิก (DELETE /api/admin/members/{id})
  const handleDeleteMember = async (id, username) => {
    if (window.confirm(`คุณต้องการลบบัญชีผู้ใช้ "${username}" ใช่หรือไม่?`)) {
      try {
        await apiRequest(`/api/admin/members/${id}`, { method: 'DELETE' });
        setMembersList(membersList.filter((m) => m.id !== id));
        alert('ลบบัญชีผู้ใช้เรียบร้อยแล้ว');
      } catch (err) {
        alert(err.message || 'ไม่สามารถลบสมาชิกได้');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A2B1D]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Admin */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E8DCC4] shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F4EFE6] text-[#8C533A] border border-[#E8DCC4] rounded-full text-xs font-semibold mb-2">
              <span>👑 ผู้ดูแลระบบ (Admin Mode)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#4A2B1D]">แผงควบคุมระบบ BookMellow</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              จัดการข้อมูลหนังสือ หมวดหมู่ และภาพรวมของระบบทั้งหมด
            </p>
          </div>

          <button
            onClick={() => navigate('/admin/manage-books')}
            className="px-5 py-2.5 bg-[#8C533A] hover:bg-[#633A27] text-white rounded-full text-xs font-bold shadow-md transition flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <span>➕ เพิ่มหนังสือเล่มใหม่</span>
          </button>
        </div>

        {/* Overview Widgets */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E8DCC4] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#8C533A]">
              <span className="text-xs font-semibold">หนังสือทั้งหมด</span>
              <span className="text-lg">📚</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-[#4A2B1D]">{stats.books}</p>
            <p className="text-[10px] text-gray-400">รายการในระบบ</p>
          </div>

          <div className="bg-[#F4EFE6] p-5 rounded-2xl border border-[#E8DCC4] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#633A27]">
              <span className="text-xs font-semibold">สมาชิก (Members)</span>
              <span className="text-lg">👥</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-[#4A2B1D]">{stats.members}</p>
            <p className="text-[10px] text-gray-500">ผู้ใช้งานทั่วไป</p>
          </div>

          <div className="bg-[#F4EFE6] p-5 rounded-2xl border border-[#E8DCC4] shadow-sm space-y-2">
            <div className="flex items-center justify-between text-[#8C533A]">
              <span className="text-xs font-semibold">ผู้ดูแลระบบ (Admins)</span>
              <span className="text-lg">👑</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-[#4A2B1D]">{stats.admins}</p>
            <p className="text-[10px] text-gray-500">ผู้ดูแลระบบทั้งหมด</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-3 border-b border-[#E8DCC4] pb-2">
          <button
            onClick={() => setActiveTab('books')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'books'
                ? 'bg-[#8C533A] text-white shadow-sm'
                : 'bg-white text-gray-600 border border-[#E8DCC4] hover:bg-[#F4EFE6]'
            }`}
          >
            📖 จัดการคลังหนังสือ ({booksList.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'members'
                ? 'bg-[#8C533A] text-white shadow-sm'
                : 'bg-white text-gray-600 border border-[#E8DCC4] hover:bg-[#F4EFE6]'
            }`}
          >
            👥 จัดการสมาชิก ({membersList.length})
          </button>
        </div>

        {/* Table Management Section */}
        <section className="bg-white rounded-2xl p-6 border border-[#E8DCC4] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#F4EFE6]">
            <h2 className="text-lg font-bold flex items-center gap-2 text-[#4A2B1D]">
              <span>{activeTab === 'books' ? '📖' : '👥'}</span>{' '}
              {activeTab === 'books' ? `รายการหนังสือ (${filteredBooks.length})` : `รายการสมาชิก (${filteredMembers.length})`}
            </h2>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={activeTab === 'books' ? "ค้นหาชื่อหนังสือ / ผู้แต่ง..." : "ค้นหาชื่อ / อีเมล..."}
                className="w-full px-3 py-1.5 pl-8 bg-[#F4EFE6] border border-[#E8DCC4] rounded-xl text-xs text-[#4A2B1D] focus:outline-none focus:ring-1 focus:ring-[#8C533A]"
              />
              <span className="absolute left-2.5 top-2 text-xs text-gray-400">🔍</span>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-gray-400 text-xs">กำลังโหลดข้อมูล...</div>
          ) : activeTab === 'books' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4EFE6] text-[#4A2B1D] font-semibold border-b border-[#E8DCC4]">
                  <tr>
                    <th className="p-3 rounded-l-xl">หนังสือ</th>
                    <th className="p-3">หมวดหมู่</th>
                    <th className="p-3">ปีที่พิมพ์</th>
                    <th className="p-3 text-right rounded-r-xl">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EFE6]">
                  {filteredBooks.map((book) => {
                    const categoryBadge = Array.isArray(book.categories) && book.categories.length > 0
                      ? book.categories.join(', ')
                      : (book.category || 'ทั่วไป');

                    return (
                      <tr key={book.id} className="hover:bg-[#F4EFE6]/50 transition">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-14 flex-shrink-0 rounded-md overflow-hidden shadow-sm bg-[#F4EFE6]">
                              <BookCover src={book.cover_url || book.cover} title={book.title} />
                            </div>
                            <div>
                              <p className="font-bold text-[#4A2B1D]">{book.title}</p>
                              <p className="text-[10px] text-gray-500">ผู้แต่ง: {book.author}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 bg-[#F4EFE6] text-[#8C533A] rounded-full border border-[#E8DCC4] text-[10px] font-semibold">
                            {categoryBadge}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500">{book.published_year || '-'}</td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => navigate(`/admin/manage-books?edit=${book.id}`)}
                            className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg font-semibold hover:bg-amber-200 transition"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id, book.title)}
                            className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg font-semibold hover:bg-rose-200 transition"
                          >
                            ลบ
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F4EFE6] text-[#4A2B1D] font-semibold border-b border-[#E8DCC4]">
                  <tr>
                    <th className="p-3 rounded-l-xl">ชื่อผู้ใช้</th>
                    <th className="p-3">อีเมล</th>
                    <th className="p-3">สิทธิ์</th>
                    <th className="p-3 text-right rounded-r-xl">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EFE6]">
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-[#F4EFE6]/50 transition">
                      <td className="p-3 font-bold text-[#4A2B1D]">{m.username}</td>
                      <td className="p-3 text-gray-500">{m.email}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          m.role === 'admin' 
                            ? 'bg-[#8C533A] text-white' 
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {m.role === 'admin' ? '👑 Admin' : '👤 Member'}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleToggleRole(m.id, m.role)}
                          className="px-3 py-1 bg-[#F4EFE6] text-[#8C533A] border border-[#E8DCC4] rounded-lg font-semibold hover:bg-[#E8DCC4] transition"
                        >
                          เปลี่ยนสิทธิ์
                        </button>
                        <button
                          onClick={() => handleDeleteMember(m.id, m.username)}
                          className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg font-semibold hover:bg-rose-200 transition"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
export default AdminDashboard;