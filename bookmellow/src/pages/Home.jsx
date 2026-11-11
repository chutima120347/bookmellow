import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { booksData } from '../data/data';
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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  const safeBooksData = Array.isArray(booksData) ? booksData : [];

  const filteredBooks = safeBooksData.filter((book) => {
    // Backend ส่ง categories เป็น Array
    const bookCategories = Array.isArray(book.categories) 
      ? book.categories 
      : [book.category || ''];

    const matchesCategory = selectedCategory === 'all' || bookCategories.includes(selectedCategory);
    const matchesSearch = 
      book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites(favorites.filter((favId) => favId !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#4A3E3D]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        {/* Banner Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-[#FFDFDF]/60 via-[#FFF5E4]/60 to-[#D8F3DC]/60 rounded-3xl p-6 sm:p-10 border-2 border-white shadow-sm">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-xs font-medium text-pink-500 border border-pink-100 shadow-sm">
              <span>🌷 สวัสดีวันนี้นะคะ!</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">วันนี้อยากอ่านเรื่องไหนดีนะ?</h1>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">ค้นพบหนังสือและเรื่องราวสุดประทับใจที่เหมาะกับอารมณ์ของคุณวันนี้ ระบบจะช่วยแนะนำหนังสือที่ตรงใจที่สุดให้อ่านแบบเพลิดเพลิน!</p>
          </div>
        </section>

        {/* Categories Section */}
        <section id="categories-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🪄</span>
              <h2 className="text-xl font-bold">หมวดหมู่หนังสือ</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categoryOptions.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === cat.id
                    ? 'bg-[#FF9EAA] text-white border-[#FF9EAA] shadow-sm'
                    : 'bg-white text-[#4A3E3D] border-pink-100 hover:bg-pink-50'
                }`}
              >
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Books Grid Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span>📚</span> หนังสือแนะนำสำหรับคุณ
              </h2>
              <p className="text-xs text-slate-400">กำลังแสดงหนังสือทั้งหมด {filteredBooks.length} เล่ม</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book) => {
                const isFav = favorites.includes(book.id);
                // ดึงหมวดหมู่แรกมาแสดงใน Badge
                const firstCategory = Array.isArray(book.categories) && book.categories.length > 0 
                  ? book.categories[0] 
                  : (book.category || 'ทั่วไป');

                return (
                  <div 
                    key={book.id} 
                    onClick={() => navigate(`/book/${book.id}`)}
                    className="group bg-white rounded-3xl p-3 sm:p-4 border border-pink-100 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#FAF7F0]">
                        {/* ✅ ใช้ BookCover ร่วมกับ cover_url */}
                        <BookCover src={book.cover_url || book.cover} title={book.title} />
                        
                        <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-white/90 text-pink-600 bg-pink-100">
                          {firstCategory}
                        </span>
                        <button
                          onClick={(e) => toggleFavorite(e, book.id)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center text-pink-500 shadow-sm hover:scale-110 transition"
                        >
                          {isFav ? '💖' : '🤍'}
                        </button>
                      </div>

                      <div>
                        <h3 className="font-bold text-sm truncate mt-1">{book.title}</h3>
                        <p className="text-xs text-slate-400 truncate">ผู้แต่ง: {book.author}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-pink-50 mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full truncate max-w-[110px]">
                        {book.reason || book.description || 'แนะนำสำหรับคุณ'}
                      </span>
                      <span className="text-xs font-semibold text-pink-500 group-hover:underline flex-shrink-0">
                        รายละเอียด &gt;
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-pink-100">
                <p className="text-slate-400 text-xs">ไม่พบหนังสือในหมวดหมู่นี้</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Home;