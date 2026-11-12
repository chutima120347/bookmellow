import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../services/api';

function Auth() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!isLoginMode && password !== confirmPassword) {
      setErrorMsg('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      setIsLoading(true);

      if (isLoginMode) {
        // เข้าสู่ระบบ
        const res = await apiRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        const token = res.token || res.data?.token;
        const userData = res.user || res.data?.user || {};

        if (token) {
          localStorage.setItem('token', token);
        }

        const formattedUser = {
          id: userData.id,
          displayName: userData.username || userData.displayName || email.split('@')[0],
          email: userData.email || email,
          role: userData.role || 'member',
          isAdmin: userData.role?.toLowerCase() === 'admin' || userData.isAdmin === true,
        };

        login(formattedUser, token);
        navigate('/');
      } else {
        // สมัครสมาชิก
        const res = await apiRequest('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ username, email, password }),
        });

        const token = res.token || res.data?.token;
        const userData = res.user || res.data?.user || {};

        if (token) {
          localStorage.setItem('token', token);
          const formattedUser = {
            id: userData.id,
            displayName: userData.username || username,
            email: userData.email || email,
            role: userData.role || 'member',
            isAdmin: userData.role?.toLowerCase() === 'admin' || userData.isAdmin === true,
          };
          login(formattedUser, token);
          navigate('/');
        } else {
          alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
          setIsLoginMode(true);
          setPassword('');
          setConfirmPassword('');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#4A2B1D] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#E8DCC4] shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="text-3xl">📚</div>
            <h1 className="text-2xl font-bold text-[#4A2B1D]">
              {isLoginMode ? 'ยินดีต้อนรับกลับมา' : 'สร้างบัญชีนักอ่านใหม่'}
            </h1>
            <p className="text-xs text-gray-500">
              {isLoginMode
                ? 'เข้าสู่ระบบเพื่อจัดการชั้นหนังสือและรายการโปรดของคุณ'
                : 'สมัครสมาชิก BookMellow เพื่อเริ่มต้นการอ่านที่แสนอบอุ่น'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {!isLoginMode && (
              <div>
                <label className="block mb-1 font-semibold text-[#4A2B1D]">ชื่อผู้ใช้ (Username)</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้ของคุณ"
                  className="w-full p-3 bg-[#F4EFE6] border border-[#E8DCC4] rounded-xl text-[#4A2B1D] focus:outline-none focus:ring-1 focus:ring-[#8C533A]"
                />
              </div>
            )}

            <div>
              <label className="block mb-1 font-semibold text-[#4A2B1D]">อีเมล (Email)</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full p-3 bg-[#F4EFE6] border border-[#E8DCC4] rounded-xl text-[#4A2B1D] focus:outline-none focus:ring-1 focus:ring-[#8C533A]"
              />
            </div>

            <div>
              <label className="block mb-1 font-semibold text-[#4A2B1D]">รหัสผ่าน (Password)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3 bg-[#F4EFE6] border border-[#E8DCC4] rounded-xl text-[#4A2B1D] focus:outline-none focus:ring-1 focus:ring-[#8C533A]"
              />
            </div>

            {!isLoginMode && (
              <div>
                <label className="block mb-1 font-semibold text-[#4A2B1D]">ยืนยันรหัสผ่าน (Confirm Password)</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 bg-[#F4EFE6] border border-[#E8DCC4] rounded-xl text-[#4A2B1D] focus:outline-none focus:ring-1 focus:ring-[#8C533A]"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#8C533A] hover:bg-[#633A27] text-white rounded-xl font-bold shadow-sm transition disabled:opacity-50 mt-2"
            >
              {isLoading ? 'กำลังดำเนินการ...' : isLoginMode ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
            </button>
          </form>

          <div className="pt-4 border-t border-[#F4EFE6] text-center text-xs">
            <span className="text-gray-500">
              {isLoginMode ? 'ยังไม่มีบัญชีใช่ไหม? ' : 'มีบัญชีอยู่แล้วใช่ไหม? '}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setErrorMsg('');
              }}
              className="font-bold text-[#8C533A] hover:underline"
            >
              {isLoginMode ? 'สมัครสมาชิกที่นี่' : 'เข้าสู่ระบบ'}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
export default Auth;