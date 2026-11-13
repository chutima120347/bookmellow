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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setIsLoading(true);
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
          }
        }

        const booksRes = await apiRequest('/api/books');
        const allBooks = Array.isArray(booksRes) ? booksRes : (booksRes?.books || booksRes?.data || []);

        if (interests.length > 0) {
          const normalizedInterests = interests.map((i) => i.toLowerCase().trim());
          const matched = allBooks.filter((book) => {
            const bookCats = Array.isArray(book.categories) ? book.categories : [book.category || ''];
            return bookCats.some((cat) => normalizedInterests.includes(String(cat).toLowerCase().trim()));
          });
          setRecommendedBooks(matched);
        } else {
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

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#3B261C] flex flex-col justify-between font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#3B261C]">หนังสือที่แนะนำสำหรับคุณ</h1>
          <p className="text-xs sm:text-sm text-[#7A6A60]">
            {isLoading ? 'กำลังค้นหาหนังสือที่ตรงกับความสนใจ...' : `พบหนังสือที่ตรงกับความสนใจ ${recommendedBooks.length} เล่ม`}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#EBE4D8]">
            <p className="text-[#8C533A] text-sm animate-pulse">กำลังคัดสรรหนังสือที่ตรงกับความสนใจของคุณ...</p>
          </div>
        ) : recommendedBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedBooks.map((book) => {
              const bookCategories =
                Array.isArray(book.categories) && book.categories.length > 0 ? book.categories : book.category ? [book.category] : [];

              const publishYear = book.published_year || book.publish_year || book.year || '';

              return (
                <div
                  key={book.id}
                  onClick={() => navigate(`/book/${book.id}`)}
                  className="group bg-white rounded-2xl border border-[#EAE2D6] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition cursor-pointer flex flex-col justify-between">
                  <div>
                    <div className="bg-[#EAE2D6] p-5 flex items-center justify-center">
                      <div className="w-36 sm:w-40 aspect-[2/3] rounded-md overflow-hidden shadow-md bg-[#F4EFE6]">
                        <BookCover src={book.cover_url || book.cover} title={book.title}/>
                      </div>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <h2 className="font-bold text-base text-[#2D1E16] line-clamp-1 group-hover:text-[#7A5644] transition"> {book.title}</h2>
                      <p className="text-xs text-[#7A6A60] line-clamp-1">ผู้แต่ง: {book.author || 'ไม่ระบุผู้แต่ง'}</p>
                      <p className="text-xs text-[#5C4D44] leading-relaxed line-clamp-2 min-h-[2.5rem]">{book.description || book.reason || 'ไม่มีคำอธิบายเพิ่มเติม'}</p>

                      {bookCategories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {bookCategories.map((cat, idx) => (
                            <span key={idx}
                              className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EBE4D8] text-[#5C493E]">{cat}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-5 pb-4 pt-1">
                    <p className="text-[11px] text-[#8C7B70]">{publishYear ? `ปีที่ตีพิมพ์: ${publishYear}` : ''}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#EBE4D8] space-y-4">
            <p className="text-base font-bold text-[#4A2B1D]">ยังไม่มีหนังสือในหมวดหมู่ที่คุณเลือกในขณะนี้</p>
            <p className="text-xs text-gray-500">ลองเลือกดูหนังสือทั้งหมดในคลังของเรา</p>
            <div className="pt-2 flex justify-center">
              <button onClick={() => navigate('/explore')}
                className="px-6 py-2.5 bg-[#7A5644] text-white rounded-full text-xs font-semibold hover:bg-[#5E4032] transition">ดูหนังสือทั้งหมด</button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
export default Recommendations;