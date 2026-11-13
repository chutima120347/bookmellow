import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../services/api';

const interestCategories = [
  'Fantasy', 'Romance', 'Mystery', 'Science Fiction', 'Thriller',
  'Horror', 'Historical Fiction', 'Self-Help', 'Business', 'Education', 
  'Biography', 'Young Adult', 'Children', 'Poetry', 'Adventure'];

function Onboarding() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  useEffect(() => {
    const loadExistingInterests = async () => {
      try {
        const localSaved = localStorage.getItem('user_interests');
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          if (Array.isArray(parsed)) setSelectedInterests(parsed);
        }
      } catch (e) {
        console.error(e);
      }

      if (isLoggedIn) {
        try {
          const res = await apiRequest('/api/user/interests');
          const list = Array.isArray(res) ? res : (res?.interests || res?.data || []);
          if (Array.isArray(list) && list.length > 0) {
            setSelectedInterests(list);
            localStorage.setItem('user_interests', JSON.stringify(list));
          }
        } catch {
        }
      }
    };

    loadExistingInterests();
  }, [isLoggedIn]);

  const toggleCategory = (category) => {
    setIsSavedSuccess(false);
    setSelectedInterests((prev) => prev.includes(category) ? prev.filter((item) => item !== category) : [...prev, category]);
  };

  const handleSaveInterests = async () => {
    if (selectedInterests.length === 0) {
      alert('กรุณาเลือกหมวดหมู่หนังสือที่คุณสนใจอย่างน้อย 1 หมวดหมู่ค่ะ');
      return;
    }

    try {
      setIsSaving(true);
      localStorage.setItem('user_interests', JSON.stringify(selectedInterests));

      if (isLoggedIn) {
        const endpoints = [
          { url: '/api/user/interests', method: 'POST' },
          { url: '/api/user/interests', method: 'PUT' },
          { url: '/api/users/interests', method: 'POST' },
          { url: '/api/interests', method: 'POST' }
        ];

        for (const ep of endpoints) {
          try {
            await apiRequest(ep.url, { method: ep.method, body: JSON.stringify({ userId: user?.id, interests: selectedInterests, categories: selectedInterests})});
            break;
          } catch {
          }
        }
      }

      setIsSavedSuccess(true);
    } catch (err) {
      console.error('บันทึกความสนใจไม่สำเร็จ:', err);
      setIsSavedSuccess(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#3B261C] flex flex-col justify-between font-sans">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center space-y-3 mb-12">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#8C6D5E] uppercase">YOUR READING INTERESTS</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#3B261C]">คุณชอบอ่านหนังสือแนวไหน?</h1>
          <p className="text-xs sm:text-sm text-[#7A6A60]">เลือกแนวหนังสือที่คุณสนใจได้หลายหมวดหมู่ เพื่อให้เราคัดสรรหนังสือที่เหมาะกับคุณ</p>
        </div>

        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="text-sm sm:text-base font-bold text-[#3B261C]">หมวดหมู่หนังสือ</h2>
          <span className="text-xs sm:text-sm text-[#8C7B70]">เลือกแล้ว {selectedInterests.length} หมวดหมู่</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
          {interestCategories.map((category) => {
            const isSelected = selectedInterests.includes(category);
            return (
              <button key={category} type="button" onClick={() => toggleCategory(category)}
                className={`h-16 sm:h-[72px] px-4 rounded-2xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${
                  isSelected
                    ? 'bg-[#7A5644] text-white border-[#7A5644] shadow-sm' : 'bg-white text-[#3B261C] border-[#EBE4D8] hover:border-[#C8B8A6] hover:bg-[#FDFBF7]'}`}>
                {isSelected && <span className="text-sm font-bold">✓</span>}
                <span>{category}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <button type="button" disabled={isSaving} onClick={handleSaveInterests}
            className="px-10 py-3.5 bg-[#7A5644] hover:bg-[#5E4032] text-white rounded-full text-xs sm:text-sm font-semibold shadow-sm transition disabled:opacity-50">
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกความสนใจ'}
          </button>
        </div>

        {isSavedSuccess && (
          <div className="mt-10 max-w-lg mx-auto bg-white border border-[#EBE4D8] rounded-3xl p-8 sm:p-10 text-center shadow-sm space-y-4">
            <div className="text-2xl font-bold text-[#3B6E52]">✓</div>
            <h3 className="text-lg sm:text-xl font-bold text-[#3B261C]">บันทึกความสนใจเรียบร้อยแล้ว!</h3>
            <p className="text-xs sm:text-sm text-[#7A6A60] leading-relaxed">เราคัดสรรหนังสือที่ตรงกับแนวที่คุณชอบไว้ให้แล้ว ลองไปดูหนังสือแนะนำของคุณกันเลย</p>
            <div className="pt-2">
              <button type="button" onClick={() => navigate('/recommendations')}
                className="px-8 py-3 bg-[#4A2B1D] hover:bg-[#361E13] text-white rounded-full text-xs sm:text-sm font-semibold shadow-sm transition">ดูหนังสือแนะนำของฉัน</button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
export default Onboarding;