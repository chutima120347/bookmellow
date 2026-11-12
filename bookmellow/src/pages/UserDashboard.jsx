import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { User, Bookmark, Heart, Star } from 'react';
import { booksData } from '../data/data';
import BookCover from '../components/BookCover';

function UserDashboard() {
  const safeBooksData = Array.isArray(booksData) ? booksData : [];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A2B1D]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* โปรไฟล์ย่อ */}
        <div className="bg-white rounded-2xl p-6 border border-[#E8DCC4] shadow-sm flex items-center gap-4">
          <div className="w-16 h-16 bg-[#F4EFE6] border border-[#E8DCC4] rounded-full flex items-center justify-center text-[#8C533A]">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#4A2B1D]">สวัสดีค่ะ, blueii</h1>
            <p className="text-sm text-gray-500">ยินดีต้อนรับสู่ BookMellow</p>
          </div>
        </div>

        {/* สถิติส่วนตัว */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E8DCC4] shadow-sm flex items-center gap-4">
            <Bookmark className="w-8 h-8 text-[#8C533A]" />
            <div>
              <p className="text-xs text-gray-500">กำลังอ่าน</p>
              <p className="text-2xl font-bold text-[#4A2B1D]">3</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8DCC4] shadow-sm flex items-center gap-4">
            <Heart className="w-8 h-8 text-rose-500" />
            <div>
              <p className="text-xs text-gray-500">รายการโปรด</p>
              <p className="text-2xl font-bold text-[#4A2B1D]">5</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8DCC4] shadow-sm flex items-center gap-4">
            <Star className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-xs text-gray-500">รีวิวที่เขียน</p>
              <p className="text-2xl font-bold text-[#4A2B1D]">2</p>
            </div>
          </div>
        </div>

        {/* หนังสือแนะนำเฉพาะคุณ */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8DCC4] shadow-sm">
          <h2 className="text-lg font-bold text-[#4A2B1D] mb-4">หนังสือแนะนำสำหรับคุณ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {safeBooksData.slice(0, 3).map((book) => (
              <div key={book.id} className="border border-[#E8DCC4] bg-[#FDFBF7] p-3 rounded-xl flex gap-3 items-center">
                <div className="w-12 h-16 flex-shrink-0 overflow-hidden rounded bg-[#F4EFE6]">
                  <BookCover src={book.cover_url || book.cover} title={book.title} />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-semibold text-[#4A2B1D] truncate">{book.title}</h4>
                  <p className="text-xs text-gray-500 truncate">{book.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default UserDashboard;