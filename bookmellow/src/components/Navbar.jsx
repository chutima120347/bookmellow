import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { booksData } from '../data/data';

function Navbar() {
  const { isLoggedIn, isAdmin, member, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // ป้องกัน Error หาก booksData ยังไม่ได้โหลดเป็น Array
  const safeBooksData = Array.isArray(booksData) ? booksData : [];

  const searchResults = safeBooksData.filter((book) =>
    searchTerm.trim() !== '' &&
    (book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     book.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F0]/90 backdrop-blur-md border-b border-pink-100 px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* โลโก้ฝั่งซ้าย */}
        <Link to="/" className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-[#4A3E3D] flex-shrink-0">
          📚 <span>Bookmellow</span>
        </Link>

        {/* ฝั่งขวา: เมนู + ช่องค้นหา + ปุ่มสมาชิก */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          <nav className="flex items-center gap-3 sm:gap-4 text-xs font-medium">
            <Link to="/" className="hover:text-pink-500 transition text-[#4A3E3D]">หน้าแรก</Link>
            <Link to="/explore" className="hover:text-pink-500 transition text-[#4A3E3D]">ค้นหาหนังสือ</Link>
            {isLoggedIn && (
              <>
                <Link to="/onboarding" className="hover:text-pink-500 transition text-[#4A3E3D]">เลือกความสนใจ</Link>
                <Link to="/favorites" className="hover:text-pink-500 transition text-[#4A3E3D]">รายการโปรด</Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" className="px-2.5 py-1 bg-purple-100 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-200 transition">
                👑 Admin
              </Link>
            )}
          </nav>

          {/* ช่องค้นหาฝั่งขวา */}
          <div className="relative w-44 sm:w-60 hidden sm:block">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง..."
              className="w-full px-4 py-1.5 pl-8 bg-white border border-pink-100 rounded-full text-xs text-[#4A3E3D] placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-pink-300 shadow-sm"
            />
            <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">🔍</span>

            {/* Dropdown แสดงผลค้นหาเรียลไทม์ */}
            {isOpen && searchResults.length > 0 && (
              <div className="absolute top-9 right-0 w-72 bg-white rounded-2xl shadow-lg border border-pink-100 py-2 z-50 max-h-72 overflow-y-auto">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 border-b border-pink-50">
                  ผลการค้นหา ({searchResults.length} เล่ม)
                </div>
                {searchResults.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => {
                      navigate(`/book/${book.id}`);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className="px-3 py-2 hover:bg-pink-50 flex items-center gap-3 cursor-pointer transition"
                  >
                    <img src={book.cover} alt={book.title} className="w-8 h-10 object-cover rounded-md flex-shrink-0" />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-[#4A3E3D] truncate">{book.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">ผู้แต่ง: {book.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* สัญลักษณ์โปรไฟล์ / ปุ่มล็อกอิน */}
          <div className="flex items-center gap-2 border-l border-pink-100 pl-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#FF9EAA] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {member?.displayName?.charAt(0) || 'U'}
                </div>
                <button onClick={() => { logout(); navigate('/'); }} className="text-xs text-pink-500 hover:underline">
                  ออก
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="w-7 h-7 rounded-full bg-[#FF9EAA] text-white flex items-center justify-center text-xs font-bold shadow-sm hover:scale-105 transition"
              >
                U
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
export default Navbar;