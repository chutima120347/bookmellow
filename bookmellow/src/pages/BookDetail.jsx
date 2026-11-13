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
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    async function loadBookData() {
      try {
        setIsLoading(true);
        let foundBook = null;
        try {
          const bookRes = await apiRequest(`/api/books/${id}`);
          foundBook = bookRes?.book || bookRes?.data || bookRes;
        } catch (apiErr) {
          try {
            const allRes = await apiRequest('/api/books');
            const allBooks = Array.isArray(allRes) ? allRes : (allRes?.books || allRes?.data || []);
            foundBook = allBooks.find((b) => String(b.id) === String(id));
          } catch (fallbackErr) {
            console.error('Failed to load books from backend:', fallbackErr);
          }
        }

        setBook(foundBook && foundBook.id ? foundBook : null);

        try {
          const reviewRes = await apiRequest(`/api/books/${id}/reviews`);
          setReviewsList(reviewRes?.reviews || reviewRes?.data || (Array.isArray(reviewRes) ? reviewRes : []));
        } catch (err) { setReviewsList([]); }

        if (isLoggedIn) {
          try {
            const favRes = await apiRequest('/api/me/favorites');
            const favs = Array.isArray(favRes) ? favRes : (favRes?.favorites || favRes?.data || []);
            setIsFavorite(favs.some((b) => String(b.id || b.book_id) === String(id)));
          } catch (err) {
            console.error('Failed to check favorites:', err);
          }
        }
      } catch (err) { console.error('Failed to load book detail:', err);
      } finally { setIsLoading(false); }
    }

    if (id) {
      loadBookData();
    }
  }, [id, isLoggedIn]);

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    try {
      if (isFavorite) {
        await apiRequest(`/api/me/favorites/${book.id}`, { method: 'DELETE' });
        setIsFavorite(false);
      } else {
        await apiRequest('/api/me/favorites', {
          method: 'POST', body: JSON.stringify({ book_id: book.id }),
        });
        setIsFavorite(true);
      }
    } catch (err) { setIsFavorite(!isFavorite); }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    if (!reviewComment.trim()) return;

    const newReview = { id: Date.now(), user_id: 'me', username: 'คุณ', rating: userRating, comment: reviewComment, created_at: new Date().toISOString() };

    try {
      await apiRequest(`/api/books/${id}/reviews`, {
        method: 'POST', body: JSON.stringify({ rating: userRating, comment: reviewComment }),});
    } catch (err) { console.warn('API review failed, adding locally'); }

    setReviewsList([newReview, ...reviewsList]);
    setReviewComment('');
    alert('ขอบคุณสำหรับรีวิว!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center text-xs text-gray-400">กำลังโหลดข้อมูลหนังสือ...</div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center space-y-4 text-[#4A2B1D]">
        <p className="text-sm font-bold">ไม่พบข้อมูลหนังสือเล่มนี้</p>
        <button
          onClick={() => navigate('/explore')}
          className="px-5 py-2 bg-[#8C533A] text-white rounded-full text-xs font-semibold hover:bg-[#633A27] transition">กลับไปค้นหาหนังสือ</button>
      </div>
    );
  }

  const categoryText = Array.isArray(book.categories) && book.categories.length > 0
    ? book.categories.join(', ') : (book.category || 'ทั่วไป');

  const mainCategory = Array.isArray(book.categories) && book.categories.length > 0
    ? book.categories[0] : categoryText;

  const averageRating = reviewsList.length > 0
    ? (reviewsList.reduce((acc, r) => acc + (r.rating || 5), 0) / reviewsList.length).toFixed(1) : (book.rating || '4.8');

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A2B1D] font-sans">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCC4] shadow-sm grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-full max-w-[240px] aspect-[3/4] rounded-2xl overflow-hidden shadow-md bg-[#F4EFE6] border border-[#E8DCC4]">
              {BookCover ? ( <BookCover src={book.cover_url || book.cover} title={book.title} />
              ) : (
                <img src={book.cover_url || book.cover} alt={book.title} className="w-full h-full object-cover"/>)}
              
              <span className="absolute top-3 left-3 text-[11px] font-semibold px-3 py-1 rounded-full border bg-white/95 text-[#8C533A] border-[#E8DCC4] shadow-sm">{mainCategory}</span>
            </div>

            <button
              onClick={handleToggleFavorite}
              className={`w-full max-w-[240px] py-2.5 rounded-full font-semibold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 ${
                isFavorite 
                  ? 'bg-[#F4EFE6] text-[#8C533A] border border-[#E8DCC4]' : 'bg-[#8C533A] hover:bg-[#633A27] text-white'}`}>
              <span>{isFavorite ? '💖 อยู่ในรายการโปรดแล้ว' : '🤍 เพิ่มลงรายการโปรด'}</span>
            </button>
          </div>

          <div className="md:col-span-2 space-y-5">
            <div>
              <span className="text-xs px-3 py-1 bg-[#F4EFE6] text-[#8C533A] rounded-full border border-[#E8DCC4] font-semibold">หมวดหมู่: {categoryText}</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#4A2B1D] mt-3 leading-snug">{book.title}</h1>
              {book.subtitle && ( <p className="text-xs sm:text-sm text-gray-500 mt-1">{book.subtitle}</p>)}
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                ผู้เขียน: <span className="text-[#633A27] font-semibold">{book.author}</span>
                {book.publisher && ` | สำนักพิมพ์: ${book.publisher}`}
                {book.published_year && ` | ปีที่พิมพ์: ${book.published_year}`}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-amber-500 bg-[#FDFBF7] p-3 rounded-xl border border-[#E8DCC4] w-fit">
              <span className="text-sm">★</span>
              <span className="font-bold text-[#4A2B1D] text-sm">{averageRating}</span>
              <span className="text-gray-400">({reviewsList.length} รีวิวจากผู้อ่าน)</span>
            </div>

            <div className="bg-[#F4EFE6] p-4 rounded-2xl border border-[#E8DCC4]">
              <h4 className="font-bold text-xs text-[#8C533A] flex items-center gap-1.5 mb-1">เหตุผลที่แนะนำสำหรับคุณ</h4>
              <p className="text-xs text-gray-700 leading-relaxed">
                {book.reason || book.recommendation_reason || 'หนังสือฮีลใจและสร้างแรงบันดาลใจยอดนิยม'}
              </p>
            </div>
          </div>
        </div>

        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCC4] shadow-sm space-y-6">
          <div className="flex border-b border-[#E8DCC4] gap-6 text-xs sm:text-sm font-bold">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-3 transition relative ${
                activeTab === 'description' ? 'text-[#8C533A] border-b-2 border-[#8C533A]' : 'text-gray-400 hover:text-[#4A2B1D]'}`}>เรื่องย่อ</button>
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-3 transition relative ${
                activeTab === 'details' ? 'text-[#8C533A] border-b-2 border-[#8C533A]' : 'text-gray-400 hover:text-[#4A2B1D]'}`}>ข้อมูลหนังสือ</button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 transition relative ${
                activeTab === 'reviews' ? 'text-[#8C533A] border-b-2 border-[#8C533A]' : 'text-gray-400 hover:text-[#4A2B1D]'}`}>รีวิวจากผู้อ่าน ({reviewsList.length})</button>
          </div>

          {activeTab === 'description' && (
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-[#FDFBF7] p-5 rounded-2xl border border-[#E8DCC4]/60 whitespace-pre-line">
                {book.description || book.synopsis || 'ยังไม่มีข้อมูลเรื่องย่อสำหรับหนังสือเล่มนี้'}
              </p>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-700 bg-[#FDFBF7] p-5 rounded-2xl border border-[#E8DCC4]/60">
              <p><strong>ชื่อเรื่อง:</strong> {book.title}</p>
              <p><strong>ผู้แต่ง:</strong> {book.author}</p>
              <p><strong>สำนักพิมพ์:</strong> {book.publisher || '-'}</p>
              <p><strong>หมวดหมู่:</strong> {categoryText}</p>
              <p><strong>จำนวนหน้า:</strong> {book.pages ? `${book.pages} หน้า` : '-'}</p>
              <p><strong>เลข ISBN:</strong> {book.isbn || '-'}</p>
              <p><strong>ปีที่พิมพ์:</strong> {book.published_year || '-'}</p>
              <p><strong>ภาษา:</strong> {book.language || 'ภาษาไทย'}</p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="bg-[#F4EFE6] p-5 rounded-2xl border border-[#E8DCC4]">
                {isLoggedIn ? (
                  <form onSubmit={handleSubmitReview} className="space-y-3">
                    <h4 className="font-semibold text-xs text-[#4A2B1D]">เขียนรีวิวให้เรื่องนี้:</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">ให้คะแนน:</span>
                      <div className="flex gap-1 text-amber-500 text-lg cursor-pointer">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star} onClick={() => setUserRating(star)} className="hover:scale-110 transition">
                            {star <= userRating ? '★' : '☆'}
                          </span>
                        ))}
                      </div>
                    </div>
                    <textarea
                      rows="3" value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="แชร์ความรู้สึกของคุณหลังอ่านเรื่องนี้..." required
                      className="w-full p-3 bg-white border border-[#E8DCC4] rounded-xl text-xs text-[#4A2B1D] focus:outline-none focus:ring-1 focus:ring-[#8C533A]">
                    </textarea>
                    <button type="submit" className="px-5 py-2 bg-[#8C533A] hover:bg-[#633A27] text-white rounded-full text-xs font-semibold shadow-sm transition">ส่งรีวิว</button>
                  </form>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-xs text-gray-600">กรุณาเข้าสู่ระบบก่อนเขียนรีวิวและให้คะแนนหนังสือ</p>
                    <button onClick={() => setShowAuthModal(true)} className="px-4 py-1.5 bg-[#8C533A] text-[#FDFBF7] rounded-full text-xs font-semibold hover:bg-[#633A27] transition">เข้าสู่ระบบเพื่อเขียนรีวิว</button>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {reviewsList.length > 0 ? (
                  reviewsList.map((rev) => {
                    const currentRating = Math.max(0, Math.min(5, rev.rating || 5));
                    return (
                      <div key={rev.id} className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E8DCC4] space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#F4EFE6] border border-[#E8DCC4] flex items-center justify-center text-xs">
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-[#4A2B1D]">{rev.username || rev.user || 'นักอ่าน'}</h5>
                              <span className="text-[10px] text-gray-400">
                                {rev.created_at ? new Date(rev.created_at).toLocaleDateString('th-TH') : (rev.date || 'วันนี้')}
                              </span>
                            </div>
                          </div>
                          <div className="text-amber-500 text-xs font-bold">
                            {'★'.repeat(currentRating)}{'☆'.repeat(5 - currentRating)} ({currentRating}.0)
                          </div>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed pl-10">"{rev.comment}"</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-xs text-gray-400 py-6">ยังไม่มีรีวิวสำหรับหนังสือเล่มนี้ มารีวิวเป็นคนแรกกันนะ!</p>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center space-y-4 border border-[#E8DCC4] shadow-lg">
            <h3 className="font-bold text-base text-[#4A2B1D]">ต้องเข้าสู่ระบบก่อนใช้งาน</h3>
            <p className="text-xs text-gray-500">กรุณาเข้าสู่ระบบเพื่อบันทึกรายการโปรดและเขียนรีวิวหนังสือเล่มนี้</p>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowAuthModal(false)} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold hover:bg-gray-200 transition">ยกเลิก</button>
              <button onClick={() => { setShowAuthModal(false); navigate('/auth'); }} className="flex-1 py-2 bg-[#8C533A] text-white rounded-full text-xs font-semibold hover:bg-[#633A27] transition">ไปหน้าเข้าสู่ระบบ</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
export default BookDetail;