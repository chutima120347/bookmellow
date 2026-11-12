import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../auth/AuthContext';
import { apiRequest } from '../../services/api';

const dateTH = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

// รายชื่อสมาชิก + ปุ่มเลื่อน/ลดบทบาท (ของตัวเองกดไม่ได้)
function AdminMembers() {
  const { user: me } = useAuth();
  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState(null); // สมาชิกที่กำลังจะเปลี่ยนบทบาท (เปิดกล่องยืนยัน)
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
    const isAdmin = String(target.role || '').toLowerCase() === 'admin' || target.isAdmin === true;
    const nextRole = isAdmin ? 'member' : 'admin';

    setBusy(true);
    setActionError(null);
    try {
      const endpoints = [
        { url: `/api/admin/members/${target.id}/role`, method: 'PATCH' },
        { url: `/api/admin/members/${target.id}`, method: 'PUT' },
      ];

      let updated = null;
      let lastErr = null;
      for (const ep of endpoints) {
        try {
          const res = await apiRequest(ep.url, {
            method: ep.method,
            body: JSON.stringify({ role: nextRole }),
          });
          updated = res?.member || res?.data || { ...target, role: nextRole };
          break;
        } catch (err) {
          lastErr = err;
        }
      }

      if (!updated) throw lastErr || new Error('ไม่สามารถเปลี่ยนบทบาทได้');

      setMembers(
        members.map((m) =>
          m.id === target.id ? { ...m, ...updated, role: nextRole, isAdmin: nextRole === 'admin' } : m
        )
      );
      setTarget(null);
    } catch (err) {
      setActionError(err.message);
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
    target && (String(target.role || '').toLowerCase() === 'admin' || target.isAdmin === true);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#4A2B1D] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-4">
          <Link to="/admin" className="text-xs font-semibold text-[#8C533A] hover:underline">
            ← กลับไปหน้า Admin Dashboard
          </Link>
        </div>

        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1E1C1A]">สมาชิก</h2>
            {status === 'success' && (
              <p className="text-sm text-[#7A756E]">
                ทั้งหมด {members.length} คน (admin {adminCount})
              </p>
            )}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นชื่อหรืออีเมล"
            className="rounded-xl border border-[#E6E0D6] bg-white px-4 py-2 text-sm text-[#4A2B1D] focus:border-[#8C533A] focus:outline-none md:w-64"
          />
        </div>

        {actionError && <p className="mb-3 text-sm text-rose-600">{actionError}</p>}

        {status === 'loading' && (
          <div className="rounded-2xl border border-[#E6E0D6] bg-white p-12 text-center text-sm text-[#8C533A] animate-pulse">
            กำลังโหลดรายชื่อสมาชิก...
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center space-y-3">
            <p className="text-sm font-semibold text-rose-700">
              โหลดข้อมูลไม่สำเร็จ: {error?.message || 'เกิดข้อผิดพลาด'}
            </p>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition"
            >
              ลองใหม่
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="overflow-x-auto rounded-2xl border border-[#E6E0D6] bg-white">
            <table className="w-full text-sm">
              <thead className="bg-[#F3EFE8]/70 text-left text-xs uppercase tracking-wide text-[#7A756E]">
                <tr>
                  <th className="px-4 py-3">สมาชิก</th>
                  <th className="px-4 py-3">บทบาท</th>
                  <th className="px-4 py-3">สมัครเมื่อ</th>
                  <th className="px-4 py-3 text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3EFE8]">
                {shown.map((m) => {
                  const isMe = m.id === me?.id || m.email === me?.email;
                  const isMemberAdmin =
                    String(m.role || '').toLowerCase() === 'admin' || m.isAdmin === true;
                  return (
                    <tr key={m.id} className="hover:bg-[#FAF7F2]">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#1E1C1A]">
                          {m.displayName || m.username || 'นักอ่าน'}{' '}
                          {isMe && <span className="text-xs text-[#8C7B70]">(คุณ)</span>}
                        </p>
                        <p className="text-xs text-[#7A756E]">{m.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            'rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                            (isMemberAdmin
                              ? 'bg-[#4A2B1D] text-[#FDFBF7]'
                              : 'bg-[#F3EFE8] text-[#7A756E]')
                          }
                        >
                          {isMemberAdmin ? 'admin' : 'member'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#7A756E]">
                        {m.createdAt || m.created_at ? dateTH(m.createdAt || m.created_at) : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setTarget(m)}
                          disabled={isMe}
                          className="font-semibold text-[#8C533A] hover:underline disabled:cursor-not-allowed disabled:text-gray-300"
                        >
                          {isMemberAdmin ? 'ลดเป็น member' : 'เลื่อนเป็น admin'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {shown.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-[#8C7B70]">
                      ไม่พบสมาชิก
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* กล่องยืนยันการเปลี่ยนบทบาท */}
        {target && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl border border-[#E6E0D6] bg-white p-6 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-[#1E1C1A]">
                {targetIsAdmin
                  ? `ลด ${target?.displayName || target?.username} เป็น member ?`
                  : `เลื่อน ${target?.displayName || target?.username} เป็น admin ?`}
              </h3>
              <p className="text-sm text-[#5C4D44]">
                {targetIsAdmin
                  ? 'คนนี้จะเข้าหลังบ้านไม่ได้อีกเมื่อ login ใหม่ (ตั๋วใบที่ถืออยู่ยังใช้ได้จนหมดอายุ)'
                  : 'คนนี้จะแก้ไขข้อมูลหนังสือและบทบาทของสมาชิกคนอื่นได้ มีผลเมื่อเขา login ใหม่'}
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  disabled={busy}
                  onClick={() => setTarget(null)}
                  className="rounded-xl border border-[#E6E0D6] px-4 py-2 text-sm text-[#7A756E] hover:bg-[#FAF7F2]"
                >
                  ยกเลิก
                </button>
                <button
                  disabled={busy}
                  onClick={confirmRole}
                  className="rounded-xl bg-[#4A2B1D] px-5 py-2 text-sm font-semibold text-white hover:bg-[#633A27] disabled:opacity-50"
                >
                  {busy ? 'กำลังบันทึก...' : 'ยืนยัน'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default AdminMembers;