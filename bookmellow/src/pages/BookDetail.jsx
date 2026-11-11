import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { booksData } from '../data/data';

function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const safeBooksData = Array.isArray(booksData) ? booksData : [];
  const book = safeBooksData.find((b) => b.id === Number(id)) || safeBooksData[0] || {};

  const [isFavorite, setIsFavorite] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewsList, setReviewsList] = useState([
    {
      id: 1,
      user: 'คุณแมวน้ำปุกปุย',
      avatar: '🐱',
      rating: 5,
      comment: 'อ่านแล้วอบอุ่นหัวใจมากกก! ฟีลกู๊ดสุดๆ ตัวละครน่ารักทุกตัวเลยค่ะ 🌸',
      date: '10 พ.ย. 2026',
    },
  ]);

  const handleToggleFavorite = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    setIsFavorite(!isFavorite);
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    if (!reviewComment.trim()) return;

    const newReview = {
      id: Date.now(),
      user: 'คุณ (นักอ่าน)',
      avatar: '🌸',
      rating: userRating,
      comment: reviewComment,
      date: 'วันนี้',
    };

    setReviewsList([newReview, ...reviewsList]);
    setReviewComment('');
    alert('ขอบคุณสำหรับรีวิวสุดคิ้วท์น้า! 🌸');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#4A3E3D]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-sm grid md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <div className="relative w-full max-w-[240px] aspect-[3/4] rounded-2xl overflow-hidden shadow-md bg-[#FAF7F0]">
              <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
              <span className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full border bg-white/90 backdrop-blur-md ${book.badgeColor || 'bg-pink-100 text-pink-600'}`}>
                {book.categoryName || book.category}
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
                หมวดหมู่: {book.categoryName || book.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold mt-2">{book.title}</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                โดย <span className="text-slate-600 font-medium">{book.author}</span> | สำนักพิมพ์: <span className="text-slate-600 font-medium">{book.publisher || 'BookMellow'}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-amber-500 font-bold text-base">⭐ {book.rating}</span>
              <span className="text-slate-400 text-xs">({book.reviewsCount || reviewsList.length} รีวิวจากผู้ใช้)</span>
            </div>

            <div className="bg-[#FAF7F0] p-4 rounded-2xl border border-pink-100">
              <h4 className="font-bold text-xs text-pink-500 flex items-center gap-1 mb-1">
                <span>🎯</span> เหตุผลที่แนะนำสำหรับคุณ
              </h4>
              <p className="text-xs text-slate-600">{book.recommendReason || 'หนังสือฮีลใจยอดนิยม'}</p>
            </div>

            <div>
              <h3 className="font-bold text-sm mb-1">เรื่องย่อ</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed bg-white p-3 rounded-xl border border-gray-100">
                {book.synopsis || 'ไม่มีข้อมูลเรื่องย่อ'}
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
            {reviewsList.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-[#FAF7F0]/50 border border-pink-100/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-pink-100 flex items-center justify-center text-xs">
                      {rev.avatar}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold">{rev.user}</h5>
                      <span className="text-[10px] text-slate-400">{rev.date}</span>
                    </div>
                  </div>
                  <div className="text-amber-400 text-xs font-bold">
                    {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)} ({rev.rating}.0)
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">"{rev.comment}"</p>
              </div>
            ))}
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