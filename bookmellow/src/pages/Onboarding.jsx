import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/api';

function Onboarding() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        // 1. ดึงหมวดหมู่ทั้งหมด
        const catRes = await apiRequest('/api/categories');
        setCategories(catRes.data || []);

        // 2. ดึง Preferences ปัจจุบัน
        const prefRes = await apiRequest('/api/me/preferences');
        if (prefRes.data) {
          setSelectedCategoryIds(prefRes.data.map((c) => c.id));
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleCategory = (catId) => {
    if (selectedCategoryIds.includes(catId)) {
      setSelectedCategoryIds(selectedCategoryIds.filter((id) => id !== catId));
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, catId]);
    }
  };

  const handleSavePreferences = async () => {
    try {
      // 3. ส่ง Payload เป็น category_ids Array ของ Category UUID
      await apiRequest('/api/me/preferences', {
        method: 'PUT',
        body: JSON.stringify({ category_ids: selectedCategoryIds }),
      });
      alert('บันทึกความสนใจเรียบร้อยแล้วค่ะ!');
      navigate('/');
    } catch (err) {
      alert(err.message || 'บันทึกข้อมูลไม่สำเร็จ');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center text-xs text-slate-400">กำลังโหลด...</div>;
  }

  return (
    <div className="min-h-screen bg-[#FAF7F0] p-6 max-w-2xl mx-auto space-y-6 text-[#4A3E3D]">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">เลือกหมวดหมู่หนังสือที่คุณสนใจ</h1>
        <p className="text-xs text-slate-400">ระบบจะนำหมวดหมู่นี้ไปจัดหนังสือแนะนำฮีลใจให้คุณ</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const isSelected = selectedCategoryIds.includes(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => toggleCategory(cat.id)}
              className={`p-3 rounded-2xl text-xs font-semibold border transition ${
                isSelected
                  ? 'bg-[#FF9EAA] text-white border-[#FF9EAA] shadow-sm'
                  : 'bg-white text-slate-600 border-pink-100 hover:bg-pink-50'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleSavePreferences}
        className="w-full py-3 bg-[#FF9EAA] hover:bg-[#FF9EAA]/90 text-white font-bold text-xs rounded-2xl shadow-md"
      >
        บันทึกและเริ่มต้นใช้งาน
      </button>
    </div>
  );
}
export default Onboarding;