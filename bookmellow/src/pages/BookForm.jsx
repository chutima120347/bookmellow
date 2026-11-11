import { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

function BookForm() {
  const [searchQuery, setSearchQuery] = useState('');
  const [googleResults, setGoogleResults] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  
  // Form State สำหรับส่งสร้างหนังสือ
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    cover_url: '',
    published_year: new Date().getFullYear(),
    category_ids: [],
  });

  useEffect(() => {
    // ดึงหมวดหมู่ของ BookMellow มาเตรียมไว้
    async function loadCategories() {
      const res = await apiRequest('/api/categories');
      setCategoriesList(res.data || []);
    }
    loadCategories();
  }, []);

  // ค้นหาหนังสือจาก Google Books API
  const handleSearchGoogleBooks = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await apiRequest(`/api/admin/external-books?q=${encodeURIComponent(searchQuery)}`);
      setGoogleResults(res.data || []);
    } catch (err) {
      alert(err.message);
    }
  };

  // เมื่อ Admin คลิกเลือกหนังสือจาก Google ให้ Auto-fill ข้อมูลลง Form
  const handleSelectGoogleBook = (book) => {
    setFormData({
      ...formData,
      title: book.title || '',
      author: book.author || (book.authors ? book.authors.join(', ') : ''),
      description: book.description || '',
      cover_url: book.cover_url || '',
      published_year: book.published_year || new Date().getFullYear(),
    });
    alert(`นำข้อมูลเรื่อง "${book.title}" มาใส่ในฟอร์มเรียบร้อยแล้ว กรุณาเลือกหมวดหมู่ BookMellow ก่อนบันทึกนะคะ`);
  };

  const handleSubmitBook = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/api/admin/books', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      alert('เพิ่มหนังสือเข้าคลังระบบสำเร็จแล้วค่ะ! 📚');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 bg-white rounded-3xl border border-pink-100 my-8 text-[#4A3E3D]">
      <h2 className="text-xl font-bold">➕ เพิ่มหนังสือเล่มใหม่</h2>

      {/* 🔍 Google Books Auto-fill Search */}
      <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-pink-100 space-y-3">
        <label className="text-xs font-bold block">🔍 ค้นหาอัตโนมัติจาก Google Books:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="พิมพ์ชื่อหนังสือภาษาไทย/อังกฤษ เช่น Harry Potter..."
            className="flex-1 px-3 py-2 text-xs bg-white border border-pink-200 rounded-xl"
          />
          <button
            type="button"
            onClick={handleSearchGoogleBooks}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs rounded-xl"
          >
            ค้นหา
          </button>
        </div>

        {/* Results List */}
        {googleResults.length > 0 && (
          <div className="max-h-48 overflow-y-auto space-y-2 pt-2">
            {googleResults.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectGoogleBook(item)}
                className="p-2 bg-white rounded-xl border border-pink-100 flex items-center justify-between cursor-pointer hover:bg-pink-50 text-xs"
              >
                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="text-[10px] text-slate-400">ผู้แต่ง: {item.author} ({item.published_year})</p>
                </div>
                <span className="text-pink-500 font-semibold text-[10px]">คลิกเพื่อดึงข้อมูล &gt;</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmitBook} className="space-y-4 text-xs">
        <div>
          <label className="font-semibold block mb-1">ชื่อหนังสือ *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-pink-200 rounded-xl"
            required
          />
        </div>

        <div>
          <label className="font-semibold block mb-1">ผู้แต่ง *</label>
          <input
            type="text"
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            className="w-full px-3 py-2 border border-pink-200 rounded-xl"
            required
          />
        </div>

        <div>
          <label className="font-semibold block mb-1">รูปปก (URL)</label>
          <input
            type="text"
            value={formData.cover_url}
            onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-pink-200 rounded-xl"
          />
        </div>

        <div>
          <label className="font-semibold block mb-1">คำอธิบาย/เรื่องย่อ</label>
          <textarea
            rows="3"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-pink-200 rounded-xl"
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
                    isChecked ? 'bg-pink-500 text-white' : 'bg-gray-100 text-slate-600'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        <button type="submit" className="w-full py-3 bg-[#FF9EAA] text-white rounded-2xl font-bold text-sm shadow-md">
          บันทึกหนังสือลงคลัง 📚
        </button>
      </form>
    </div>
  );
}

export default BookForm;