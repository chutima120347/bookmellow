import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiRequest } from '../services/api';
import BookCover from '../components/BookCover';

const categoryOptions = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'Fantasy', label: 'Fantasy' },
  { id: 'Romance', label: 'Romance' },
  { id: 'Mystery', label: 'Mystery' },
  { id: 'Science Fiction', label: 'Science Fiction' },
  { id: 'Thriller', label: 'Thriller' },
  { id: 'Horror', label: 'Horror' },
  { id: 'Historical Fiction', label: 'Historical Fiction' },
  { id: 'Self-Help', label: 'Self-Help' },
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

  const [books, setBooks] = useState([]); // เก็บข้อมูลหนังสือจาก Backend
  const [loading, setLoading] = useState(true); // สถานะกำลังโหลด
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // ดึงข้อมูลหนังสือทั้งหมดจาก Backend ทันทีที่เปิดหน้า Explore
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/api/books');
        const booksList = Array.isArray(data) ? data : (data.books || data.data || []);
        setBooks(booksList);
      } catch (error) {
        console.error('ดึงข้อมูลหนังสือไม่สำเร็จ:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('search');
    if (query !== null) {
      setSearchQuery(query);
    }
  }, [location.search]);

  const filteredBooks = books.filter((book) => {
    const bookCategories = Array.isArray(book.categories)
      ? book.categories
      : [book.category || ''];

    const matchesCategory =
      selectedCategory === 'all' || bookCategories.includes(selectedCategory);

    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      book.title?.toLowerCase().includes(query) ||
      book.author?.toLowerCase().includes(query) ||
      book.categoryName?.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A2B1D]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-[#4A2B1D]">
            <span>หนังสือทั้งหมด</span>
          </h1>
          {searchQuery && (
            <p className="text-xs text-[#8C533A] font-medium mt-1">
              ผลการค้นหาสำหรับ: "{searchQuery}" ({filteredBooks.length} เล่ม)
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* แถบตัวกรองฝั่งซ้าย */}
          <aside className="bg-white p-6 rounded-2xl border border-[#E8DCC4] shadow-sm h-fit space-y-6">
            <div>
              <h3 className="font-bold text-sm mb-3 text-[#4A2B1D]">🔍 ค้นหาหนังสือ</h3>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="พิมพ์ชื่อหนังสือ หรือ ผู้แต่ง..."
                className="w-full px-3 py-2 bg-[#F4EFE6] border border-[#E8DCC4] rounded-xl text-xs text-[#4A2B1D] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8C533A]"
              />
            </div>

            <div>
              <h3 className="font-bold text-sm mb-3 text-[#4A2B1D]">🏷️ หมวดหมู่หนังสือ</h3>
              <div className="space-y-1.5 text-xs max-h-[60vh] overflow-y-auto pr-1">
                {(categoryOptions || []).map((cat) => (
                  <label
                    key={cat.id}
                    className={`flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition ${
                      selectedCategory === cat.id
                        ? 'bg-[#F4EFE6] text-[#8C533A] font-bold border border-[#E8DCC4]'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="categoryFilter"
                      checked={selectedCategory === cat.id}
                      onChange={() => setSelectedCategory(cat.id)}
                      className="accent-[#8C533A]"
                    />
                    <span>{cat.icon} {cat.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* รายการแสดงหนังสือฝั่งขวา */}
          <section className="md:col-span-3 space-y-6">
            {loading ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-[#E8DCC4]">
                <p className="text-[#8C533A] text-sm animate-pulse">กำลังโหลดข้อมูลหนังสือทั้งหมด...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book) => {
                    const firstCategory = Array.isArray(book.categories) && book.categories.length > 0
                      ? book.categories[0]
                      : (book.category || 'ทั่วไป');

                    return (
                      <div
                        key={book.id}
                        onClick={() => navigate(`/book/${book.id}`)}
                        className="group bg-white rounded-2xl p-3 sm:p-4 border border-[#E8DCC4] shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#F4EFE6]">
                            {BookCover ? (
                              <BookCover src={book.cover_url || book.cover} title={book.title} />
                            ) : (
                              <img
                                src={book.cover_url || book.cover}
                                alt={book.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              />
                            )}

                            <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-white/90 text-[#8C533A] border-[#E8DCC4]">
                              {book.badge || firstCategory}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-bold text-sm text-[#4A2B1D] truncate mt-1">
                              {book.title}
                            </h3>
                            <p className="text-xs text-gray-500 truncate">
                              ผู้แต่ง: {book.author}
                            </p>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#F4EFE6] mt-3 flex items-center justify-between">
                          <span className="text-[10px] text-[#8C533A] bg-[#F4EFE6] px-2 py-0.5 rounded-full truncate max-w-[100px]">
                            {book.categoryName || firstCategory}
                          </span>
                          <span className="text-xs font-semibold text-[#8C533A] group-hover:underline">
                            รายละเอียด &gt;
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-[#E8DCC4]">
                    <p className="text-gray-400 text-xs">ไม่พบหนังสือที่ตรงกับคำค้นหา</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
export default Explore;