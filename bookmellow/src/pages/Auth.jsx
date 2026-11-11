import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

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
        /* ตัวอย่างเมื่อต่อ API จริง:
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
        
        localStorage.setItem('token', data.token); // เก็บ JWT Token
        login(data.user);
        */

        // Mock Data สำหรับทดสอบชั่วคราว
        login({
          displayName: email.split('@')[0],
          email: email,
          isAdmin: false,
        });

        alert('เข้าสู่ระบบสำเร็จแล้วค่ะ! 🌸');
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

        /* ตัวอย่างเมื่อต่อ API จริง:
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'สมัครสมาชิกไม่สำเร็จ');
        */

        alert('สมัครสมาชิกสำเร็จแล้ว! กรุณาเข้าสู่ระบบนะคะ 💕');
        setIsLoginTab(true); // สลับกลับไปแท็บเข้าสู่ระบบ
      }
    } catch (err) {
      alert(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันทางลัด Admin
  const handleAdminLogin = () => {
    login({
      displayName: 'Admin Master',
      email: 'admin@bookmellow.com',
      isAdmin: true,
    });
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col justify-between p-4 text-[#4A3E3D]">
      <div className="max-w-7xl mx-auto w-full pt-4">
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-2xl font-bold hover:opacity-80 transition"
        >
          📚 <span>BookMellow</span>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-pink-100 shadow-sm space-y-6">
          
          <div className="text-center space-y-2">
            <div className="text-3xl">🌸</div>
            <h1 className="text-2xl font-bold">
              {isLoginTab ? 'เข้าสู่ระบบ BookMellow' : 'สมัครสมาชิกใหม่'}
            </h1>
            <p className="text-xs text-slate-400">
              {isLoginTab ? 'กรอกข้อมูลเพื่อเข้าสู่ระบบ' : 'สร้างบัญชีผู้ใช้เพื่อเริ่มต้นใช้งานคลังหนังสือสุดคิ้วท์'}
            </p>
          </div>

          <div className="flex bg-[#FAF7F0] p-1 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setIsLoginTab(false)}
              className={`flex-1 py-2.5 rounded-xl transition ${
                !isLoginTab ? 'bg-white text-pink-500 shadow-sm' : 'text-slate-400'
              }`}
            >
              สมัครสมาชิก
            </button>
            <button
              type="button"
              onClick={() => setIsLoginTab(true)}
              className={`flex-1 py-2.5 rounded-xl transition ${
                isLoginTab ? 'bg-white text-pink-500 shadow-sm' : 'text-slate-400'
              }`}
            >
              เข้าสู่ระบบ
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {!isLoginTab && (
              <div className="space-y-1">
                <label className="font-semibold block">ชื่อผู้ใช้งาน (Username)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="เช่น น้องมิลค์สายอ่าน"
                  className="w-full px-4 py-3 bg-[#FAF7F0] border border-pink-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                  required={!isLoginTab}
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="font-semibold block">อีเมล (Email)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 bg-[#FAF7F0] border border-pink-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold block">รหัสผ่าน (Password)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#FAF7F0] border border-pink-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#FF9EAA] hover:bg-[#FF9EAA]/90 text-white rounded-2xl font-bold shadow-md transition disabled:opacity-50"
            >
              {isLoading ? 'กำลังดำเนินการ...' : isLoginTab ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </button>
          </form>

          <div className="pt-4 border-t border-pink-50 text-center space-y-2">
            <button
              type="button"
              onClick={handleAdminLogin}
              className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-2xl font-bold text-xs transition border border-purple-200"
            >
              👑 ทดสอบเข้าสู่ระบบในฐานะ Admin
            </button>
          </div>

          <div className="text-center text-xs text-slate-400">
            {isLoginTab ? (
              <p>
                ยังไม่มีบัญชีผู้ใช้ใช่ไหม?{' '}
                <button type="button" onClick={() => setIsLoginTab(false)} className="text-pink-500 font-bold hover:underline">
                  สมัครสมาชิกที่นี่
                </button>
              </p>
            ) : (
              <p>
                มีบัญชีผู้ใช้อยู่แล้ว?{' '}
                <button type="button" onClick={() => setIsLoginTab(true)} className="text-pink-500 font-bold hover:underline">
                  เข้าสู่ระบบที่นี่
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
      <footer className="text-center text-[11px] text-slate-400 py-4">
        © 2026 BookMellow Web Application. All rights reserved.
      </footer>
    </div>
  );
}
export default Auth;