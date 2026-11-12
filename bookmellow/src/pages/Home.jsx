import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BookCover from '../components/BookCover';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../services/api';

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

function Home() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const categoryScrollRef = useRef(null);

  const [books, setBooks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูลหนังสือทั้งหมดจาก Backend
  useEffect(() => {
    async function fetchBooks() {
      try {
        setIsLoading(true);
        const res = await apiRequest('/api/books');
        const booksList = Array.isArray(res) ? res : (res?.data || res?.books || []);
        setBooks(booksList);
      } catch (err) {
        console.error('Failed to load books:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBooks();
  }, []);

  // กรองหนังสือตามหมวดหมู่ที่เลือก
  const filteredBooks = books.filter((book) => {
    if (selectedCategory === 'all') return true;
    const bookCategories = Array.isArray(book.categories)
      ? book.categories
      : [book.category || ''];
    return bookCategories.some(
      (c) => c.toLowerCase().replace('-', ' ') === selectedCategory.toLowerCase().replace('-', ' ')
    );
  });

  // เลื่อนแถบหมวดหมู่ซ้าย-ขวา
  const scrollCategories = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A2B1D] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* แถบทางเข้า Admin Dashboard (แสดงเฉพาะผู้ดูแลระบบ) */}
        {isLoggedIn && user?.isAdmin && (
          <div className="bg-[#4A2B1D] text-[#FDFBF7] px-6 py-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#8C533A]">
            <div className="flex items-center gap-3">
              <span className="text-xl">👑</span>
              <div>
                <p className="text-xs sm:text-sm font-bold">โหมดผู้ดูแลระบบ (Admin)</p>
                <p className="text-[11px] text-[#E8DCC4]">
                  คุณเข้าสู่ระบบในฐานะผู้ดูแลระบบ สามารถจัดการคลังหนังสือและสมาชิกได้
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin')}
              className="px-5 py-2 bg-[#8C533A] hover:bg-[#633A27] text-white rounded-xl text-xs font-bold transition self-start sm:self-auto"
            >
              ไปที่หน้า Dashboard &gt;
            </button>
          </div>
        )}

        {/* Hero Banner */}
        <section className="relative overflow-hidden bg-[#633A27] text-[#FDFBF7] rounded-3xl p-8 sm:p-12 shadow-md">
          <div className="max-w-2xl space-y-4">
            <span className="inline-block px-3 py-1 bg-[#8C533A] text-[#FDFBF7] rounded-full text-xs font-semibold">
              พื้นที่พักใจของคนรักการอ่าน
            </span>
            <h1 className="text-2xl sm:text-4xl font-bold leading-tight">
              ค้นพบหนังสือเล่มโปรดที่จะทำให้วันธรรมดาของคุณอบอุ่นขึ้น
            </h1>
            <p className="text-xs sm:text-sm text-[#E8DCC4] leading-relaxed">
              รวบรวมหนังสือหลากหลายแนวทั้งแฟนตาซี โรแมนซ์ สืบสวน และจิตวิทยาพัฒนาตนเอง พร้อมบันทึกเล่มโปรดไว้ในชั้นหนังสือส่วนตัวของคุณ
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/explore')}
                className="px-6 py-3 bg-[#8C533A] hover:bg-[#4A2B1D] text-white rounded-full text-xs sm:text-sm font-semibold shadow-md transition border border-[#E8DCC4]/30"
              >
                สำรวจหนังสือทั้งหมด &gt;
              </button>
            </div>
          </div>
        </section>

        {/* หมวดหมู่หนังสือ */}
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-[#4A2B1D]">
            <span>🪄</span>
            <span>หมวดหมู่หนังสือ</span>
          </h2>

          <div className="relative flex items-center gap-2">
            <button
              onClick={() => scrollCategories('left')}
              className="hidden sm:flex w-8 h-8 rounded-full bg-white border border-[#E8DCC4] items-center justify-center text-xs text-[#4A2B1D] hover:bg-[#F4EFE6] transition flex-shrink-0 shadow-sm"
            >
              ◀
            </button>

            <div
              ref={categoryScrollRef}
              className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#C4B5A0] scrollbar-track-transparent flex-1"
            >
              {categoryOptions.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-shrink-0 px-5 py-2 rounded-full border text-xs font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#633A27] text-white border-[#633A27] shadow-sm'
                      : 'bg-white text-[#4A2B1D] border-[#E8DCC4] hover:bg-[#F4EFE6]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => scrollCategories('right')}
              className="hidden sm:flex w-8 h-8 rounded-full bg-white border border-[#E8DCC4] items-center justify-center text-xs text-[#4A2B1D] hover:bg-[#F4EFE6] transition flex-shrink-0 shadow-sm"
            >
              ▶
            </button>
          </div>
        </section>

        {/* รายการหนังสือแนะนำ */}
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#4A2B1D]">หนังสือแนะนำ</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                กำลังแสดงหนังสือทั้งหมด {filteredBooks.length} เล่ม
              </p>
            </div>

            <button
              onClick={() => navigate('/explore')}
              className="text-xs font-semibold text-[#8C533A] hover:underline"
            >
              ดูทั้งหมด &gt;
            </button>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-2xl border border-[#E8DCC4] py-16 text-center shadow-sm">
              <p className="text-xs sm:text-sm text-[#8C533A] animate-pulse">
                กำลังโหลดข้อมูลหนังสือจากเซิร์ฟเวอร์...
              </p>
            </div>
          ) : filteredBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
              {filteredBooks.map((book) => {
                const badgeCategory =
                  Array.isArray(book.categories) && book.categories.length > 0
                    ? book.categories[0]
                    : book.category || 'ทั่วไป';

                return (
                  <div
                    key={book.id}
                    onClick={() => navigate(`/book/${book.id}`)}
                    className="bg-white rounded-2xl p-3.5 border border-[#E8DCC4] shadow-sm hover:shadow-md transition cursor-pointer group flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#F4EFE6]">
                        <BookCover src={book.cover_url || book.cover} title={book.title} />
                        <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/95 text-[#8C533A] border border-[#E8DCC4] shadow-sm">
                          {badgeCategory}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-bold text-xs sm:text-sm text-[#4A2B1D] line-clamp-1 group-hover:text-[#8C533A] transition">
                          {book.title}
                        </h3>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                          ผู้แต่ง: {book.author}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#F4EFE6] flex items-center justify-between text-[11px]">
                      <span className="text-gray-400 truncate max-w-[60%]">
                        {book.description || 'คลิกเพื่ออ่านรายละเอียด'}
                      </span>
                      <span className="font-semibold text-[#8C533A] group-hover:translate-x-0.5 transition">
                        อ่านเลย &gt;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E8DCC4] py-16 text-center shadow-sm space-y-2">
              <p className="text-sm font-semibold text-[#4A2B1D]">ไม่พบหนังสือในหมวดหมู่นี้</p>
              <p className="text-xs text-gray-400">ลองเลือกหมวดหมู่อื่น หรือดูหนังสือทั้งหมดในระบบ</p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
export default Home;