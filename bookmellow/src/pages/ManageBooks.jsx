import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/api';
import BookCover from '../components/BookCover';

const categoryOptions = [
  'Fantasy', 'Romance', 'Mystery', 'Science Fiction', 'Thriller',
  'Horror', 'Historical Fiction', 'Self Help', 'Business', 'Education',
  'Biography', 'Young Adult', 'Children', 'Poetry', 'Adventure'
];

function ManageBooks() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');

  // States สำหรับ Form เพิ่ม/แก้ไขหนังสือ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Fantasy');
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');

  // 1. ดึงรายการหนังสือทั้งหมดจาก Backend
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setIsLoading(true);
      let res;
      try {
        res = await apiRequest('/api/admin/books');
      } catch {
        res = await apiRequest('/api/books');
      }
      const booksList = Array.isArray(res) ? res : (res?.data || res?.books || []);
      setBooks(booksList);
    } catch (err) {
      console.error('Failed to fetch books:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ระบบค้นหาหนังสือ
  const filteredBooks = books.filter((b) =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase())
  );

  // เปิด Modal เพิ่มหนังสือ
  const handleOpenAddModal = () => {
    setEditingId(null);
    setTitle('');
    setAuthor('');
    setCategory('Fantasy');
    setCoverUrl('');
    setDescription('');
    setIsModalOpen(true);
  };

  // เปิด Modal แก้ไขหนังสือ
  const handleOpenEditModal = (book) => {
    const currentCat = Array.isArray(book.categories) && book.categories.length > 0
      ? book.categories[0]
      : (book.category || 'Fantasy');

    setEditingId(book.id);
    setTitle(book.title || '');
    setAuthor(book.author || '');
    setCategory(currentCat);
    setCoverUrl(book.cover_url || book.cover || '');
    setDescription(book.description || book.synopsis || '');
    setIsModalOpen(true);
  };

  // 2. บันทึกการเพิ่มหรือแก้ไขลง Backend (POST / PUT)
  const handleSaveBook = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      title,
      author,
      category,
      categories: [category],
      cover_url: coverUrl,
      description,
    };

    try {
      if (editingId) {
        // แก้ไขหนังสือเดิม
        try {
          await apiRequest(`/api/admin/books/${editingId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
        } catch {
          await apiRequest(`/api/books/${editingId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
        }
        alert('อัปเดตข้อมูลหนังสือเรียบร้อยแล้วค่ะ');
      } else {
        // เพิ่มหนังสือใหม่
        try {
          await apiRequest('/api/admin/books', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
        } catch {
          await apiRequest('/api/books', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
        }
        alert('เพิ่มหนังสือใหม่เข้าสู่ระบบเรียบร้อยแล้วค่ะ');
      }

      setIsModalOpen(false);
      fetchBooks(); // โหลดข้อมูลล่าสุดจากเซิร์ฟเวอร์มาแสดงทันที
    } catch (err) {
      alert(err.message || 'ไม่สามารถบันทึกข้อมูลได้ กรุณาตรวจสอบสิทธิ์ Admin');
    } finally {
      setIsSaving(false);
    }
  };

  // 3. ลบหนังสือออกจาก Backend (DELETE)
  const handleDeleteBook = async (id, bookTitle) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบหนังสือเรื่อง "${bookTitle}"?`)) {
      try {
        try {
          await apiRequest(`/api/admin/books/${id}`, { method: 'DELETE' });
        } catch {
          await apiRequest(`/api/books/${id}`, { method: 'DELETE' });
        }
        setBooks((prev) => prev.filter((b) => String(b.id) !== String(id)));
        alert('ลบหนังสือเรียบร้อยแล้วค่ะ');
      } catch (err) {
        alert(err.message || 'ไม่สามารถลบหนังสือได้');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2A26] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 sm:px-8 py-10 space-y-6">
        
        {/* ปุ่มย้อนกลับไปหน้า Dashboard */}
        <div>
          <button
            onClick={() => navigate('/admin')}
            className="text-xs font-medium text-[#7A756E] hover:text-[#1E1C1A] transition inline-flex items-center gap-1"
          >
            <span>←</span>
            <span>กลับไปหน้า Admin Dashboard</span>
          </button>
        </div>

        {/* Header & ปุ่มเพิ่มหนังสือ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1E1C1A]">
              จัดการหนังสือในระบบ
            </h1>
            <p className="text-xs sm:text-sm text-[#7A756E]">
              เพิ่ม แก้ไข และลบรายการหนังสือทั้งหมด ({books.length} เล่ม)
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-6 py-3 bg-[#232129] hover:bg-[#36333F] text-white rounded-xl text-xs sm:text-sm font-medium shadow-sm flex items-center gap-2 self-start sm:self-auto transition"
          >
            <span>+</span>
            <span>เพิ่มหนังสือใหม่</span>
          </button>
        </div>

        {/* ช่องค้นหาหนังสือ */}
        <div className="bg-[#F3EFE8]/80 p-4 rounded-2xl border border-[#E6E0D6]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อหนังสือ หรือ ชื่อผู้แต่ง..."
            className="w-full px-4 py-2.5 bg-white border border-[#E6E0D6] rounded-xl text-xs text-[#1E1C1A] placeholder-[#9C968E] focus:outline-none focus:ring-1 focus:ring-[#232129]"
          />
        </div>

        {/* ตารางแสดงรายการหนังสือ */}
        <div className="bg-white rounded-2xl border border-[#E6E0D6] shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-12 text-xs text-[#7A756E]">
              กำลังโหลดรายการหนังสือจากเซิร์ฟเวอร์...
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3EFE8] border-b border-[#E6E0D6] text-[#1E1C1A] font-semibold">
                <tr>
                  <th className="p-4">หนังสือ</th>
                  <th className="p-4">ผู้แต่ง</th>
                  <th className="p-4">หมวดหมู่</th>
                  <th className="p-4 text-center">จัดการข้อมูล</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3EFE8]">
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((b) => {
                    const displayCat = Array.isArray(b.categories) && b.categories.length > 0
                      ? b.categories.join(', ')
                      : (b.category || 'ทั่วไป');

                    return (
                      <tr key={b.id} className="hover:bg-[#FAF7F2] transition">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-14 flex-shrink-0 rounded-md overflow-hidden bg-[#F3EFE8] border border-[#E6E0D6]">
                              <BookCover src={b.cover_url || b.cover} title={b.title} />
                            </div>
                            <span className="font-semibold text-[#1E1C1A]">{b.title}</span>
                          </div>
                        </td>
                        <td className="p-4 text-[#7A756E]">{b.author}</td>
                        <td className="p-4">
                          <span className="px-3 py-1 bg-[#F3EFE8] text-[#4A4640] rounded-full text-[11px] font-medium border border-[#E6E0D6]">
                            {displayCat}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEditModal(b)}
                              className="px-3.5 py-1.5 bg-[#F3EFE8] text-[#1E1C1A] border border-[#E6E0D6] rounded-lg text-[11px] font-medium hover:bg-[#E6E0D6] transition"
                            >
                              แก้ไข
                            </button>
                            <button
                              onClick={() => handleDeleteBook(b.id, b.title)}
                              className="px-3.5 py-1.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-[11px] font-medium hover:bg-rose-100 transition"
                            >
                              ลบ
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-[#7A756E]">
                      ไม่พบรายการหนังสือที่คุณค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modal เพิ่ม / แก้ไข หนังสือ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 border border-[#E6E0D6] shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-[#1E1C1A]">
              {editingId ? 'แก้ไขข้อมูลหนังสือ' : 'เพิ่มหนังสือใหม่'}
            </h3>

            <form onSubmit={handleSaveBook} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium text-[#1E1C1A]">ชื่อหนังสือ *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="กรอกชื่อหนังสือ"
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6E0D6] rounded-xl text-[#1E1C1A] focus:outline-none focus:ring-1 focus:ring-[#232129]"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-[#1E1C1A]">ผู้แต่ง *</label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="กรอกชื่อผู้แต่ง"
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6E0D6] rounded-xl text-[#1E1C1A] focus:outline-none focus:ring-1 focus:ring-[#232129]"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-[#1E1C1A]">หมวดหมู่ *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6E0D6] rounded-xl text-[#1E1C1A] focus:outline-none focus:ring-1 focus:ring-[#232129]"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium text-[#1E1C1A]">ลิงก์รูปภาพหน้าปก (URL)</label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="https://example.com/cover.jpg"
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6E0D6] rounded-xl text-[#1E1C1A] focus:outline-none focus:ring-1 focus:ring-[#232129]"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-[#1E1C1A]">เรื่องย่อ</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="กรอกรายละเอียดหรือเรื่องย่อของหนังสือ..."
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6E0D6] rounded-xl text-[#1E1C1A] focus:outline-none focus:ring-1 focus:ring-[#232129]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-[#F3EFE8] text-[#4A4640] rounded-xl font-medium hover:bg-[#E6E0D6] transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-[#232129] text-white rounded-xl font-medium hover:bg-[#36333F] transition disabled:opacity-50"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default ManageBooks;