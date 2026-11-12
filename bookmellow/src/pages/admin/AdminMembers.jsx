import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../services/api';

const dateTH = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

function AdminMembers() {
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      setError(null);
      try {
        const res = await apiRequest('/api/admin/members');
        const list = Array.isArray(res) ? res : (res?.members || res?.data || []);
        if (!ignore) {
          setMembers(list);
          setStatus('success');
        }
      } catch (err) {
        if (!ignore) {
          setError(err);
          setStatus('error');
        }
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  async function confirmRole() {
    if (!target) return;
    const isCurrentlyAdmin =
      String(target.role || '').toLowerCase() === 'admin' ||
      target.isAdmin === true ||
      target.is_admin === 1;
    const nextRole = isCurrentlyAdmin ? 'member' : 'admin';

    setBusy(true);
    setActionError(null);

    try {
      const endpoints = [
        { url: `/api/admin/members/${target.id}/role`, method: 'PATCH' },
        { url: `/api/admin/members/${target.id}/role`, method: 'PUT' },
        { url: `/api/admin/members/${target.id}`, method: 'PATCH' },
        { url: `/api/admin/members/${target.id}`, method: 'PUT' },
      ];

      let updatedMember = null;
      let lastErr = null;

      for (const ep of endpoints) {
        try {
          const res = await apiRequest(ep.url, {
            method: ep.method,
            body: JSON.stringify({ role: nextRole }),
          });
          updatedMember = res?.member || res?.data || { ...target, role: nextRole };
          break;
        } catch (err) {
          lastErr = err;
        }
      }

      if (!updatedMember) {
        throw lastErr || new Error('ไม่สามารถอัปเดตบทบาทสมาชิกได้');
      }

      setMembers((prev) =>
        prev.map((m) =>
          m.id === target.id
            ? { ...m, ...updatedMember, role: nextRole, isAdmin: nextRole === 'admin' }
            : m
        )
      );
      setTarget(null);
    } catch (err) {
      setActionError(err.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์');
    } finally {
      setBusy(false);
    }
  }

  const q = query.trim().toLowerCase();
  const shown = members.filter((m) => {
    const name = (m.displayName || m.username || '').toLowerCase();
    const email = (m.email || '').toLowerCase();
    return q === '' || name.includes(q) || email.includes(q);
  });

  const adminCount = members.filter(
    (m) => String(m.role || '').toLowerCase() === 'admin' || m.isAdmin === true
  ).length;

  const targetIsAdmin =
    target &&
    (String(target.role || '').toLowerCase() === 'admin' || target.isAdmin === true);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#4A2B1D] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div>
          <button
            onClick={() => navigate('/admin')}
            className="text-xs font-semibold text-[#8C533A] hover:underline inline-flex items-center gap-1"
          >
            ← กลับไปหน้า Admin Dashboard
          </button>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1E1C1A]">สมาชิก BookMellow</h1>
            {status === 'success' && (
              <p className="text-xs sm:text-sm text-[#7A756E] mt-0.5">
                ทั้งหมด {members.length} คน (ผู้ดูแลระบบ {adminCount} คน)
              </p>
            )}
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นชื่อหรืออีเมล..."
            className="w-full md:w-64 px-4 py-2 bg-white border border-[#E6E0D6] rounded-xl text-xs sm:text-sm text-[#4A2B1D] focus:outline-none focus:ring-1 focus:ring-[#8C533A]"
          />
        </div>

        {actionError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs sm:text-sm text-rose-700">
            {actionError}
          </div>
        )}

        {status === 'loading' && (
          <div className="rounded-2xl border border-[#E6E0D6] bg-white p-12 text-center">
            <p className="text-sm text-[#8C533A] animate-pulse">กำลังโหลดรายชื่อสมาชิก...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center space-y-3">
            <p className="text-sm font-semibold text-rose-700">
              โหลดรายชื่อสมาชิกไม่สำเร็จ: {error?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'}
            </p>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="overflow-x-auto rounded-2xl border border-[#E6E0D6] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <table className="w-full text-sm">
              <thead className="bg-[#F3EFE8]/80 text-left text-xs uppercase tracking-wide text-[#7A756E] border-b border-[#E6E0D6]">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">สมาชิก</th>
                  <th className="px-5 py-3.5 font-semibold">บทบาท</th>
                  <th className="px-5 py-3.5 font-semibold">สมัครเมื่อ</th>
                  <th className="px-5 py-3.5 font-semibold text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3EFE8]">
                {shown.map((m) => {
                  const isMe = m.id === me?.id || m.email === me?.email;
                  const isMemberAdmin =
                    String(m.role || '').toLowerCase() === 'admin' || m.isAdmin === true;

                  return (
                    <tr key={m.id} className="hover:bg-[#FAF7F2]/70 transition">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-[#1E1C1A]">
                          {m.displayName || m.username || 'ไม่ระบุชื่อ'}{' '}
                          {isMe && <span className="text-xs font-normal text-[#8C7B70]">(คุณ)</span>}
                        </p>
                        <p className="text-xs text-[#7A756E]">{m.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isMemberAdmin
                              ? 'bg-[#4A2B1D] text-[#FDFBF7]'
                              : 'bg-[#F3EFE8] text-[#7A756E]'
                          }`}
                        >
                          {isMemberAdmin ? 'admin' : 'member'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#7A756E]">
                        {m.createdAt || m.created_at ? dateTH(m.createdAt || m.created_at) : '-'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setActionError(null);
                            setTarget(m);
                          }}
                          disabled={isMe}
                          className={`text-xs font-semibold transition disabled:cursor-not-allowed disabled:text-gray-300 ${
                            isMemberAdmin
                              ? 'text-rose-600 hover:underline'
                              : 'text-[#8C533A] hover:underline'
                          }`}
                        >
                          {isMemberAdmin ? 'ลดเป็น member' : 'เลื่อนเป็น admin'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {shown.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-xs sm:text-sm text-[#8C7B70]">
                      ไม่พบสมาชิกที่ค้นหา
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#E6E0D6] p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-[#1E1C1A]">
              {targetIsAdmin
                ? `ลด ${target.displayName || target.username || target.email} เป็น member ?`
                : `เลื่อน ${target.displayName || target.username || target.email} เป็น admin ?`}
            </h3>

            <p className="text-xs sm:text-sm text-[#5C4D44] leading-relaxed">
              {targetIsAdmin
                ? 'คนนี้จะเข้าหน้าจัดการระบบหลังบ้านไม่ได้อีกเมื่อ login ใหม่ (สิทธิ์เดิมที่ถืออยู่จะหมดอายุตามรอบ Token)'
                : 'คนนี้จะสามารถจัดการข้อมูลหนังสือและเปลี่ยนบทบาทของสมาชิกคนอื่นได้ โดยจะมีผลเมื่อเข้าสู่ระบบใหม่'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setTarget(null)}
                className="px-4 py-2 rounded-xl border border-[#E6E0D6] text-xs sm:text-sm font-medium text-[#7A756E] hover:bg-[#FAF7F2] transition disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={confirmRole}
                className="px-5 py-2 rounded-xl bg-[#4A2B1D] hover:bg-[#633A27] text-white text-xs sm:text-sm font-semibold transition disabled:opacity-50"
              >
                {busy ? 'กำลังบันทึก...' : 'ยืนยัน'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default AdminMembers;