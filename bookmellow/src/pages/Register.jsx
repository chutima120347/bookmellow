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
      setStatusMsg({ type: 'error', text: 'กรุณากรอกชื่อผู้ใช้งาน' });
      return;
    }

    if (!isValidRealEmail(trimmedEmail)) {
      setStatusMsg({
        type: 'error',
        text: 'กรุณากรอกอีเมลจริงที่ใช้งานได้ เพื่อรองรับการรีเซ็ตรหัสผ่าน',
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

  const input =
    'w-full px-4 py-3 bg-[#F4EFE6] border border-[#E8DCC4] rounded-2xl text-[#4A2B1D] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8C533A]';

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
            <h1 className="text-2xl font-bold text-[#4A2B1D]">สมัครสมาชิกใหม่</h1>
            <p className="text-xs text-gray-500 leading-relaxed">
              มาเริ่มต้นค้นพบหนังสือเล่มโปรดไปด้วยกัน
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

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold block text-[#4A2B1D]">ชื่อผู้ใช้งาน</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ชื่อผู้ใช้งาน"
                required
                className={input}
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold block text-[#4A2B1D]">อีเมล</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className={input}
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
                className={input}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#8C533A] hover:bg-[#633A27] text-white rounded-2xl font-bold shadow-md transition disabled:opacity-50 mt-2"
            >
              {isLoading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 pt-2 border-t border-[#F4EFE6]">
            <p>
              มีบัญชีแล้ว?{' '}
              <Link to="/login" className="text-[#8C533A] font-bold hover:underline">
                เข้าสู่ระบบ
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

export default Register;