import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../services/api';
import BookCover from '../components/BookCover';

function Favorites() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงรายการโปรดทั้งหมด
  useEffect(() => {
    async function fetchFavorites() {
      if (!isLoggedIn) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await apiRequest('/api/me/favorites');
        const favList = Array.isArray(res) ? res : (res?.data || res?.favorites || []);
        setFavoriteBooks(favList);
      } catch (err) {
        console.error('Failed to load favorites:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFavorites();
  }, [isLoggedIn]);

  // ลบออกจากรายการโปรด
  const handleRemoveFavorite = async (e, bookId) => {
    e.stopPropagation();
    try {
      await apiRequest(`/api/me/favorites/${bookId}`, {
        method: 'DELETE',
      });
      setFavoriteBooks((prev) => prev.filter((book) => String(book.id) !== String(bookId)));
    } catch (err) {
      alert(err.message || 'ไม่สามารถลบรายการโปรดได้');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#4A3E3D]">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2"><span>รายการโปรดของฉัน</span></h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">หนังสือที่คุณบันทึกไว้ในดวงใจ ทั้งหมด {favoriteBooks.length} เล่ม</p>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-slate-400 text-xs">กำลังโหลดรายการโปรด...</div>
        ) : favoriteBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {favoriteBooks.map((book) => {
              const categoryBadge = Array.isArray(book.categories) && book.categories.length > 0 
                ? book.categories[0] : (book.category || 'ทั่วไป');
              return (
                <div
                  key={book.id}
                  onClick={() => navigate(`/book/${book.id}`)}
                  className="group bg-white rounded-3xl p-3 sm:p-4 border border-pink-100 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#FAF7F0]">
                      <BookCover src={book.cover_url || book.cover} title={book.title} />
                      <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-white/90 text-pink-600 bg-pink-100">
                        {categoryBadge}
                      </span>
                      
                      <button
                        onClick={(e) => handleRemoveFavorite(e, book.id)} title="ลบออกจากรายการโปรด"
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center text-pink-500 shadow-sm hover:bg-pink-50 hover:scale-110 transition">💖</button>
                    </div>

                    <div>
                      <h3 className="font-bold text-sm truncate mt-1">{book.title}</h3>
                      <p className="text-xs text-slate-400 truncate">ผู้แต่ง: {book.author}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-pink-50 mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full truncate max-w-[110px]">
                      {book.reason || book.description || 'หนังสือเล่มโปรด'}
                    </span>
                    <span className="text-xs font-semibold text-pink-500 group-hover:underline">อ่านเลย &gt;</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-pink-100 space-y-4">
            <h3 className="text-base font-bold text-[#4A3E3D]">ยังไม่มีหนังสือในรายการโปรด</h3>
            <p className="text-xs text-slate-400">กดไอคอนหัวใจ 💖 บนหนังสือที่ชอบเพื่อเก็บไว้ที่นี่ได้เลยน้า</p>
            <button
              onClick={() => navigate('/explore')}
              className="bg-[#8C533A] hover:bg-[#4A2B1D] text-white px-6 py-3 rounded-full text-xs sm:text-sm font-semibold transition shadow-md inline-flex items-center gap-2">ไปเลือกดูหนังสือกันเลย</button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
export default Favorites;