import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../services/api';

function Login() {
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from || '/';

  const isValidRealEmail = (value) => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !isValidRealEmail(trimmedEmail)) {
      setStatusMsg({
        type: 'error',
        text: 'กรุณากรอกรูปแบบอีเมลจริงที่ถูกต้อง (เช่น name@gmail.com)',
      });
      return;
    }

    setIsLoading(true);

    try {
      if (!isForgotMode) {
        // 1. เข้าสู่ระบบ
        if (!password) {
          setStatusMsg({ type: 'error', text: 'กรุณากรอกรหัสผ่าน' });
          setIsLoading(false);
          return;
        }

        const data = await apiRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: trimmedEmail, password }),
        });

        const token = data.token || data.accessToken || data.data?.token;
        if (token) {
          localStorage.setItem('token', token);
        }

        const userData = data.user || data.data?.user || {};
        const isAdmin = userData.role === 'admin' || userData.isAdmin === true;

        login(
          {
            id: userData.id || userData._id,
            displayName:
              userData.displayName || userData.username || userData.name || trimmedEmail.split('@')[0],
            username: userData.username || userData.displayName || trimmedEmail.split('@')[0],
            email: userData.email || trimmedEmail,
            role: userData.role || (isAdmin ? 'admin' : 'member'),
            isAdmin,
          },
          token
        );

        navigate(from, { replace: true });
      } else {
        // 2. ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลจริง
        await apiRequest('/api/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({
            email: trimmedEmail,
            resetUrl: `${window.location.origin}/reset-password`,
          }),
        });

        setStatusMsg({
          type: 'success',
          text: `ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยัง ${trimmedEmail} เรียบร้อยแล้ว กรุณาตรวจสอบกล่องจดหมาย (หรือโฟลเดอร์สแปม)`,
        });
      }
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between p-4 text-[#4A2B1D]">
      <div className="max-w-7xl mx-auto w-full pt-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-2xl font-bold text-[#4A2B1D] hover:text-[#8C533A] transition"
        >
          📚 <span>BookMellow</span>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#E8DCC4] shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-[#4A2B1D]">
              {isForgotMode ? 'รีเซ็ตรหัสผ่าน' : 'เข้าสู่ระบบ BookMellow'}
            </h1>
            <p className="text-xs text-gray-500 leading-relaxed">
              {isForgotMode
                ? 'กรอกอีเมลจริงที่ใช้สมัครสมาชิก ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้ทางอีเมล'
                : 'กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่พื้นที่ของคนรักการอ่าน'}
            </p>
          </div>

          {statusMsg.text && (
            <div
              className={`rounded-2xl px-4 py-3 text-xs leading-relaxed border ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-700'
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold block text-[#4A2B1D]">อีเมล (Email)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gmail.com"
                className="w-full px-4 py-3 bg-[#F4EFE6] border border-[#E8DCC4] rounded-2xl text-[#4A2B1D] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8C533A]"
                required
              />
            </div>

            {!isForgotMode && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold block text-[#4A2B1D]">รหัสผ่าน (Password)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(true);
                      setStatusMsg({ type: '', text: '' });
                    }}
                    className="text-[11px] font-semibold text-[#8C533A] hover:underline"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-[#F4EFE6] border border-[#E8DCC4] rounded-2xl text-[#4A2B1D] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8C533A]"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#8C533A] hover:bg-[#633A27] text-white rounded-2xl font-bold shadow-md transition disabled:opacity-50 mt-2"
            >
              {isLoading
                ? 'กำลังดำเนินการ...'
                : isForgotMode
                ? 'ส่งลิงก์รีเซ็ตรหัสผ่าน'
                : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 pt-2 border-t border-[#F4EFE6]">
            {isForgotMode ? (
              <p>
                จำรหัสผ่านได้แล้ว?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotMode(false);
                    setStatusMsg({ type: '', text: '' });
                  }}
                  className="text-[#8C533A] font-bold hover:underline"
                >
                  กลับไปหน้าเข้าสู่ระบบ
                </button>
              </p>
            ) : (
              <p>
                ยังไม่มีบัญชีผู้ใช้ใช่ไหม?{' '}
                <Link to="/register" className="text-[#8C533A] font-bold hover:underline">
                  สมัครสมาชิกที่นี่
                </Link>
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

export default Login;