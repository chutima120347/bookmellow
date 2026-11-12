import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BookCover from '../components/BookCover';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../services/api';

function Recommendations() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงความสนใจของผู้ใช้ และหนังสือที่ตรงกับความสนใจ
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setIsLoading(true);

        // 1. โหลดหมวดหมู่ความสนใจที่ผู้ใช้บันทึกไว้
        let interests = [];
        try {
          const savedLocal = localStorage.getItem('user_interests');
          if (savedLocal) {
            interests = JSON.parse(savedLocal);
          }
        } catch {
          interests = [];
        }

        if (isLoggedIn) {
          try {
            const res = await apiRequest('/api/user/interests');
            const apiInterests = Array.isArray(res) ? res : (res?.interests || res?.data || []);
            if (apiInterests.length > 0) {
              interests = apiInterests;
              localStorage.setItem('user_interests', JSON.stringify(apiInterests));
            }
          } catch {
            // ใช้ค่าจาก localStorage ต่อได้หากยังไม่มี endpoint
          }
        }

        setUserInterests(interests);

        // 2. ดึงหนังสือทั้งหมดจาก Backend แล้วคัดกรองตามความสนใจ
        const booksRes = await apiRequest('/api/books');
        const allBooks = Array.isArray(booksRes) ? booksRes : (booksRes?.books || booksRes?.data || []);

        if (interests.length > 0) {
          const normalizedInterests = interests.map((i) => i.toLowerCase().trim());
          const matched = allBooks.filter((book) => {
            const bookCats = Array.isArray(book.categories)
              ? book.categories
              : [book.category || ''];
            return bookCats.some((cat) =>
              normalizedInterests.includes(String(cat).toLowerCase().trim())
            );
          });
          setRecommendedBooks(matched);
        } else {
          // หากยังไม่เคยเลือกความสนใจ ให้แสดงหนังสือแนะนำทั้งหมด
          setRecommendedBooks(allBooks);
        }
      } catch (err) {
        console.error('โหลดหนังสือแนะนำไม่สำเร็จ:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecommendations();
  }, [isLoggedIn]);

  // ดึงรายการโปรดของผู้ใช้
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

  // เพิ่ม / ลบ รายการโปรด
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

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#3B261C] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* ส่วนหัวข้อ */}
        <div className="bg-white border border-[#EBE4D8] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-wider text-[#8C6D5E] uppercase">
              PERSONALIZED FOR YOU
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#3B261C]">
              หนังสือแนะนำสำหรับคุณ
            </h1>
            {userInterests.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-[#7A6A60]">หมวดหมู่ที่คุณสนใจ:</span>
                {userInterests.map((interest) => (
                  <span
                    key={interest}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-[#7A5644] text-white"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-[#7A6A60]">
                คุณยังไม่ได้เลือกหมวดหมู่ที่สนใจ กำลังแสดงหนังสือแนะนำทั้งหมดในระบบ
              </p>
            )}
          </div>

          <button
            onClick={() => navigate('/interests')}
            className="px-5 py-2.5 bg-[#FAF6EE] hover:bg-[#EBE4D8] text-[#4A2B1D] border border-[#D8CEBE] rounded-full text-xs font-semibold transition self-start md:self-auto flex-shrink-0"
          >
            ⚙️ แก้ไขความสนใจของฉัน
          </button>
        </div>

        {/* รายการหนังสือที่คัดสรรมาให้ */}
        {isLoading ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#EBE4D8]">
            <p className="text-[#8C533A] text-sm animate-pulse">
              กำลังคัดสรรหนังสือที่ตรงกับความสนใจของคุณ...
            </p>
          </div>
        ) : recommendedBooks.length > 0 ? (
          <div className="space-y-4">
            <p className="text-xs text-[#7A6A60]">
              พบหนังสือที่ตรงกับความสนใจของคุณทั้งหมด {recommendedBooks.length} เล่ม
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {recommendedBooks.map((book) => {
                const isFav = favorites.includes(book.id);
                const firstCategory =
                  Array.isArray(book.categories) && book.categories.length > 0
                    ? book.categories[0]
                    : book.category || 'ทั่วไป';

                return (
                  <div
                    key={book.id}
                    onClick={() => navigate(`/book/${book.id}`)}
                    className="group bg-white rounded-2xl p-4 border border-[#E8DCC4] shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#F4EFE6]">
                        <BookCover src={book.cover_url || book.cover} title={book.title} />

                        <span className="absolute top-2 left-2 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border bg-white/95 text-[#8C533A] border-[#E8DCC4]">
                          {firstCategory}
                        </span>

                        <button
                          onClick={(e) => toggleFavorite(e, book.id)}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/85 flex items-center justify-center text-rose-500 shadow-sm hover:scale-110 transition"
                        >
                          {isFav ? '💖' : '🤍'}
                        </button>
                      </div>

                      <div>
                        <h3 className="font-bold text-sm text-[#4A2B1D] truncate mt-1">
                          {book.title}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">ผู้แต่ง: {book.author}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#F4EFE6] mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-[#8C533A] bg-[#F4EFE6] px-2.5 py-0.5 rounded-full truncate max-w-[120px]">
                        ตรงกับแนวที่ชอบ
                      </span>
                      <span className="text-xs font-semibold text-[#8C533A] group-hover:underline flex-shrink-0">
                        รายละเอียด &gt;
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#EBE4D8] space-y-4">
            <p className="text-base font-bold text-[#4A2B1D]">
              ยังไม่มีหนังสือในหมวดหมู่ที่คุณเลือกในขณะนี้
            </p>
            <p className="text-xs text-gray-500">
              ลองเพิ่มหมวดหมู่ความสนใจอื่น หรือเลือกดูหนังสือทั้งหมดในคลังของเรา
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => navigate('/interests')}
                className="px-5 py-2.5 bg-[#7A5644] text-white rounded-full text-xs font-semibold hover:bg-[#5E4032] transition"
              >
                เลือกหมวดหมู่เพิ่มเติม
              </button>
              <button
                onClick={() => navigate('/explore')}
                className="px-5 py-2.5 bg-[#F4EFE6] text-[#4A2B1D] rounded-full text-xs font-semibold hover:bg-[#E8DCC4] transition"
              >
                ดูหนังสือทั้งหมด
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
export default Recommendations;