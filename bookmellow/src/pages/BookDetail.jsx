import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../services/api';
import BookCover from '../components/BookCover';

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewsList, setReviewsList] = useState([]);

  // ดึงข้อมูลรายละเอียดหนังสือ และสถานะรายการโปรด
  useEffect(() => {
    async function loadBookData() {
      try {
        setIsLoading(true);
        // 1. ดึงรายละเอียดหนังสือ (GET /api/books/{id})
        const bookRes = await apiRequest(`/api/books/${id}`);
        setBook(bookRes.data || bookRes);

        // 2. ดึงรีวิวของหนังสือ (GET /api/books/{id}/reviews)
        try {
          const reviewRes = await apiRequest(`/api/books/${id}/reviews`);
          setReviewsList(reviewRes.reviews || []);
        } catch (err) {
          console.error('Failed to load reviews:', err);
        }

        // 3. ตรวจสอบว่าเล่มนี้อยู่ในรายการโปรดหรือไม่ (ถ้าล็อกอินอยู่)
        if (isLoggedIn) {
          try {
            const favRes = await apiRequest('/api/me/favorites');
            const favs = favRes.data || [];
            setIsFavorite(favs.some((b) => String(b.id) === String(id)));
          } catch (err) {
            console.error('Failed to check favorites:', err);
          }
        }
      } catch (err) {
        console.error('Failed to load book detail:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadBookData();
    }
  }, [id, isLoggedIn]);

  // สลับสถานะเพิ่ม/ลบรายการโปรด
  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    try {
      if (isFavorite) {
        // DELETE /api/me/favorites/{book_id}
        await apiRequest(`/api/me/favorites/${book.id}`, { method: 'DELETE' });
        setIsFavorite(false);
      } else {
        // POST /api/me/favorites -> Payload: { book_id: book.id }
        await apiRequest('/api/me/favorites', {
          method: 'POST',
          body: JSON.stringify({ book_id: book.id }),
        });
        setIsFavorite(true);
      }
    } catch (err) {
      alert(err.message || 'เกิดข้อผิดพลาดในการอัปเดตรายการโปรด');
    }
  };

  // ส่งรีวิวใหม่ (POST /api/books/{id}/reviews)
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    if (!reviewComment.trim()) return;

    try {
      const res = await apiRequest(`/api/books/${id}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          rating: userRating,
          comment: reviewComment,
        }),
      });

      const newReview = res.review || {
        id: Date.now(),
        user_id: 'me',
        username: 'คุณ (นักอ่าน)',
        rating: userRating,
        comment: reviewComment,
        created_at: new Date().toISOString(),
      };

      setReviewsList([newReview, ...reviewsList]);
      setReviewComment('');
      alert('ขอบคุณสำหรับรีวิวสุดคิ้วท์น้า! 🌸');
    } catch (err) {
      alert(err.message || 'ไม่สามารถส่งรีวิวได้');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center text-xs text-slate-400">
        กำลังโหลดข้อมูลหนังสือ...
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex flex-col items-center justify-center space-y-4 text-[#4A3E3D]">
        <p className="text-sm font-bold">ไม่พบข้อมูลหนังสือเล่มนี้</p>
        <button
          onClick={() => navigate('/explore')}
          className="px-4 py-2 bg-[#FF9EAA] text-white rounded-full text-xs font-semibold"
        >
          กลับไปเลือกค้นหาหนังสือ
        </button>
      </div>
    );
  }

  const categoryText = Array.isArray(book.categories) && book.categories.length > 0
    ? book.categories.join(', ')
    : (book.category || 'ทั่วไป');

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#4A3E3D]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[240px] aspect-[3/4] rounded-2xl overflow-hidden shadow-md bg-[#FAF7F0]">
              <BookCover src={book.cover_url || book.cover} title={book.title} />
              
              <span className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full border bg-white/90 backdrop-blur-md bg-pink-100 text-pink-600">
                {Array.isArray(book.categories) && book.categories.length > 0 ? book.categories[0] : categoryText}
              </span>
            </div>

            <button
              onClick={handleToggleFavorite}
              className={`w-full max-w-[240px] mt-4 py-2.5 rounded-full font-semibold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 ${
                isFavorite 
                  ? 'bg-pink-100 text-pink-600 border border-pink-200' 
                  : 'bg-[#FF9EAA] hover:bg-[#FF9EAA]/90 text-white'
              }`}
            >
              <span>{isFavorite ? '💖 อยู่ในรายการโปรดแล้ว' : '🤍 เพิ่มลงรายการโปรด'}</span>
            </button>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div>
              <span className="text-xs px-3 py-1 bg-pink-50 text-pink-500 rounded-full border border-pink-100 font-semibold">
                หมวดหมู่: {categoryText}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold mt-2">{book.title}</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                โดย <span className="text-slate-600 font-medium">{book.author}</span>
                {book.published_year && ` | ปีที่พิมพ์: ${book.published_year}`}
              </p>
            </div>

            <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-pink-100">
              <h4 className="font-bold text-xs text-pink-500 flex items-center gap-1 mb-1">
                <span>🎯</span> เหตุผลที่แนะนำสำหรับคุณ
              </h4>
              <p className="text-xs text-slate-600">{book.reason || 'หนังสือฮีลใจยอดนิยม'}</p>
            </div>

            <div>
              <h3 className="font-bold text-sm mb-1">เรื่องย่อ</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed bg-white p-3 rounded-xl border border-gray-100">
                {book.description || book.synopsis || 'ไม่มีข้อมูลเรื่องย่อ'}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <span>💬</span> รีวิวและความคิดเห็นจากนักอ่าน
          </h3>

          <div className="bg-[#FAF7F0] p-4 sm:p-5 rounded-2xl border border-pink-100">
            {isLoggedIn ? (
              <form onSubmit={handleSubmitReview} className="space-y-3">
                <h4 className="font-semibold text-xs">เขียนรีวิวให้เรื่องนี้:</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">ให้คะแนน:</span>
                  <div className="flex gap-1 text-amber-400 text-lg cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} onClick={() => setUserRating(star)} className="hover:scale-110 transition">
                        {star <= userRating ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>

                <textarea
                  rows="3"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="แชร์ความรู้สึกของคุณหลังอ่านเรื่องนี้..."
                  required
                  className="w-full p-3 bg-white border border-pink-200 rounded-xl text-xs focus:outline-none"
                ></textarea>

                <button type="submit" className="px-5 py-2 bg-[#FF9EAA] hover:bg-[#FF9EAA]/90 text-white rounded-full text-xs font-semibold shadow-sm transition">
                  ส่งรีวิวสุดคิ้วท์ 🌸
                </button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-slate-500">🔒 กรุณาเข้าสู่ระบบก่อนเขียนรีวิวและให้คะแนนหนังสือ</p>
                <button onClick={() => setShowAuthModal(true)} className="px-4 py-1.5 bg-[#FF9EAA] text-white rounded-full text-xs font-semibold">
                  เข้าสู่ระบบเพื่อเขียนรีวิว
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {reviewsList.length > 0 ? (
              reviewsList.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-[#FAF7F0]/50 border border-pink-100/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-xs">
                        🌸
                      </div>
                      <div>
                        <h5 className="text-xs font-bold">{rev.username || rev.user || 'นักอ่าน'}</h5>
                        <span className="text-[10px] text-slate-400">
                          {rev.created_at ? new Date(rev.created_at).toLocaleDateString('th-TH') : (rev.date || 'วันนี้')}
                        </span>
                      </div>
                    </div>
                    <div className="text-amber-400 text-xs font-bold">
                      {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)} ({rev.rating}.0)
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">"{rev.comment}"</p>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-slate-400 py-4">ยังไม่มีรีวิวสำหรับหนังสือเล่มนี้ มารีวิวเป็นคนแรกกันนะ! 🌸</p>
            )}
          </div>
        </section>
      </main>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 text-center space-y-4 border-2 border-pink-100 shadow-lg">
            <h3 className="font-bold text-base">ต้องเข้าสู่ระบบก่อนใช้งาน</h3>
            <p className="text-xs text-slate-500">กรุณาเข้าสู่ระบบเพื่อบันทึกรายการโปรดและเขียนรีวิวหนังสือเล่มนี้</p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowAuthModal(false)} className="flex-1 py-2 bg-gray-100 text-slate-600 rounded-full text-xs font-semibold">ยกเลิก</button>
              <button onClick={() => { setShowAuthModal(false); navigate('/auth'); }} className="flex-1 py-2 bg-[#FF9EAA] text-white rounded-full text-xs font-semibold">ไปหน้าเข้าสู่ระบบ</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
export default BookDetail;