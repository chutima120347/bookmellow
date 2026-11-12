import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
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

function Home() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [books, setBooks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const data = await apiRequest('/api/books');
        const booksList = Array.isArray(data) ? data : (data?.books || data?.data || []);
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
    if (!isLoggedIn) {
      setFavorites([]);
      return;
    }

    const fetchFavorites = async () => {
      try {
        const res = await apiRequest('/api/favorites');
        const favList = Array.isArray(res) ? res : (res?.data || res?.favorites || []);
        setFavorites(favList.map((item) => item.book_id || item.id));
      } catch {
        setFavorites([]);
      }
    };

    fetchFavorites();
  }, [isLoggedIn]);

  const toggleFavorite = async (e, bookId) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      alert('กรุณาเข้าสู่ระบบก่อนบันทึกรายการโปรดค่ะ');
      navigate('/auth');
      return;
    }

    const isFav = favorites.includes(bookId);
    try {
      if (isFav) {
        await apiRequest(`/api/favorites/${bookId}`, { method: 'DELETE' });
        setFavorites((prev) => prev.filter((id) => id !== bookId));
      } else {
        await apiRequest('/api/favorites', {
          method: 'POST',
          body: JSON.stringify({ book_id: bookId }),
        });
        setFavorites((prev) => [...prev, bookId]);
      }
    } catch (err) {
      console.error('อัปเดตรายการโปรดไม่สำเร็จ:', err);
    }
  };

  const filteredBooks = books.filter((book) => {
    const bookCategories = Array.isArray(book.categories)
      ? book.categories
      : [book.category || ''];

    return selectedCategory === 'all' || bookCategories.includes(selectedCategory);
  });

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A2B1D] font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">

        {/* 1. Hero Banner */}
        <section className="relative overflow-hidden bg-[#633A27] text-[#FDFBF7] rounded-3xl p-8 sm:p-12 shadow-md">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-[#FDFBF7]">
              หนังสือดีๆ ที่จะทำให้ทุกวันของคุณอบอุ่นขึ้น
            </h1>
            <p className="text-sm sm:text-base text-[#E8DCC4] leading-relaxed">ค้นพบหนังสือและเรื่องราวสุดประทับใจที่เหมาะกับคุณวันนี้</p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/explore')}
                className="bg-[#8C533A] hover:bg-[#4A2B1D] text-white px-6 py-3 rounded-full text-xs sm:text-sm font-semibold transition shadow-md inline-flex items-center gap-2"
              >
                เริ่มค้นหาหนังสือ
              </button>
              <button
                onClick={() => navigate('/interests')}
                className="bg-[#FDFBF7] hover:bg-[#E8DCC4] text-[#4A2B1D] px-6 py-3 rounded-full text-xs sm:text-sm font-semibold transition shadow-md inline-flex items-center gap-2"
              >
                เลือกตามความสนใจ
              </button>
            </div>
          </div>
        </section>

        {/* 2. หมวดหมู่หนังสือ */}
        <section id="categories-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🪄</span>
              <h2 className="text-xl font-bold text-[#4A2B1D]">หมวดหมู่หนังสือ</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoryOptions.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-2xl border text-xs sm:text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#8C533A] text-white border-[#8C533A] shadow-sm'
                    : 'bg-white text-[#4A2B1D] border-[#E8DCC4] hover:bg-[#F4EFE6]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* 3. หนังสือแนะนำสำหรับคุณ */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-[#4A2B1D]">หนังสือแนะนำ</h2>
              <p className="text-xs text-gray-500">
                กำลังแสดงหนังสือทั้งหมด {filteredBooks.length} เล่ม
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#E8DCC4]">
              <p className="text-[#8C533A] text-sm animate-pulse">กำลังโหลดข้อมูลหนังสือจากเซิร์ฟเวอร์...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book) => {
                  const isFav = favorites.includes(book.id);
                  const firstCategory = Array.isArray(book.categories) && book.categories.length > 0
                    ? book.categories[0]
                    : (book.category || 'ทั่วไป');

                  return (
                    <div
                      key={book.id}
                      onClick={() => navigate(`/book/${book.id}`)}
                      className="group bg-white rounded-2xl p-4 border border-[#E8DCC4] shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#F4EFE6]">
                          <BookCover src={book.cover_url || book.cover} title={book.title} />

                          <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-white/90 text-[#8C533A] border-[#E8DCC4]">
                            {firstCategory}
                          </span>

                          <button
                            onClick={(e) => toggleFavorite(e, book.id)}
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-rose-500 shadow-sm hover:scale-110 transition"
                          >
                            {isFav ? '💖' : '🤍'}
                          </button>
                        </div>

                        <div>
                          <h3 className="font-bold text-sm text-[#4A2B1D] truncate mt-1">{book.title}</h3>
                          <p className="text-xs text-gray-500 truncate">ผู้แต่ง: {book.author}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#F4EFE6] mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-[#8C533A] bg-[#F4EFE6] px-2 py-0.5 rounded-full truncate max-w-[110px]">
                          {book.reason || book.description || 'แนะนำสำหรับคุณ'}
                        </span>
                        <span className="text-xs font-semibold text-[#8C533A] group-hover:underline flex-shrink-0">
                          รายละเอียด &gt;
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-[#E8DCC4]">
                  <p className="text-gray-400 text-sm">ไม่พบหนังสือในหมวดหมู่นี้</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
export default Home;