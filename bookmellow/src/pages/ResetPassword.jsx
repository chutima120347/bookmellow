import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { apiRequest } from '../services/api';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const handleReset = async (e) => {
    e.preventDefault();
    setStatusMsg({ type: '', text: '' });

    if (!token) {
      setStatusMsg({
        type: 'error',
        text: 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุ กรุณาขอลิงก์ใหม่อีกครั้ง',
      });
      return;
    }

    if (newPassword.length < 4) {
      setStatusMsg({ type: 'error', text: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMsg({ type: 'error', text: 'รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน' });
      return;
    }

    try {
      setIsLoading(true);
      await apiRequest('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });

      setStatusMsg({
        type: 'success',
        text: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว! กำลังพาคุณไปหน้าเข้าสู่ระบบ...',
      });

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'ลิงก์หมดอายุหรือไม่ถูกต้อง กรุณาขอลิงก์รีเซ็ตรหัสผ่านใหม่',
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
          📚 <span>BookMellow</span>
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#E8DCC4] shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-[#4A2B1D]">ตั้งรหัสผ่านใหม่</h1>
            <p className="text-xs text-gray-500">
              กรอกรหัสผ่านใหม่ที่ต้องการใช้งานสำหรับบัญชี BookMellow ของคุณ
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
            <div className="space-y-1">
              <label className="font-semibold block text-[#4A2B1D]">รหัสผ่านใหม่</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="อย่างน้อย 4 ตัวอักษร"
                className="w-full px-4 py-3 bg-[#F4EFE6] border border-[#E8DCC4] rounded-2xl text-[#4A2B1D] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8C533A]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold block text-[#4A2B1D]">ยืนยันรหัสผ่านใหม่</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                className="w-full px-4 py-3 bg-[#F4EFE6] border border-[#E8DCC4] rounded-2xl text-[#4A2B1D] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#8C533A]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#8C533A] hover:bg-[#633A27] text-white rounded-2xl font-bold shadow-md transition disabled:opacity-50"
            >
              {isLoading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
            </button>
          </form>

          <div className="text-center text-xs text-gray-500 pt-2 border-t border-[#F4EFE6]">
            <Link to="/login" className="text-[#8C533A] font-bold hover:underline">
              กลับไปหน้าเข้าสู่ระบบ
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

export default ResetPassword;