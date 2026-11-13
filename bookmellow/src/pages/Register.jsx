import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/api';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const navigate = useNavigate();

  const isValidRealEmail = (value) =>
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value.trim());

  const handleRegister = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedUsername) {
      setStatusMsg({ type: 'error', text: 'กรุณากรอกชื่อผู้ใช้' });
      return;
    }

    if (!isValidRealEmail(trimmedEmail)) {
      setStatusMsg({
        type: 'error',
        text: 'กรุณากรอกรูปแบบอีเมลจริงที่ถูกต้อง (เช่น name@gmail.com)',
      });
      return;
    }

    if (password.length < 8) {
      setStatusMsg({ type: 'error', text: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' });
      return;
    }

    try {
      setIsLoading(true);
      await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: trimmedUsername,
          email: trimmedEmail,
          password,
        }),
      });

      setStatusMsg({
        type: 'success',
        text: 'สมัครสมาชิกสำเร็จแล้ว! กำลังพาคุณไปหน้าเข้าสู่ระบบ...',
      });

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'ไม่สามารถสมัครสมาชิกได้ อีเมลนี้อาจถูกใช้งานแล้ว',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-[#EFECE6] border border-[#E2DDD3] rounded-xl text-[#4A2B1D] placeholder-[#9E948B] focus:outline-none focus:ring-1 focus:ring-[#584237]';

  return (
    <div className="min-h-screen bg-[#F6F3EC] flex items-center justify-center p-4 text-[#4A2B1D]">
      <div className="w-full max-w-[440px] bg-[#FCFBF9] rounded-3xl px-8 py-10 sm:px-10 sm:py-11 border border-[#EAE2D3] shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-[#B87D4B] uppercase">
            JOIN BOOKMELLOW
          </p>
          <h1 className="text-2xl sm:text-[28px] font-bold text-[#4A2B1D]">สมัครสมาชิก</h1>
          <p className="text-xs text-[#6E6259] pt-1">
            มาเริ่มต้นค้นพบหนังสือเล่มโปรดไปด้วยกัน
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
        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold block text-[#4A2B1D]">ชื่อผู้ใช้</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="กรอกชื่อผู้ใช้"
              required
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold block text-[#4A2B1D]">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="กรอกอีเมลของคุณ"
              required
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold block text-[#4A2B1D]">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="อย่างน้อย 8 ตัวอักษร"
              required
              minLength={8}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 mt-2 bg-[#584237] hover:bg-[#423027] text-white rounded-full font-bold text-sm shadow-sm transition disabled:opacity-50"
          >
            {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
          </button>
        </form>

        {/* Footer Links */}
        <div className="text-center text-xs text-[#6E6259] space-y-3.5 pt-2">
          <p>
            มีบัญชีอยู่แล้ว?{' '}
            <Link
              to="/login"
              className="text-[#B87D4B] font-bold hover:text-[#8C533A] hover:underline transition"
            >
              เข้าสู่ระบบ
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

export default Register;