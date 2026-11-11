import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const allCategories = [
  { id: 'Fantasy', label: 'Fantasy' },
  { id: 'Romance', label: 'Romance' },
  { id: 'Mystery', label: 'Mystery' },
  { id: 'Science Fiction', label: 'Science Fiction' },
  { id: 'Thriller', label: 'Thriller' },
  { id: 'Horror', label: 'Horror' },
  { id: 'Historical Fiction', label: 'Historical Fiction' },
  { id: 'Self Help', label: 'Self Help' },
  { id: 'Business', label: 'Business' },
  { id: 'Education', label: 'Education' },
  { id: 'Biography', label: 'Biography' },
  { id: 'Young Adult', label: 'Young Adult' },
  { id: 'Children', label: 'Children' },
  { id: 'Poetry', label: 'Poetry' },
  { id: 'Adventure', label: 'Adventure' }
];

function Onboarding() {
  // ดึงค่าที่เคยเลือกไว้จาก localStorage (ถ้ามี)
  const savedInterests = JSON.parse(localStorage.getItem('user_interests')) || [];
  const [selectedCategories, setSelectedCategories] = useState(savedInterests);
  const navigate = useNavigate();

  const toggleCategory = (id) => {
    if (selectedCategories.includes(id)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== id));
    } else {
      setSelectedCategories([...selectedCategories, id]);
    }
  };

  const handleSave = () => {
    localStorage.setItem('user_interests', JSON.stringify(selectedCategories));
    alert('บันทึกความสนใจเรียบร้อยแล้ว! 🌸');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#4A3E3D]">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl p-8 border border-pink-100 shadow-sm text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">เลือกหมวดหมู่ตามความสนใจ</h1>
            <p className="text-xs text-slate-400">
              เลือกหมวดหมู่หนังสือที่คุณชอบเพื่อรับคำแนะนำที่ตรงใจ (เลือกได้หลายหมวดหมู่ และกลับมาแก้ไขได้ตลอดเวลา)
            </p>
          </div>

          {/* รายการหมวดหมู่ปุ่มกดเลือก */}
          <div className="flex flex-wrap justify-center gap-3 py-4">
            {allCategories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold border transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#FF9EAA] text-white border-[#FF9EAA] shadow-sm scale-105'
                      : 'bg-[#FAF7F0] text-[#4A3E3D] border-pink-100 hover:bg-pink-50'
                  }`}
                >
                  <span>{cat.label}</span>
                  {isSelected && <span>✓</span>}
                </button>
              );
            })}
          </div>

          {/* ปุ่มบันทึกความสนใจ */}
          <button
            onClick={handleSave}
            className="w-full py-3 bg-[#FF9EAA] hover:bg-[#FF9EAA]/90 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition">
            บันทึกความสนใจ ({selectedCategories.length} หมวดหมู่)
          </button>
        </div>
      </main>
    </div>
  );
}
export default Onboarding;