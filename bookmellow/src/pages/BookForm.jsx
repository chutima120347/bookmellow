import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../services/api';

function BookForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [searchQuery, setSearchQuery] = useState('');
  const [googleResults, setGoogleResults] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    cover_url: '',
    published_year: new Date().getFullYear(),
    category_ids: [],
  });

  useEffect(() => {
    async function initData() {
      try {
        // 1. ดึงหมวดหมู่ของ BookMellow (GET /api/categories)
        const catRes = await apiRequest('/api/categories');
        setCategoriesList(catRes.data || []);

        // 2. ถ้าเป็นการแก้ไขหนังสือ ให้ดึงรายละเอียดหนังสือเล่มนั้น (GET /api/admin/books/{id})
        if (editId) {
          const bookRes = await apiRequest(`/api/admin/books/${editId}`);
          const b = bookRes.data || bookRes;
          setFormData({
            title: b.title || '',
            author: b.author || '',
            description: b.description || '',
            cover_url: b.cover_url || '',
            published_year: b.published_year || new Date().getFullYear(),
            category_ids: Array.isArray(b.category_ids) ? b.category_ids : [],
          });
        }
      } catch (err) {
        console.error('Failed to init book form:', err);
      }
    }
    initData();
  }, [editId]);

  // ค้นหาหนังสือจาก Google Books (GET /api/admin/external-books?q=...)
  const handleSearchGoogleBooks = async () => {
    if (!searchQuery.trim()) return;
    try {
      setIsSearching(true);
      const res = await apiRequest(`/api/admin/external-books?q=${encodeURIComponent(searchQuery)}`);
      setGoogleResults(res.data || []);
    } catch (err) {
      alert(err.message || 'ไม่สามารถดึงข้อมูลจาก Google Books ได้');
    } finally {
      setIsSearching(false);
    }
  };

  // ดึงข้อมูลหนังสือจาก Google มาใส่ในฟอร์ม
  const handleSelectGoogleBook = (book) => {
    setFormData({
      ...formData,
      title: book.title || '',
      author: book.author || (book.authors ? book.authors.join(', ') : ''),
      description: book.description || '',
      cover_url: book.cover_url || '',
      published_year: book.published_year || new Date().getFullYear(),
    });
    alert(`ดึงข้อมูล "${book.title}" มาใส่ในฟอร์มเรียบร้อยแล้ว! กรุณาเลือกหมวดหมู่ของ BookMellow ก่อนบันทึกนะคะ`);
  };

  // ส่งบันทึกสร้าง (POST) หรืออัปเดต (PUT)
  const handleSubmitBook = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.author.trim()) {
      alert('กรุณากรอกชื่อหนังสือและผู้แต่งให้ครบถ้วน');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        cover_url: formData.cover_url || null,
        published_year: Number(formData.published_year) || null,
        category_ids: formData.category_ids,
      };

      if (editId) {
        // อัปเดตข้อมูลแบบ Full Update (PUT /api/admin/books/{id})
        await apiRequest(`/api/admin/books/${editId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        alert('อัปเดตข้อมูลหนังสือเรียบร้อยแล้วค่ะ!');
      } else {
        // สร้างหนังสือใหม่ (POST /api/admin/books)
        await apiRequest('/api/admin/books', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        alert('เพิ่มหนังสือใหม่เข้าคลังเรียบร้อยแล้วค่ะ!');
      }
      navigate('/admin');
    } catch (err) {
      alert(err.message || 'บันทึกข้อมูลหนังสือไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#4A3E3D]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {editId ? '✏️ แก้ไขข้อมูลหนังสือ' : '➕ เพิ่มหนังสือเล่มใหม่'}
          </h1>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-1.5 bg-gray-200 text-slate-600 rounded-full text-xs font-semibold"
          >
            ย้อนกลับ
          </button>
        </div>

        {/* Google Books Search (ใช้ตอนเพิ่มหนังสือใหม่) */}
        {!editId && (
          <div className="bg-[#FAF7F0] p-4 rounded-3xl border border-pink-200 space-y-3 shadow-sm">
            <label className="text-xs font-bold block text-purple-600">
              🔍 ดึงข้อมูลอัตโนมัติจาก Google Books API:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="พิมพ์ชื่อหนังสือภาษาไทย/อังกฤษ เช่น Harry Potter..."
                className="flex-1 px-3 py-2 text-xs bg-white border border-pink-200 rounded-xl focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSearchGoogleBooks}
                disabled={isSearching}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs rounded-xl transition disabled:opacity-50"
              >
                {isSearching ? 'กำลังค้นหา...' : 'ค้นหา'}
              </button>
            </div>

            {googleResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-2 pt-2">
                {googleResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectGoogleBook(item)}
                    className="p-2.5 bg-white rounded-xl border border-pink-100 flex items-center justify-between cursor-pointer hover:bg-pink-50 text-xs transition"
                  >
                    <div>
                      <p className="font-bold text-[#4A3E3D]">{item.title}</p>
                      <p className="text-[10px] text-slate-400">
                        ผู้แต่ง: {item.author} ({item.published_year || 'ไม่ระบุปี'})
                      </p>
                    </div>
                    <span className="text-pink-500 font-semibold text-[10px]">
                      คลิกเพื่อเลือก &gt;
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Form */}
        <form onSubmit={handleSubmitBook} className="bg-white rounded-3xl p-6 border border-pink-100 shadow-sm space-y-4 text-xs">
          <div>
            <label className="font-semibold block mb-1">ชื่อหนังสือ *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-pink-200 rounded-xl bg-[#FAF7F0]/30 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">ผู้แต่ง *</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-3 py-2 border border-pink-200 rounded-xl bg-[#FAF7F0]/30 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">รูปปก (URL)</label>
              <input
                type="text"
                value={formData.cover_url}
                onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-pink-200 rounded-xl bg-[#FAF7F0]/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">ปีที่พิมพ์ (ค.ศ.)</label>
              <input
                type="number"
                value={formData.published_year}
                onChange={(e) => setFormData({ ...formData, published_year: e.target.value })}
                className="w-full px-3 py-2 border border-pink-200 rounded-xl bg-[#FAF7F0]/30 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">คำอธิบาย/เรื่องย่อ</label>
            <textarea
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-pink-200 rounded-xl bg-[#FAF7F0]/30 focus:outline-none"
            ></textarea>
          </div>

          <div>
            <label className="font-semibold block mb-1">หมวดหมู่ของ BookMellow (เลือกได้หลายหมวด)</label>
            <div className="flex flex-wrap gap-2 pt-1">
              {categoriesList.map((cat) => {
                const isChecked = formData.category_ids.includes(cat.id);
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => {
                      const newIds = isChecked
                        ? formData.category_ids.filter((id) => id !== cat.id)
                        : [...formData.category_ids, cat.id];
                      setFormData({ ...formData, category_ids: newIds });
                    }}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition ${
                      isChecked
                        ? 'bg-pink-500 text-white shadow-sm'
                        : 'bg-gray-100 text-slate-600 hover:bg-pink-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-[#FF9EAA] hover:bg-[#FF9EAA]/90 text-white rounded-2xl font-bold text-sm shadow-md transition disabled:opacity-50"
          >
            {isSubmitting ? 'กำลังบันทึก...' : editId ? 'อัปเดตข้อมูลหนังสือ 🌸' : 'บันทึกหนังสือเข้าคลัง 📚'}
          </button>
        </form>
      </main>

      <Footer />
    </div>
  );
}

export default BookForm;