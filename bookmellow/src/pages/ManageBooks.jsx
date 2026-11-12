import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BookCover from '../components/BookCover';
import { ConfirmBox } from '../components/admin/AdminStates';
import { apiRequest } from '../services/api';

const categoryOptions = [
  'Fantasy', 'Romance', 'Mystery', 'Science Fiction', 'Thriller',
  'Horror', 'Historical Fiction', 'Self Help', 'Business', 'Education',
  'Biography', 'Young Adult', 'Children', 'Poetry', 'Adventure'
];

function ManageBooks() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Fantasy');
  const [publishedYear, setPublishedYear] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [description, setDescription] = useState('');

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/api/books');
      const list = Array.isArray(res) ? res : (res?.books || res?.data || []);
      setBooks(list);
    } catch (err) {
      console.error('โหลดรายการหนังสือไม่สำเร็จ:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const openAddModal = () => {
    setEditingBook(null);
    setTitle('');
    setAuthor('');
    setCategory('Fantasy');
    setPublishedYear('');
    setCoverUrl('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setTitle(book.title || '');
    setAuthor(book.author || '');
    const firstCat =
      Array.isArray(book.categories) && book.categories.length > 0
        ? book.categories[0]
        : book.category || 'Fantasy';
    setCategory(firstCat);
    setPublishedYear(book.published_year || book.publish_year || book.year || '');
    setCoverUrl(book.cover_url || book.cover || '');
    setDescription(book.description || '');
    setIsModalOpen(true);
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      alert('กรุณากรอกชื่อหนังสือและชื่อผู้แต่งให้ครบถ้วน');
      return;
    }

    const payload = {
      title: title.trim(),
      author: author.trim(),
      category,
      categories: [category],
      published_year: publishedYear ? Number(publishedYear) : null,
      cover_url: coverUrl.trim(),
      description: description.trim(),
    };

    try {
      setSaving(true);
      if (editingBook) {
        await apiRequest(`/api/books/${editingBook.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest('/api/books', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setIsModalOpen(false);
      await fetchBooks();
    } catch (err) {
      alert(err.message || 'บันทึกข้อมูลหนังสือไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeleting(true);
      await apiRequest(`/api/books/${confirmDelete.id}`, { method: 'DELETE' });
      setBooks((prev) => prev.filter((item) => item.id !== confirmDelete.id));
      setConfirmDelete(null);
    } catch (err) {
      alert(err.message || 'ลบหนังสือไม่สำเร็จ');
    } finally {
      setDeleting(false);
    }
  };

  const filteredBooks = books.filter((b) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (b.title || '').toLowerCase().includes(q) ||
      (b.author || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#4A2B1D] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div>
          <button onClick={() => navigate('/admin')} className="text-xs font-semibold text-[#8C533A] hover:underline">กลับไปหน้า Admin Dashboard</button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1E1C1A]">จัดการหนังสือทั้งหมด</h1>
            <p className="text-xs sm:text-sm text-[#7A756E] mt-0.5">ทั้งหมด {books.length} เล่มในระบบ BookMellow</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อหนังสือ หรือผู้แต่ง..."
              className="px-4 py-2 bg-white border border-[#E6E0D6] rounded-xl text-xs sm:text-sm text-[#4A2B1D] focus:outline-none focus:ring-1 focus:ring-[#8C533A]"/>
            <button onClick={openAddModal} className="px-5 py-2 bg-[#4A2B1D] hover:bg-[#633A27] text-white rounded-xl text-xs sm:text-sm font-semibold transition">+ เพิ่มหนังสือใหม่</button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-[#E6E0D6] bg-white p-12 text-center text-sm text-[#8C533A]">กำลังโหลดรายการหนังสือ...</div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#E6E0D6] bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[#F3EFE8]/70 text-left text-xs uppercase tracking-wide text-[#7A756E]">
                <tr>
                  <th className="px-4 py-3">หนังสือ</th>
                  <th className="px-4 py-3">หมวดหมู่</th>
                  <th className="px-4 py-3">ปีที่พิมพ์</th>
                  <th className="px-4 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3EFE8]">
                {filteredBooks.map((book) => {
                  const cat =
                    Array.isArray(book.categories) && book.categories.length > 0
                      ? book.categories[0]
                      : book.category || '-';
                  const year = book.published_year || book.publish_year || book.year || '-';

                  return (
                    <tr key={book.id} className="hover:bg-[#FAF7F2]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-12 rounded overflow-hidden bg-[#F4EFE6] flex-shrink-0">
                            <BookCover src={book.cover_url || book.cover} title={book.title} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-[#1E1C1A] truncate max-w-xs">{book.title}</p>
                            <p className="text-xs text-[#7A756E] truncate max-w-xs">{book.author}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs bg-[#F3EFE8] text-[#5C493E]">{cat}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#7A756E]">{year}</td>
                      <td className="px-4 py-3 text-right space-x-3">
                        <button onClick={() => openEditModal(book)} className="text-xs font-semibold text-[#8C533A] hover:underline">แก้ไข</button>
                        <button onClick={() => setConfirmDelete(book)} className="text-xs font-semibold text-rose-600 hover:underline">ลบ</button>
                      </td>
                    </tr>
                  );
                })}
                {filteredBooks.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-[#8C7B70]">ไม่พบหนังสือที่ค้นหา</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#E6E0D6] bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-[#1E1C1A]">{editingBook ? 'แก้ไขข้อมูลหนังสือ' : 'เพิ่มหนังสือใหม่'}</h2>

            <form onSubmit={handleSaveBook} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-[#5C4D44] mb-1">ชื่อหนังสือ *</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#E6E0D6] px-3.5 py-2 focus:border-[#8C533A] focus:outline-none"/>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5C4D44] mb-1">ผู้เขียน *</label>
                  <input type="text" required value={author} onChange={(e) => setAuthor(e.target.value)}
                    className="w-full rounded-xl border border-[#E6E0D6] px-3.5 py-2 focus:border-[#8C533A] focus:outline-none"/>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5C4D44] mb-1">หมวดหมู่</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-[#E6E0D6] px-3.5 py-2 bg-white focus:border-[#8C533A] focus:outline-none">
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5C4D44] mb-1">เรื่องย่อ</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-[#E6E0D6] px-3.5 py-2 focus:border-[#8C533A] focus:outline-none"/>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" disabled={saving} onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[#E6E0D6] px-4 py-2 text-xs sm:text-sm text-[#7A756E] hover:bg-[#FAF7F2]">ยกเลิก</button>
                <button type="submit" disabled={saving}
                  className="rounded-xl bg-[#4A2B1D] px-5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#633A27] disabled:opacity-50">{saving ? 'กำลังบันทึก...' : 'บันทึก'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmBox open={Boolean(confirmDelete)} busy={deleting} danger title={`ลบ "${confirmDelete?.title}" ?`} confirmText="ลบ"
                  onConfirm={handleDelete} onCancel={() => setConfirmDelete(null)}>
        <p>ข้อมูลหนังสือเล่มนี้จะถูกลบออกจากระบบถาวร และไม่สามารถกู้คืนได้</p>
      </ConfirmBox>

      <Footer />
    </div>
  );
}
export default ManageBooks;