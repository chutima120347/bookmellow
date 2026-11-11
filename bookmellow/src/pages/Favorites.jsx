import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { booksData } from '../data/data';

function Favorites() {
  const navigate = useNavigate();
  const { isLoggedIn, member } = useAuth();

  // ดึงรายการ ID หนังสือที่ถูกใจ (ถ้าไม่มีให้ใช้ Array เปล่าเพื่อป้องกันหน้าขาว)
  const favoriteIds = member?.favorites || [];

  // กรองหนังสือที่มี ID ตรงกับรายการโปรด
  const favoriteBooks = (booksData || []).filter((book) =>
    favoriteIds.includes(book.id)
  );

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#4A3E3D]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <span>รายการโปรดของฉัน</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            หนังสือที่คุณบันทึกไว้ในดวงใจ ทั้งหมด {favoriteBooks.length} เล่ม
          </p>
        </div>

        {favoriteBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {favoriteBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate(`/book/${book.id}`)}
                className="group bg-white rounded-3xl p-3 sm:p-4 border border-pink-100 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#FAF7F0]">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-white/90 ${book.badgeColor || 'bg-pink-100 text-pink-600'}`}>
                      {book.badge || book.categoryName}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      ⭐ <span>{book.rating}</span>
                      <span className="text-slate-400 font-normal">({book.reviewsCount})</span>
                    </div>
                    <h3 className="font-bold text-sm truncate mt-1">{book.title}</h3>
                    <p className="text-xs text-slate-400 truncate">ผู้แต่ง: {book.author}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-pink-50 mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full truncate max-w-[110px]">
                    {book.recommendReason}
                  </span>
                  <span className="text-xs font-semibold text-pink-500 group-hover:underline">
                    อ่านเลย &gt;
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-pink-100 space-y-4">
            <div className="text-4xl">🌷</div>
            <h3 className="text-base font-bold text-[#4A3E3D]">ยังไม่มีหนังสือในรายการโปรด</h3>
            <p className="text-xs text-slate-400">กดไอคอนหัวใจ 💖 บนหนังสือที่ชอบเพื่อเก็บไว้ที่นี่ได้เลยน้า</p>
            <button
              onClick={() => navigate('/explore')}
              className="px-6 py-2.5 bg-[#FF9EAA] hover:bg-[#FF9EAA]/90 text-white text-xs font-semibold rounded-full shadow-sm transition">
              ไปเลือกดูหนังสือกันเลย
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
export default Favorites;