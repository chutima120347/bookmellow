import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../services/api';

function Profile() {
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();

  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(true);

  // State สำหรับแก้ไขชื่อที่แสดง
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/auth');
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
            setNewName(meData.displayName || meData.username || meData.name || '');
          }
        } catch {
          if (!ignore && user) {
            setProfile(user);
            setNewName(user.displayName || user.username || user.name || '');
          }
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadProfileData();
    return () => { ignore = true; };
  }, [isLoggedIn, user, navigate]);

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      setSavingName(true);
      try {
        await apiRequest('/api/user/profile', {
          method: 'PUT',
          body: JSON.stringify({ displayName: newName.trim(), username: newName.trim() }),
        });
      } catch {
        // อัปเดตในหน้าเว็บและ localStorage แม้ backend ยังไม่มี endpoint แก้ชื่อ
      }

      const updatedProfile = { ...profile, displayName: newName.trim(), username: newName.trim() };
      setProfile(updatedProfile);
      localStorage.setItem('user', JSON.stringify(updatedProfile));
      setIsEditingName(false);
    } finally {
      setSavingName(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const displayName = profile?.displayName || profile?.username || profile?.name || 'นักอ่าน BookMellow';
  const email = profile?.email || '-';
  const isAdmin = profile?.role === 'admin' || profile?.isAdmin === true;
  const roleLabel = isAdmin ? 'Admin' : 'Member';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#4A2B1D] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {loading && !profile ? (
          <div className="rounded-3xl border border-[#E6E0D6] bg-white p-14 text-center text-sm text-[#8C533A] animate-pulse">
            กำลังโหลดข้อมูลโปรไฟล์...
          </div>
        ) : (
          <>
            {/* 1. Profile Header Card */}
            <section className="rounded-3xl border border-[#E6E0D6] bg-white overflow-hidden shadow-sm">
              {/* แถบสีด้านบน */}
              <div className="h-28 sm:h-32 bg-gradient-to-r from-[#4A2B1D] via-[#6B3F2B] to-[#8C533A]" />

              <div className="px-6 sm:px-8 pb-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14">
                  {/* Avatar + ชื่อ + บทบาท + อีเมล */}
                  <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white bg-[#4A2B1D] text-[#FDFBF7] flex items-center justify-center text-3xl sm:text-4xl font-bold shadow-md flex-shrink-0">
                      {initial}
                    </div>

                    <div className="space-y-1 pb-1">
                      {isEditingName ? (
                        <form onSubmit={handleSaveName} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="rounded-xl border border-[#8C533A] bg-[#FAF7F2] px-3 py-1.5 text-base font-bold text-[#1E1C1A] focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="submit"
                            disabled={savingName}
                            className="rounded-xl bg-[#4A2B1D] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#633A27]"
                          >
                            {savingName ? '...' : 'บันทึก'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditingName(false);
                              setNewName(displayName);
                            }}
                            className="rounded-xl border border-[#E6E0D6] px-3 py-1.5 text-xs text-[#7A756E] hover:bg-[#FAF7F2]"
                          >
                            ยกเลิก
                          </button>
                        </form>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h1 className="text-2xl font-bold text-[#1E1C1A]">
                            {displayName} <span className="text-base font-medium text-[#7A756E]">(คุณ)</span>
                          </h1>
                          <span
                            className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                              isAdmin
                                ? 'bg-[#4A2B1D] text-[#FDFBF7]'
                                : 'bg-[#F3EFE8] text-[#6B5A4E] border border-[#E6DEC8]'
                            }`}
                          >
                            {roleLabel}
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsEditingName(true)}
                            className="text-xs text-[#8C533A] hover:underline ml-1"
                          >
                            แก้ไขชื่อ
                          </button>
                        </div>
                      )}

                      <p className="text-xs sm:text-sm text-[#7A756E]">{email}</p>
                    </div>
                  </div>

                  {/* ปุ่มจัดการด้านขวา */}
                  <div className="flex flex-col sm:items-end gap-2 pt-2 sm:pt-0">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full sm:w-auto rounded-xl border border-[#E6E0D6] bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 px-5 py-2 text-xs sm:text-sm font-medium text-[#5C4D44] transition"
                    >ออกจากระบบ</button>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. การ์ดรายละเอียดบัญชี */}
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
                  <span className="text-[#7A756E]">บทบาท</span>
                  <span className="font-semibold text-[#1E1C1A]">
                    {isAdmin ? 'ผู้ดูแลระบบ (Admin)' : 'สมาชิก (Member)'}
                  </span>
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