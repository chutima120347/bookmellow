import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../auth/AuthContext';
import { getAdminMembers, setMemberRole } from '../../services/api';
import { ErrorBox, Loading, ConfirmBox, inputClass } from '../../components/admin/AdminStates';

const dateTH = (iso) => new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

// รายชื่อสมาชิก + ปุ่มเลื่อน/ลดบทบาท (ของตัวเองกดไม่ได้)
function AdminMembers() {
  const { token, user: me } = useAuth();
  const [members, setMembers] = useState([]);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState(null);      // สมาชิกที่กำลังจะเปลี่ยนบทบาท (เปิดกล่องยืนยัน)
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      try {
        const list = await getAdminMembers(token);
        if (!ignore) { setMembers(list); setStatus('success'); }
      } catch (err) {
        if (!ignore) { setError(err); setStatus('error'); }
      }
    }
    load();
    return () => { ignore = true; };
  }, [token, reloadKey]);

  async function confirmRole() {
    const isAdmin = target.role === 'admin' || target.isAdmin === true;
    const nextRole = isAdmin ? 'member' : 'admin';
    setBusy(true);
    setActionError(null);
    try {
      const updated = await setMemberRole(target.id, nextRole, token);
      setMembers(members.map(m => (m.id === updated.id ? { ...m, ...updated, role: nextRole, isAdmin: nextRole === 'admin' } : m)));
      setTarget(null);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const q = query.trim().toLowerCase();
  const shown = members.filter(m => {
    const name = (m.displayName || m.username || '').toLowerCase();
    const email = (m.email || '').toLowerCase();
    return q === '' || name.includes(q) || email.includes(q);
  });

  const targetIsAdmin = target?.role === 'admin' || target?.isAdmin === true;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#4A2B1D] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-4">
          <Link to="/admin" className="text-xs font-semibold text-[#8C533A] hover:underline">
            ← กลับไปหน้า Admin Dashboard
          </Link>
        </div>

        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#1E1C1A]">สมาชิก</h2>
            {status === 'success' && (
              <p className="text-sm text-[#7A756E]">
                ทั้งหมด {members.length} คน (admin {members.filter(m => m.role === 'admin' || m.isAdmin === true).length})
              </p>
            )}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นชื่อหรืออีเมล"
            className={inputClass + ' md:w-64'}
          />
        </div>

        {actionError && <p className="mb-3 text-sm text-rose-600">{actionError}</p>}
        {status === 'loading' && <Loading />}
        {status === 'error' && <ErrorBox error={error} onRetry={() => setReloadKey(k => k + 1)} />}
        {status === 'success' && (
          <div className="overflow-x-auto rounded-xl border border-[#E6E0D6] bg-white">
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
                {shown.map(m => {
                  const isMe = m.id === me?.id || m.email === me?.email;
                  const isMemberAdmin = m.role === 'admin' || m.isAdmin === true;
                  return (
                    <tr key={m.id} className="hover:bg-[#FAF7F2]">
                      <td className="px-4 py-2">
                        <p className="font-medium text-[#1E1C1A]">
                          {m.displayName || m.username} {isMe && <span className="text-xs text-[#8C7B70]">(คุณ)</span>}
                        </p>
                        <p className="text-xs text-[#7A756E]">{m.email}</p>
                      </td>
                      <td className="px-4 py-2">
                        <span className={'rounded-full px-2 py-0.5 text-xs ' + (isMemberAdmin ? 'bg-[#4A2B1D] text-[#FDFBF7]' : 'bg-[#F3EFE8] text-[#7A756E]')}>
                          {isMemberAdmin ? 'admin' : 'member'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-[#7A756E]">
                        {(m.createdAt || m.created_at) ? dateTH(m.createdAt || m.created_at) : '-'}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => setTarget(m)}
                          disabled={isMe}
                          className="text-[#8C533A] hover:underline disabled:cursor-not-allowed disabled:text-gray-300"
                        >
                          {isMemberAdmin ? 'ลดเป็น member' : 'เลื่อนเป็น admin'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {shown.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-[#8C7B70]">ไม่พบสมาชิก</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <ConfirmBox
          open={Boolean(target)}
          busy={busy}
          title={targetIsAdmin ? `ลด ${target?.displayName || target?.username} เป็น member ?` : `เลื่อน ${target?.displayName || target?.username} เป็น admin ?`}
          confirmText="ยืนยัน"
          onConfirm={confirmRole}
          onCancel={() => setTarget(null)}
        >
          <p>
            {targetIsAdmin
              ? 'คนนี้จะเข้าหลังบ้านไม่ได้อีกเมื่อ login ใหม่ (ตั๋วใบที่ถืออยู่ยังใช้ได้จนหมดอายุภายใน 1 ชั่วโมง)'
              : 'คนนี้จะแก้ไขหนังสือและบทบาทของสมาชิกคนอื่นได้ มีผลเมื่อเขา login ใหม่'}
          </p>
        </ConfirmBox>
      </main>

      <Footer />
    </div>
  );
}

export default AdminMembers;