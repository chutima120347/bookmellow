import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../services/api';

const interestCategories = [
  'Fantasy',
  'Romance',
  'Mystery',
  'Science Fiction',
  'Thriller',
  'Horror',
  'Historical Fiction',
  'Self-Help',
  'Business',
  'Education',
  'Biography',
  'Young Adult',
  'Children',
  'Poetry',
  'Adventure',
];

function Onboarding() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSavedInterests = async () => {
      try {
        const savedLocal = localStorage.getItem('user_interests');
        if (savedLocal) {
          setSelectedCategories(JSON.parse(savedLocal));
        }

        if (isLoggedIn) {
          const res = await apiRequest('/api/user/interests');
          const apiInterests = Array.isArray(res) ? res : (res?.interests || res?.data || []);
          if (apiInterests.length > 0) {
            setSelectedCategories(apiInterests);
            localStorage.setItem('user_interests', JSON.stringify(apiInterests));
          }
        }
      } catch {
        // ใช้ค่าจาก localStorage ต่อได้
      }
    };

    loadSavedInterests();
  }, [isLoggedIn]);

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((item) => item !== cat) : [...prev, cat]
    );
  };

  const handleSaveInterests = async () => {
    if (selectedCategories.length === 0) {
      alert('กรุณาเลือกหมวดหมู่ที่สนใจอย่างน้อย 1 หมวดหมู่ค่ะ');
      return;
    }

    try {
      setIsSaving(true);
      localStorage.setItem('user_interests', JSON.stringify(selectedCategories));

      if (isLoggedIn) {
        try {
          await apiRequest('/api/user/interests', {
            method: 'POST',
            body: JSON.stringify({ interests: selectedCategories }),
          });
        } catch {
          // บันทึกลง localStorage ไว้แล้ว
        }
      }

      navigate('/recommendations');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#3B261C] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
        <div className="w-full bg-white rounded-3xl border border-[#EBE4D8] p-8 sm:p-10 shadow-sm space-y-8">
          <div className="space-y-2 text-center sm:text-left">
            <p className="text-xs font-semibold tracking-wider text-[#8C6D5E] uppercase">
              PERSONALIZE YOUR FEED
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#3B261C]">
              คุณชอบอ่านหนังสือแนวไหน?
            </h1>
            <p className="text-xs sm:text-sm text-[#7A6A60]">
              เลือกหมวดหมู่ที่สนใจอย่างน้อย 1 หมวดหมู่ เพื่อให้ระบบคัดสรรหนังสือที่ใช่สำหรับคุณ
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {interestCategories.map((cat) => {
              const isSelected = selectedCategories.includes(cat);
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium border transition ${
                    isSelected
                      ? 'bg-[#7A5644] text-white border-[#7A5644] shadow-sm'
                      : 'bg-[#FAF6EE] text-[#4A2B1D] border-[#E6DEC8] hover:border-[#8C6D5E]'
                  }`}
                >
                  {isSelected ? `✓ ${cat}` : cat}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#F3EFE8] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#7A6A60]">
              เลือกแล้ว <span className="font-bold text-[#4A2B1D]">{selectedCategories.length}</span> หมวดหมู่
            </p>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => navigate('/recommendations')}
                className="px-5 py-2.5 rounded-full text-xs font-medium text-[#7A6A60] hover:bg-[#FAF6EE] transition"
              >
                ข้ามไปก่อน
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveInterests}
                className="px-7 py-2.5 rounded-full bg-[#4A2B1D] hover:bg-[#633A27] text-white text-xs sm:text-sm font-semibold shadow-sm transition disabled:opacity-50"
              >
                {isSaving ? 'กำลังบันทึก...' : 'ดูหนังสือแนะนำของฉัน →'}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Onboarding;
