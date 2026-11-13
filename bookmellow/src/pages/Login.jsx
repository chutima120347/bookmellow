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
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between p-4 text-[#4A2B1D]">
      <div className="max-w-7xl mx-auto w-full pt-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-2xl font-bold text-[#4A2B1D] hover:text-[#8C533A] transition"
        >
          <span>BookMellow</span>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#E8DCC4] shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-[#4A2B1D]">เข้าสู่ระบบ BookMellow</h1>
            <p className="text-xs text-gray-500 leading-relaxed">
              เข้าสู่ระบบเพื่อค้นพบหนังสือเล่มโปรดของคุณ
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
              <label className="font-semibold block text-[#4A2B1D]">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="อีเมล"
                className="w-full px-4 py-3 bg-[#F4EFE6] border border-[#E8DCC4] rounded-2xl text-[#4A2B1D] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8C533A]"
                required
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold block text-[#4A2B1D]">รหัสผ่าน</label>
                <Link
                  to="/reset-password"
                  className="text-[11px] font-semibold text-[#8C533A] hover:underline"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="รหัสผ่าน"
                className="w-full px-4 py-3 bg-[#F4EFE6] border border-[#E8DCC4] rounded-2xl text-[#4A2B1D] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8C533A]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#8C533A] hover:bg-[#633A27] text-white rounded-2xl font-bold shadow-md transition disabled:opacity-50 mt-2"
            >
              {isLoading ? 'กำลังดำเนินการ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 pt-2 border-t border-[#F4EFE6]">
            <p>
              ยังไม่มีบัญชีผู้ใช้ใช่ไหม?{' '}
              <Link to="/register" className="text-[#8C533A] font-bold hover:underline">
                สมัครสมาชิกที่นี่
              </Link>
            </p>
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