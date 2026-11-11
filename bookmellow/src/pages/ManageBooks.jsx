import { useState } from 'react';
import Navbar from '../components/Navbar';

const initialBooksList = [
  { id: 1, title: 'ร้านขายยาสมุนไพรของคุณจิ้งจอก', author: 'ฮารุ โนะ มิโดริ', category: '🧸 อบอุ่นหัวใจ' },
  { id: 2, title: 'ปริศนาคดีชาเอิร์ลเกรย์', author: 'มิสซิสการ์เดน', category: '🔍 สืบสวนหักมุม' },
  { id: 3, title: 'ร้านกาแฟของแมวส้มที่หยุดเวลาได้', author: 'คิโยชิ ซาโตะ', category: '☕ อ่านจิบกาแฟ' },
];

function ManageBooks() {
  const [books, setBooks] = useState(initialBooksList);
  const [search, setSearch] = useState('');
  
  // States สำหรับ Form เพิ่ม/แก้ไขหนังสือ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('🧸 อบอุ่นหัวใจ');

  // ระบบค้นหาหนังสือ
  const filteredBooks = books.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  // เปิด Modal เพิ่มหนังสือ
  const handleOpenAddModal = () => {
    setEditingId(null);
    setTitle('');
    setAuthor('');
    setCategory('อบอุ่นหัวใจ');
    setIsModalOpen(true);
  };

  // เปิด Modal แก้ไขหนังสือ
  const handleOpenEditModal = (book) => {
    setEditingId(book.id);
    setTitle(book.title);
    setAuthor(book.author);
    setCategory(book.category);
    setIsModalOpen(true);
  };

  // บันทึกการเพิ่มหรือแก้ไข (CRUD - Save)
  const handleSaveBook = (e) => {
    e.preventDefault();
    if (editingId) {
      setBooks(books.map(b => b.id === editingId ? { ...b, title, author, category } : b));
    } else {
      const newBook = { id: Date.now(), title, author, category };
      setBooks([...books, newBook]);
    }
    setIsModalOpen(false);
  };

  // ลบหนังสือ (CRUD - Delete)
  const handleDeleteBook = (id) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบหนังสือเล่มนี้?')) {
      setBooks(books.filter(b => b.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#4A3E3D]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              📖 <span>ระบบจัดการหนังสือ (Manage Books)</span>
            </h1>
            <p className="text-xs text-slate-400">ค้นหา เพิ่ม แก้ไข และลบหนังสือในระบบ</p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-[#FF9EAA] hover:bg-[#FF9EAA]/90 text-white rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>➕ เพิ่มหนังสือใหม่</span>
          </button>
        </div>

        {/* ค้นหาหนังสือ */}
        <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อหนังสือ หรือ ชื่อผู้แต่ง..."
            className="w-full px-4 py-2 bg-[#FAF7F0] border border-pink-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-pink-300"
          />
        </div>

        {/* ตารางแสดงรายการหนังสือ (CRUD Table) */}
        <div className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F0] border-b border-pink-100 text-slate-500">
              <tr>
                <th className="p-3">ชื่อหนังสือ</th>
                <th className="p-3">ผู้แต่ง</th>
                <th className="p-3">หมวดหมู่</th>
                <th className="p-3 text-center">จัดการข้อมูล</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50">
              {filteredBooks.length > 0 ? (
                filteredBooks.map((b) => (
                  <tr key={b.id} className="hover:bg-pink-50/30">
                    <td className="p-3 font-semibold">{b.title}</td>
                    <td className="p-3 text-slate-400">{b.author}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 bg-pink-50 text-pink-500 rounded-full text-[10px] font-semibold border border-pink-100">
                        {b.category}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(b)}
                          className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[11px] font-semibold hover:bg-amber-100"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDeleteBook(b.id)}
                          className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[11px] font-semibold hover:bg-red-100"
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-slate-400">
                    ไม่พบรายการหนังสือที่คุณค้นหา
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal เพิ่ม / แก้ไข หนังสือ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 space-y-4 border-2 border-pink-100 shadow-lg">
            <h3 className="font-bold text-base text-[#4A3E3D]">
              {editingId ? '✏️ แก้ไขข้อมูลหนังสือ' : '➕ เพิ่มหนังสือใหม่'}
            </h3>

            <form onSubmit={handleSaveBook} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-semibold">ชื่อหนังสือ:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F0] border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">ผู้แต่ง:</label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F0] border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">หมวดหมู่:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F0] border border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                >
                  <option value="🧸 อบอุ่นหัวใจ">🧸 อบอุ่นหัวใจ</option>
                  <option value="🔍 สืบสวนหักมุม">🔍 สืบสวนหักมุม</option>
                  <option value="☕ อ่านจิบกาแฟ">☕ อ่านจิบกาแฟ</option>
                  <option value="✨ แฟนตาซี">✨ แฟนตาซี</option>
                  <option value="🌱 พัฒนาตัวเอง">🌱 พัฒนาตัวเอง</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-gray-100 text-slate-600 rounded-xl font-semibold hover:bg-gray-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#FF9EAA] text-white rounded-xl font-semibold hover:bg-[#FF9EAA]/90"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageBooks;