import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const initialBooksList = [
  { id: 1, title: 'ร้านขายยาสมุนไพรของคุณจิ้งจอก', author: 'ฮารุ โนะ มิโดริ', category: 'Adventure' },
  { id: 2, title: 'ปริศนาคดีชาเอิร์ลเกรย์', author: 'มิสซิสการ์เดน', category: 'Fantasy' },
  { id: 3, title: 'ร้านกาแฟของแมวส้มที่หยุดเวลาได้', author: 'คิโยชิ ซาโตะ', category: 'Mystery' },
];

function ManageBooks() {
  const [books, setBooks] = useState(initialBooksList);
  const [search, setSearch] = useState('');
  
  // States สำหรับ Form เพิ่ม/แก้ไขหนังสือ
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('อบอุ่นหัวใจ');

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
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A2B1D]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-[#4A2B1D]">
              <span>ระบบจัดการหนังสือ</span>
            </h1>
            <p className="text-xs text-gray-500">ค้นหา เพิ่ม แก้ไข และลบหนังสือในระบบ BookMellow</p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-[#8C533A] hover:bg-[#633A27] text-white rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5 self-start sm:self-auto transition"
          >
            <span>➕ เพิ่มหนังสือใหม่</span>
          </button>
        </div>

        {/* ค้นหาหนังสือ */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8DCC4] shadow-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อหนังสือ หรือ ชื่อผู้แต่ง..."
            className="w-full px-4 py-2 bg-[#F4EFE6] border border-[#E8DCC4] rounded-xl text-xs text-[#4A2B1D] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8C533A]"
          />
        </div>

        {/* ตารางแสดงรายการหนังสือ (CRUD Table) */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8DCC4] shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4EFE6] border-b border-[#E8DCC4] text-[#4A2B1D] font-semibold">
              <tr>
                <th className="p-3 rounded-l-xl">ชื่อหนังสือ</th>
                <th className="p-3">ผู้แต่ง</th>
                <th className="p-3">หมวดหมู่</th>
                <th className="p-3 text-center rounded-r-xl">จัดการข้อมูล</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE6]">
              {filteredBooks.length > 0 ? (
                filteredBooks.map((b) => (
                  <tr key={b.id} className="hover:bg-[#F4EFE6]/50 transition">
                    <td className="p-3 font-semibold text-[#4A2B1D]">{b.title}</td>
                    <td className="p-3 text-gray-500">{b.author}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 bg-[#F4EFE6] text-[#8C533A] rounded-full text-[10px] font-semibold border border-[#E8DCC4]">
                        {b.category}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditModal(b)}
                          className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-[11px] font-semibold hover:bg-amber-200 transition"
                        >
                          แก้ไข
                        </button>
                        <button
                          onClick={() => handleDeleteBook(b.id)}
                          className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-[11px] font-semibold hover:bg-rose-200 transition"
                        >
                          ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-400">
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
          <div className="bg-white w-full max-w-md rounded-2xl p-6 space-y-4 border border-[#E8DCC4] shadow-lg">
            <h3 className="font-bold text-base text-[#4A2B1D]">
              {editingId ? '✏️ แก้ไขข้อมูลหนังสือ' : '➕ เพิ่มหนังสือใหม่'}
            </h3>

            <form onSubmit={handleSaveBook} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-semibold text-[#4A2B1D]">ชื่อหนังสือ:</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#F4EFE6] border border-[#E8DCC4] rounded-xl text-[#4A2B1D] focus:outline-none focus:ring-1 focus:ring-[#8C533A]"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-[#4A2B1D]">ผู้แต่ง:</label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full p-2.5 bg-[#F4EFE6] border border-[#E8DCC4] rounded-xl text-[#4A2B1D] focus:outline-none focus:ring-1 focus:ring-[#8C533A]"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-[#4A2B1D]">หมวดหมู่:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-[#F4EFE6] border border-[#E8DCC4] rounded-xl text-[#4A2B1D] focus:outline-none focus:ring-1 focus:ring-[#8C533A]"
                >
                  <option value="Fantasy">Fantasy</option>
                  <option value="Romance">Romance</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Science Fiction">Science Fiction</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Horror">Horror</option>
                  <option value="Historical Fiction">Historical Fiction</option>
                  <option value="Self Help">Self Help</option>
                  <option value="Business">Business</option>
                  <option value="Education">Education</option>
                  <option value="Biography">Biography</option>
                  <option value="Young Adult">Young Adult</option>
                  <option value="Children">Children</option>
                  <option value="Poetry">Poetry</option>
                  <option value="Adventure">Adventure</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl font-semibold hover:bg-gray-200 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#8C533A] text-white rounded-xl font-semibold hover:bg-[#633A27] transition"
                >
                  บันทึกข้อมูล
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