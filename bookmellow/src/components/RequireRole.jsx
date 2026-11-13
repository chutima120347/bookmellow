import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

function RequireRole({ role, children }) {
  const { isLoggedIn, user } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  const currentRole =
    user?.role || (user?.isAdmin === true ? 'admin' : 'member');

  if (currentRole !== role) {
    return (
      <div className="px-4 py-24 text-center">
        <p className="text-5xl font-semibold text-slate-300">403</p>
        <p className="mt-2 text-slate-500">หน้านี้สำหรับ {role} เท่านั้น บัญชีของคุณเป็น {currentRole}</p>
        <p className="mt-1 text-sm text-slate-400">หากเพิ่งได้รับสิทธิ์ใหม่ กรุณาออกจากระบบแล้วเข้าสู่ระบบอีกครั้งเพื่ออัปเดตสิทธิ์การใช้งาน</p>
        <Link to="/" className="mt-4 inline-block text-sm text-emerald-600 hover:underline">กลับหน้าแรก</Link>
    </div>
    );
  }
  return children;
}
export default RequireRole;