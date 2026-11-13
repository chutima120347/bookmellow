import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { apiRequest } from '../services/api';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const isValidRealEmail = (value) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value.trim());

  const handleReset = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    const trimmedEmail = email.trim().toLowerCase();

    if (!isValidRealEmail(trimmedEmail)) {
      setStatusMsg({ type: 'error', text: 'กรุณากรอกอีเมลสมาชิกให้ถูกต้อง' });
      return;
    }

    if (newPassword.length < 8) {
      setStatusMsg({ type: 'error', text: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'รหัสผ่านใหม่และยืนยันรหัสผ่านใหม่ไม่ตรงกัน' });
      return;
    }

    try {
      setIsLoading(true);
      await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: trimmedEmail,
          token,
          newPassword,
        }),
      });

      setStatusMsg({
        type: 'success',
        text: 'บันทึกรหัสผ่านใหม่เรียบร้อยแล้ว! กำลังพาคุณไปหน้าเข้าสู่ระบบ...',
      });

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาตรวจสอบอีเมลสมาชิกอีกครั้ง',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#3B2A22] flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[#FAF8F5] rounded-3xl p-8 sm:p-10 border border-[#E6DFD3] shadow-sm space-y-6">
          <div className="text-center space-y-1.5">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-[#8C7A6B] uppercase">
              PASSWORD RECOVERY
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#3B2A22]">เปลี่ยนรหัสผ่าน</h1>
            <p className="text-xs text-[#6E6259] pt-1">
              กรอกอีเมลสมาชิกและกำหนดรหัสผ่านใหม่ของคุณ
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

          <form onSubmit={handleReset} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block font-semibold text-[#3B2A22]">อีเมลสมาชิก</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="w-full px-4 py-3 bg-[#EFECE6] border border-[#E2DDD3] rounded-xl text-[#3B2A22] placeholder-[#9E948B] focus:outline-none focus:ring-1 focus:ring-[#7D6659]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-[#3B2A22]">รหัสผ่านใหม่</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="อย่างน้อย 8 ตัวอักษร"
                minLength={8}
                required
                className="w-full px-4 py-3 bg-[#EFECE6] border border-[#E2DDD3] rounded-xl text-[#3B2A22] placeholder-[#9E948B] focus:outline-none focus:ring-1 focus:ring-[#7D6659]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-[#3B2A22]">ยืนยันรหัสผ่านใหม่</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                minLength={8}
                required
                className="w-full px-4 py-3 bg-[#EFECE6] border border-[#E2DDD3] rounded-xl text-[#3B2A22] placeholder-[#9E948B] focus:outline-none focus:ring-1 focus:ring-[#7D6659]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 bg-[#7D6659] hover:bg-[#634F44] text-white rounded-full font-bold text-sm shadow-sm transition disabled:opacity-50"
            >
              {isLoading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
            </button>
          </form>

          <div className="text-center pt-1">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#7D6659] hover:text-[#3B2A22] font-medium transition"
            >
              <span>←</span>
              <span>กลับไปหน้าเข้าสู่ระบบ</span>
            </Link>
          </div>
        </div>
      </main>
      <footer className="text-center text-[11px] text-gray-400 py-4">
        © 2026 BookMellow Web Application. All rights reserved.
      </footer>
    </div>
  );
}

export default ResetPassword;