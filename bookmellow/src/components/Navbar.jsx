import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoggedIn, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // ค้นหาหนังสือจากแถบ Navbar แล้วส่งไปหน้า Explore
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  // ออกจากระบบ
  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/auth');
  };

  // ตัวอักษรย่อสำหรับไอคอนโปรไฟล์
  const userInitial = user?.displayName
    ? user.displayName.charAt(0).toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 bg-[#4A2B1D] text-[#FDFBF7] shadow-md border-b border-[#633A27]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* โลโก้ BookMellow */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-[#FDFBF7] hover:text-[#E8DCC4] transition flex-shrink-0"
        >
          <span>📚</span>
          <span>BookMellow</span>
        </button>

        {/* เมนูนำทาง และ ช่องค้นหา */}
        <div className="flex items-center gap-4 sm:gap-6 flex-1 justify-end">
          <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium">
            <button
              onClick={() => navigate('/')}
              className={`transition hover:text-[#E8DCC4] ${
                location.pathname === '/' ? 'text-[#E8DCC4] font-bold underline underline-offset-4' : 'text-[#FDFBF7]/90'
              }`}
            >
              หน้าแรก
            </button>
            <button
              onClick={() => navigate('/explore')}
              className={`transition hover:text-[#E8DCC4] ${
                location.pathname === '/explore' ? 'text-[#E8DCC4] font-bold underline underline-offset-4' : 'text-[#FDFBF7]/90'
              }`}
            >
              ค้นหาหนังสือ
            </button>
            {isLoggedIn && (
              <button
                onClick={() => navigate('/favorites')}
                className={`transition hover:text-[#E8DCC4] ${
                  location.pathname === '/favorites' ? 'text-[#E8DCC4] font-bold underline underline-offset-4' : 'text-[#FDFBF7]/90'
                }`}
              >
                รายการโปรด
              </button>
            )}
            {isLoggedIn && user?.isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className={`px-3 py-1 rounded-full bg-[#8C533A] text-white text-xs font-semibold hover:bg-[#633A27] transition ${
                  location.pathname.startsWith('/admin') ? 'ring-2 ring-[#E8DCC4]' : ''
                }`}
              >
                👑 จัดการระบบ
              </button>
            )}
          </nav>

          {/* ช่องค้นหาด่วน */}
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-48 lg:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อหนังสือ, ผู้แต่ง..."
              className="w-full pl-8 pr-3 py-1.5 bg-[#633A27] border border-[#8C533A] rounded-full text-xs text-[#FDFBF7] placeholder-[#E8DCC4]/70 focus:outline-none focus:ring-1 focus:ring-[#E8DCC4]"
            />
            <span className="absolute left-2.5 top-1.5 text-xs text-[#E8DCC4]">🔍</span>
          </form>

          {/* ปุ่มโปรไฟล์ / เข้าสู่ระบบ */}
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                title="ข้อมูลส่วนตัว"
                className="w-9 h-9 rounded-full bg-[#8C533A] hover:bg-[#633A27] border border-[#E8DCC4]/50 flex items-center justify-center text-xs font-bold text-[#FDFBF7] shadow-sm transition"
              >
                {userInitial}
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-[#E8DCC4] py-2 text-xs text-[#4A2B1D] z-50">
                  <div className="px-4 py-2 border-b border-[#F4EFE6]">
                    <p className="font-bold truncate">{user?.displayName || 'นักอ่าน'}</p>
                    <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#F4EFE6] transition flex items-center gap-2"
                  >
                    <span>👤</span> โปรไฟล์ของฉัน
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/favorites');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#F4EFE6] transition flex items-center gap-2"
                  >
                    <span>💖</span> รายการโปรด
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      navigate('/explore');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#F4EFE6] transition flex items-center gap-2 md:hidden"
                  >
                    <span>🔍</span> ค้นหาหนังสือ
                  </button>

                  {user?.isAdmin && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/admin');
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#F4EFE6] text-[#8C533A] font-semibold transition flex items-center gap-2"
                    >
                      <span>👑</span> แผงควบคุม Admin
                    </button>
                  )}

                  <div className="border-t border-[#F4EFE6] mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 font-semibold transition flex items-center gap-2"
                    >
                      <span>🚪</span> ออกจากระบบ
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="px-4 py-1.5 bg-[#8C533A] hover:bg-[#633A27] border border-[#E8DCC4]/40 text-[#FDFBF7] rounded-full text-xs font-semibold transition shadow-sm flex-shrink-0"
            >
              เข้าสู่ระบบ
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
export default Navbar;