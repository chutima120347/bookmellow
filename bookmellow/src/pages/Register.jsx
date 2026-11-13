import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
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
    'w-full px-4 py-3 bg-[#EFECE6] border border-[#E2DDD3] rounded-xl text-[#3B2A22] placeholder-[#9E948B] focus:outline-none focus:ring-1 focus:ring-[#7D6659]';

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#3B2A22] flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[#FAF8F5] rounded-3xl p-8 sm:p-10 border border-[#E6DFD3] shadow-sm space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[#8C7A6B] uppercase">
              JOIN BOOKMELLOW
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#3B2A22]">สมัครสมาชิก</h1>
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
              <label className="block font-semibold text-[#3B2A22]">ชื่อผู้ใช้</label>
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
              <label className="block font-semibold text-[#3B2A22]">อีเมล</label>
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
              <label className="block font-semibold text-[#3B2A22]">รหัสผ่าน</label>
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
              className="w-full py-3.5 mt-2 bg-[#7D6659] hover:bg-[#634F44] text-white rounded-full font-bold text-sm shadow-sm transition disabled:opacity-50"
            >
              {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
            </button>
          </form>

          {/* Footer Links */}
          <div className="text-center text-xs text-[#6E6259] space-y-3 pt-1">
            <p>
              มีบัญชีอยู่แล้ว?{' '}
              <Link
                to="/login"
                className="text-[#7D6659] font-bold hover:text-[#3B2A22] hover:underline transition"
              >
                เข้าสู่ระบบ
              </Link>
            </p>

            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 text-xs text-[#7D6659] hover:text-[#3B2A22] font-medium transition"
              >
                <span>←</span>
                <span>กลับหน้าหลัก</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center text-[11px] text-gray-400 py-4">
        © 2026 BookMellow Web Application. All rights reserved.
      </footer>
    </div>
  );
}

export default Register;