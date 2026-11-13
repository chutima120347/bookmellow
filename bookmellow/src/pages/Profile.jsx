import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../services/api';

function Profile() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();

  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    let ignore = false;
    async function loadProfileData() {
      try {
        setLoading(true);
        try {
          const meRes = await apiRequest('/api/auth/me');
          const meData = meRes?.user || meRes?.member || meRes?.data || meRes;
          if (!ignore && meData && (meData.email || meData.username || meData.displayName)) {
            setProfile(meData);
          }
        } catch {
          if (!ignore && user) {
            setProfile(user);
          }
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProfileData();
    return () => { ignore = true; };
  }, [isLoggedIn, user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayName = profile?.displayName || profile?.username || profile?.name || 'นักอ่าน BookMellow';
  const email = profile?.email || '-';
  const isAdmin = profile?.role === 'admin' || profile?.isAdmin === true;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#4A2B1D] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {loading && !profile ? (
          <div className="rounded-3xl border border-[#E6E0D6] bg-white p-14 text-center text-sm text-[#8C533A] animate-pulse">กำลังโหลดข้อมูลโปรไฟล์...</div>
        ) : (
          <>
            <section className="rounded-3xl border border-[#E6E0D6] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#4A2B1D] text-[#FDFBF7] flex items-center justify-center text-2xl sm:text-3xl font-bold flex-shrink-0">
                    {initial}
                  </div>

                  <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#1E1C1A]">{displayName}</h1>
                    <p className="text-xs sm:text-sm text-[#7A756E]">{email}</p>
                  </div>
                </div>

                <button
                  type="button" onClick={handleLogout}
                  className="w-full sm:w-auto rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-5 py-2.5 text-xs sm:text-sm font-semibold text-rose-600 transition">ออกจากระบบ</button>
              </div>
            </section>

            <section className="rounded-3xl border border-[#E6E0D6] bg-white p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-[#1E1C1A]">รายละเอียดบัญชี</h2>

              <div className="divide-y divide-[#F3EFE8] text-sm">
                <div className="py-3.5 flex items-center justify-between gap-4">
                  <span className="text-[#7A756E]">ชื่อที่แสดง</span>
                  <span className="font-semibold text-[#1E1C1A]">{displayName}</span>
                </div>

                <div className="py-3.5 flex items-center justify-between gap-4">
                  <span className="text-[#7A756E]">อีเมล</span>
                  <span className="font-semibold text-[#1E1C1A]">{email}</span>
                </div>

                <div className="py-3.5 flex items-center justify-between gap-4">
                  <span className="text-[#7A756E]">บทบาท (Role)</span>
                  <span className="font-semibold text-[#1E1C1A]">{isAdmin ? 'ผู้ดูแลระบบ (Admin)' : 'สมาชิก (Member)'}</span>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
export default Profile;