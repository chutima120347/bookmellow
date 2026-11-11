import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate, useLocation } from 'react-router-dom';
import { booksData } from '../data/data';

const categoryOptions = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'Fantasy', label: 'Fantasy' },
  { id: 'Romance', label: 'Romance' },
  { id: 'Mystery', label: 'Mystery' },
  { id: 'Science Fiction', label: 'Science Fiction' },
  { id: 'Thriller', label: 'Thriller' },
  { id: 'Horror', label: 'Horror' },
  { id: 'Historical Fiction', label: 'Historical Fiction' },
  { id: 'Self Help', label: 'Self Help' },
  { id: 'Business', label: 'Business' },
  { id: 'Education', label: 'Education' },
  { id: 'Biography', label: 'Biography' },
  { id: 'Young Adult', label: 'Young Adult' },
  { id: 'Children', label: 'Children' },
  { id: 'Poetry', label: 'Poetry' },
  { id: 'Adventure', label: 'Adventure' }
];

function Explore() {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const searchFromUrl = queryParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('search');
    if (query !== null) {
      setSearchQuery(query);
    }
  }, [location.search]);

  const safeBooksData = Array.isArray(booksData) ? booksData : [];

  const filteredBooks = safeBooksData.filter((book) => {
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      book.title?.toLowerCase().includes(query) ||
      book.author?.toLowerCase().includes(query) ||
      book.categoryName?.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#4A3E3D]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <span>📚 หนังสือทั้งหมด (All Books)</span>
          </h1>
          {searchQuery && (
            <p className="text-xs text-pink-500 font-medium mt-1">
              ผลการค้นหาสำหรับ: "{searchQuery}" ({filteredBooks.length} เล่ม)
            </p>
          )}
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          <aside className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm h-fit space-y-6">
            <div>
              <h3 className="font-bold text-sm mb-3">🔍 ค้นหาหนังสือ</h3>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="พิมพ์ชื่อหนังสือ หรือ ผู้แต่ง..."
                className="w-full px-3 py-2 bg-[#FAF7F0] border border-pink-200 rounded-xl text-xs focus:outline-none"/>
            </div>
            <div>
              <h3 className="font-bold text-sm mb-3">🏷️ หมวดหมู่หนังสือ</h3>
              <div className="space-y-2 text-xs">
                {(categoryOptions || []).map((cat) => (
                  <label 
                    key={cat.id} 
                    className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition ${
                      selectedCategory === cat.id ? 'bg-pink-50 text-pink-600 font-bold' : 'hover:bg-gray-50 text-slate-600'
                    }`}>
                    <input
                      type="radio"
                      name="categoryFilter"
                      checked={selectedCategory === cat.id}
                      onChange={() => setSelectedCategory(cat.id)}
                      className="accent-pink-500"/>
                    <span>{cat.icon} {cat.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>
          <section className="md:col-span-3 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => navigate(`/book/${book.id}`)}
                    className="group bg-white rounded-3xl p-3 sm:p-4 border border-pink-100 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#FAF7F0]">
                        <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        <span className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-white/90 ${book.badgeColor || 'bg-pink-100 text-pink-600'}`}>
                          {book.badge || book.category}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-sm truncate mt-1">{book.title}</h3>
                        <p className="text-xs text-slate-400 truncate">ผู้แต่ง: {book.author}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-pink-100">
                  <p className="text-slate-400 text-xs">ไม่พบหนังสือที่ตรงกับคำค้นหา</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
export default Explore;