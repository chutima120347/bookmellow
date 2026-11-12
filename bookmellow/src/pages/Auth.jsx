import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../services/api';

function Auth() {
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // ฟังก์ชันจัดการยิง API ทั้ง Login และ Register
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วนนะคะ');
      return;
    }

    setIsLoading(true);

    try {
      if (isLoginTab) {
        // -------------------------------------------------------------
        // 1. กรณี: เข้าสู่ระบบ (POST /api/auth/login)
        // -------------------------------------------------------------
        const data = await apiRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        // บันทึก Token ลง localStorage เพื่อให้ apiRequest นำไปใช้ในหน้าถัดไป
        const token = data.token || data.accessToken || data.data?.token;
        if (token) {
          localStorage.setItem('token', token);
        }

        // ดึงข้อมูล User จาก Backend มาเก็บใน AuthContext
        const userData = data.user || data.data?.user || {};
        login({
          id: userData.id || userData._id,
          displayName: userData.username || userData.name || email.split('@')[0],
          email: userData.email || email,
          isAdmin: userData.role === 'admin' || userData.isAdmin || false,
        });

        alert('เข้าสู่ระบบสำเร็จแล้วค่ะ!');
        navigate('/');

      } else {
        // -------------------------------------------------------------
        // 2. กรณี: สมัครสมาชิก (POST /api/auth/register)
        // -------------------------------------------------------------
        if (!username) {
          alert('กรุณากรอกชื่อผู้ใช้งานด้วยนะคะ');
          setIsLoading(false);
          return;
        }

        await apiRequest('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ username, email, password }),
        });

        alert('สมัครสมาชิกสำเร็จแล้ว! กรุณาเข้าสู่ระบบนะคะ');
        setIsLoginTab(true); // สลับกลับไปแท็บเข้าสู่ระบบ
      }
    } catch (err) {
      alert(err.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between p-4 text-[#4A2B1D]">
      {/* Header Logo */}
      <div className="max-w-7xl mx-auto w-full pt-4">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-2xl font-bold text-[#4A2B1D] hover:text-[#8C533A] transition"
        >
          📚 <span>BookMellow</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#E8DCC4] shadow-sm space-y-6">
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-[#4A2B1D]">
              {isLoginTab ? 'เข้าสู่ระบบ BookMellow' : 'สมัครสมาชิกใหม่'}
            </h1>
            <p className="text-xs text-gray-500">
              {isLoginTab ? 'กรอกข้อมูลเพื่อเข้าสู่ระบบ' : 'สร้างบัญชีผู้ใช้เพื่อเริ่มต้นใช้งานคลังหนังสือสุดอบอุ่น'}
            </p>
          </div>

          {/* แท็บสลับ เข้าสู่ระบบ / สมัครสมาชิก */}
          <div className="flex bg-[#F4EFE6] p-1 rounded-2xl text-xs font-semibold border border-[#E8DCC4]">
            <button
              type="button"
              onClick={() => setIsLoginTab(true)}
              className={`flex-1 py-2.5 rounded-xl transition ${
                isLoginTab ? 'bg-white text-[#8C533A] shadow-sm' : 'text-gray-500 hover:text-[#4A2B1D]'
              }`}
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => setIsLoginTab(false)}
              className={`flex-1 py-2.5 rounded-xl transition ${
                !isLoginTab ? 'bg-white text-[#8C533A] shadow-sm' : 'text-gray-500 hover:text-[#4A2B1D]'
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>

          {/* ฟอร์มเข้าสู่ระบบ / สมัครสมาชิก */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {!isLoginTab && (
              <div className="space-y-1">
                <label className="font-semibold block text-[#4A2B1D]">ชื่อผู้ใช้งาน (Username)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="เช่น blueii"
                  className="w-full px-4 py-3 bg-[#F4EFE6] border border-[#E8DCC4] rounded-2xl text-[#4A2B1D] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8C533A]"
                  required={!isLoginTab}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="font-semibold block text-[#4A2B1D]">อีเมล (Email)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 bg-[#F4EFE6] border border-[#E8DCC4] rounded-2xl text-[#4A2B1D] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8C533A]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold block text-[#4A2B1D]">รหัสผ่าน (Password)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#F4EFE6] border border-[#E8DCC4] rounded-2xl text-[#4A2B1D] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8C533A]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#8C533A] hover:bg-[#633A27] text-white rounded-2xl font-bold shadow-md transition disabled:opacity-50 mt-2"
            >
              {isLoading ? 'กำลังดำเนินการ...' : isLoginTab ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </button>
          </form>

          {/* ลิงก์สลับแท็บ */}
          <div className="text-center text-xs text-gray-500">
            {isLoginTab ? (
              <p>
                ยังไม่มีบัญชีผู้ใช้ใช่ไหม?{' '}
                <button type="button" onClick={() => setIsLoginTab(false)} className="text-[#8C533A] font-bold hover:underline">
                  สมัครสมาชิกที่นี่
                </button>
              </p>
            ) : (
              <p>
                มีบัญชีผู้ใช้อยู่อุปกรณ์แล้ว?{' '}
                <button type="button" onClick={() => setIsLoginTab(true)} className="text-[#8C533A] font-bold hover:underline">
                  เข้าสู่ระบบที่นี่
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

      <footer className="text-center text-[11px] text-gray-400 py-4">
        © 2026 BookMellow Web Application. All rights reserved.
      </footer>
    </div>
  );
}
export default Auth;