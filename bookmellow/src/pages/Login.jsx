import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from || '/';

  const isValidRealEmail = (value) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !isValidRealEmail(trimmedEmail)) {
      setStatusMsg({
        type: 'error',
        text: 'กรุณากรอกรูปแบบอีเมลจริงที่ถูกต้อง (เช่น name@gmail.com)',
      });
      return;
    }

    if (!password) {
      setStatusMsg({ type: 'error', text: 'กรุณากรอกรหัสผ่าน' });
      return;
    }

    setIsLoading(true);

    try {
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
    
    <div className="min-h-screen bg-[#F6F3EC] flex items-center justify-center p-4 text-[#4A2B1D]">
      <div className="w-full max-w-[440px] bg-[#FCFBF9] rounded-3xl px-8 py-10 sm:px-10 sm:py-11 border border-[#EAE2D3] shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#B87D4B] uppercase">
            WELCOME BACK
          </p>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#4A2B1D]">
            ยินดีต้อนรับกลับมา
          </h1>
          <p className="text-xs text-[#6E6259] pt-1">
            เข้าสู่ระบบเพื่อค้นพบหนังสือเล่มโปรดของคุณ
          </p>
        </div>

        {/* Alert Message */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold block text-[#4A2B1D]">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="กรอกอีเมลของคุณ"
              className="w-full px-4 py-3 bg-[#EFECE6] border border-[#E2DDD3] rounded-xl text-[#4A2B1D] placeholder-[#9E948B] focus:outline-none focus:ring-1 focus:ring-[#584237]"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold block text-[#4A2B1D]">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่าน"
              className="w-full px-4 py-3 bg-[#EFECE6] border border-[#E2DDD3] rounded-xl text-[#4A2B1D] placeholder-[#9E948B] focus:outline-none focus:ring-1 focus:ring-[#584237]"
              required
            />
            <div className="flex justify-end pt-1">
              <Link
                to="/reset-password"
                className="text-xs font-semibold text-[#B87D4B] hover:text-[#8C533A] hover:underline transition"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 bg-[#584237] hover:bg-[#423027] text-white rounded-full font-bold text-sm shadow-sm transition disabled:opacity-50"
          >
            {isLoading ? 'กำลังดำเนินการ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        {/* Footer Links */}
        <div className="text-center text-xs text-[#6E6259] space-y-3.5 pt-2">
          <p>
            ยังไม่มีบัญชีสมาชิกใช่ไหม?{' '}
            <Link
              to="/register"
              className="text-[#B87D4B] font-bold hover:text-[#8C533A] hover:underline transition"
            >
              สมัครสมาชิก
            </Link>
          </p>

          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs text-[#6E6259] hover:text-[#4A2B1D] font-medium transition"
            >
              <span>←</span>
              <span>กลับหน้าหลัก</span>
            </Link>
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