import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { booksData } from '../data/data';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('books'); // 'books' | 'members'
  const [booksList, setBooksList] = useState(booksData || []);
  const [searchTerm, setSearchTerm] = useState('');

  // ข้อมูล Mockup สำหรับจัดการสมาชิก (GET /api/admin/members)
  const [membersList, setMembersList] = useState([
    { id: 1, name: 'มิลค์ สายอ่าน', email: 'milk@example.com', role: 'User', joined: '01 พ.ย. 2026' },
    { id: 2, name: 'Admin Master', email: 'admin@bookmellow.com', role: 'Admin', joined: '15 ต.ค. 2026' },
    { id: 3, name: 'แมวน้ำปุกปุย', email: 'seal@example.com', role: 'User', joined: '05 พ.ย. 2026' },
  ]);

  // ฟิลเตอร์ค้นหาหนังสือ
  const filteredBooks = booksList.filter((book) =>
    book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (book.categoryName || book.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ฟิลเตอร์ค้นหาสมาชิก
  const filteredMembers = membersList.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // การลบหนังสือ (DELETE /api/admin/books/{id})
  const handleDeleteBook = (id, title) => {
    if (window.confirm(`คุณต้องการลบหนังสือเรื่อง "${title}" ใช่หรือไม่?`)) {
      setBooksList(booksList.filter((b) => b.id !== id));
    }
  };

  // เปลี่ยนสิทธิ์สมาชิก (PUT /api/admin/members/{id}/role)
  const handleToggleRole = (id) => {
    setMembersList(membersList.map((m) => {
      if (m.id === id) {
        const newRole = m.role === 'Admin' ? 'User' : 'Admin';
        return { ...m, role: newRole };
      }
      return m;
    }));
  };

  // ลบสมาชิก (DELETE /api/admin/members/{id})
  const handleDeleteMember = (id, name) => {
    if (window.confirm(`คุณต้องการลบบัญชีผู้ใช้ "${name}" ใช่หรือไม่?`)) {
      setMembersList(membersList.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#4A3E3D]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Admin */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-pink-100 shadow-sm">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-semibold mb-2">
              <span>👑 ผู้ดูแลระบบ (Admin Mode)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">แผงควบคุมระบบ BookMellow</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              จัดการข้อมูลหนังสือ หมวดหมู่ และภาพรวมของระบบทั้งหมด
            </p>
          </div>

          <button
            onClick={() => navigate('/admin/manage-books')}
            className="px-5 py-2.5 bg-[#FF9EAA] hover:bg-[#FF9EAA]/90 text-white rounded-full text-xs font-bold shadow-md transition flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <span>➕ เพิ่มหนังสือเล่มใหม่</span>
          </button>
        </div>

        {/* Overview Widgets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-pink-500">
              <span className="text-xs font-semibold">หนังสือทั้งหมด</span>
              <span className="text-lg">📚</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{booksList.length}</p>
            <p className="text-[10px] text-slate-400">รายการพร้อมใช้งาน</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-purple-500">
              <span className="text-xs font-semibold">สมาชิกในระบบ</span>
              <span className="text-lg">👥</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{membersList.length}</p>
            <p className="text-[10px] text-slate-400">นักอ่านที่ลงทะเบียน</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-amber-500">
              <span className="text-xs font-semibold">รีวิวทั้งหมด</span>
              <span className="text-lg">💬</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">905</p>
            <p className="text-[10px] text-slate-400">ความคิดเห็นจากผู้ใช้</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-emerald-500">
              <span className="text-xs font-semibold">คะแนนเฉลี่ยรวม</span>
              <span className="text-lg">⭐</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">4.8</p>
            <p className="text-[10px] text-slate-400">จากคะแนนเต็ม 5.0</p>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex gap-3 border-b border-pink-100 pb-2">
          <button
            onClick={() => setActiveTab('books')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
              activeTab === 'books'
                ? 'bg-[#FF9EAA] text-white shadow-sm'
                : 'bg-white text-slate-500 hover:bg-pink-50'
            }`}
          >
            📖 จัดการคลังหนังสือ ({booksList.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
              activeTab === 'members'
                ? 'bg-[#FF9EAA] text-white shadow-sm'
                : 'bg-white text-slate-500 hover:bg-pink-50'
            }`}
          >
            👥 จัดการสมาชิก ({membersList.length})
          </button>
        </div>

        {/* Table Management Section */}
        <section className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-pink-50">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span>{activeTab === 'books' ? '📖' : '👥'}</span>{' '}
              {activeTab === 'books' ? `รายการหนังสือ (${filteredBooks.length})` : `รายการสมาชิก (${filteredMembers.length})`}
            </h2>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={activeTab === 'books' ? "ค้นหาชื่อหนังสือ / ผู้แต่ง..." : "ค้นหาชื่อ / อีเมลสมาชิก..."}
                className="w-full px-3 py-1.5 pl-8 bg-[#FAF7F0] border border-pink-200 rounded-xl text-xs focus:outline-none"
              />
              <span className="absolute left-2.5 top-2 text-xs text-slate-400">🔍</span>
            </div>
          </div>

          {/* Table Books */}
          {activeTab === 'books' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F0] text-slate-500 font-semibold border-b border-pink-100">
                  <tr>
                    <th className="p-3 rounded-l-xl">หนังสือ</th>
                    <th className="p-3">หมวดหมู่</th>
                    <th className="p-3">สำนักพิมพ์</th>
                    <th className="p-3">คะแนน</th>
                    <th className="p-3 text-right rounded-r-xl">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {filteredBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-pink-50/40 transition">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={book.cover}
                            alt={book.title}
                            className="w-10 h-13 object-cover rounded-lg flex-shrink-0 shadow-sm"
                          />
                          <div>
                            <p className="font-bold text-[#4A3E3D]">{book.title}</p>
                            <p className="text-[10px] text-slate-400">ผู้แต่ง: {book.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 bg-pink-50 text-pink-500 rounded-full border border-pink-100 text-[10px] font-semibold">
                          {book.categoryName || book.category}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{book.publisher || 'BookMellow'}</td>
                      <td className="p-3 font-bold text-amber-500">⭐ {book.rating}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => navigate(`/admin/manage-books?edit=${book.id}`)}
                          className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg font-semibold hover:bg-amber-200 transition"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.id, book.title)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition"
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

          {/* Table Members */}
          {activeTab === 'members' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F0] text-slate-500 font-semibold border-b border-pink-100">
                  <tr>
                    <th className="p-3 rounded-l-xl">สมาชิก</th>
                    <th className="p-3">อีเมล</th>
                    <th className="p-3">สิทธิ์ใช้งาน</th>
                    <th className="p-3">วันที่สมัคร</th>
                    <th className="p-3 text-right rounded-r-xl">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-pink-50/40 transition">
                      <td className="p-3 font-bold text-[#4A3E3D]">{member.name}</td>
                      <td className="p-3 text-slate-500">{member.email}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          member.role === 'Admin' ? 'bg-purple-100 text-purple-600 border border-purple-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {member.role === 'Admin' ? '👑 Admin' : '👤 User'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 text-[10px]">{member.joined}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleToggleRole(member.id)}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg font-semibold hover:bg-purple-200 transition"
                        >
                          เปลี่ยนสิทธิ์
                        </button>
                        <button
                          onClick={() => handleDeleteMember(member.id, member.name)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 transition"
                        >
                          ลบผู้ใช้
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