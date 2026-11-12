import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BookCover from '../components/BookCover';
import { useAuth } from '../auth/AuthContext';
import { apiRequest } from '../services/api';

function StatCard({ label, value, to }) {
  const body = (
    <>
      <p className="text-xs sm:text-sm font-medium text-[#7A756E]">{label}</p>
      <p className="mt-2 text-2xl sm:text-3xl font-bold text-[#1E1C1A]">{value}</p>
    </>
  );
  const cls = 'rounded-2xl border border-[#E6E0D6] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition';
  return to ? (
    <Link to={to} className={`${cls} block hover:border-[#8C533A] hover:shadow-sm`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

const dateTH = (iso) => {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setStatus('loading');
      setError(null);
      try {
        let dashboardData = null;
        try {
          const res = await apiRequest('/api/admin/dashboard');
          dashboardData = res?.data || res;
        } catch {
          try {
            const resStats = await apiRequest('/api/admin/stats');
            dashboardData = resStats?.data || resStats;
          } catch {
            dashboardData = null;
          }
        }

        const booksRes = await apiRequest('/api/books');
        const booksList = Array.isArray(booksRes) ? booksRes : (booksRes?.books || booksRes?.data || []);

        let membersList = [];
        try {
          const membersRes = await apiRequest('/api/admin/members');
          membersList = Array.isArray(membersRes) ? membersRes : (membersRes?.members || membersRes?.data || []);
        } catch {
          membersList = [];
        }

        const adminCount = membersList.filter(
          (m) => String(m.role || '').toLowerCase() === 'admin' || m.isAdmin === true || m.is_admin === 1
        ).length;

        const topBooks = dashboardData?.topRatedBooks || dashboardData?.topBooks || [...booksList]
          .sort((a, b) => (Number(b.rating || b.average_rating || 0) - Number(a.rating || a.average_rating || 0)))
          .slice(0, 5);

        const newestMembers = dashboardData?.newestMembers || [...membersList]
          .sort((a, b) => new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0))
          .slice(0, 6);

        if (!ignore) {
          setStats({
            books: dashboardData?.books ?? booksList.length,
            members: dashboardData?.members ?? (membersList.length - adminCount),
            admins: dashboardData?.admins ?? adminCount,
            reviews: dashboardData?.reviews ?? dashboardData?.votes ?? 0,
            favorites: dashboardData?.favorites ?? dashboardData?.wishlistItems ?? 0,
            topBooks,
            newestMembers,
          });
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

  const handleToggleRole = async (targetUser) => {
    const currentIsAdmin =
      String(targetUser.role || '').toLowerCase() === 'admin' ||
      targetUser.isAdmin === true ||
      targetUser.is_admin === 1;

    const newRole = currentIsAdmin ? 'member' : 'admin';
    const actionText = currentIsAdmin
      ? `ลดสิทธิ์ "${targetUser.username || targetUser.displayName || targetUser.email}" เป็น Member`
      : `เลื่อนสิทธิ์ "${targetUser.username || targetUser.displayName || targetUser.email}" เป็น Admin`;

    if (!window.confirm(`คุณต้องการ${actionText} ใช่หรือไม่?`)) return;

    try {
      setUpdatingId(targetUser.id);
      const endpoints = [
        { url: `/api/admin/members/${targetUser.id}/role`, method: 'PATCH' },
        { url: `/api/admin/members/${targetUser.id}`, method: 'PUT' },
        { url: `/api/admin/users/${targetUser.id}/role`, method: 'PATCH' },
      ];

      let success = false;
      for (const ep of endpoints) {
        try {
          await apiRequest(ep.url, {
            method: ep.method,
            body: JSON.stringify({ role: newRole, isAdmin: newRole === 'admin' }),
          });
          success = true;
          break;
        } catch {
          // ลอง endpoint ถัดไป
        }
      }

      if (!success) {
        throw new Error('ไม่สามารถอัปเดตสิทธิ์ได้ กรุณาตรวจสอบ API ฝั่ง Backend');
      }

      setReloadKey((k) => k + 1);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#4A2B1D] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E1C1A]">
              Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#7A756E]">
              ภาพรวมข้อมูลหนังสือ สมาชิก และผู้ดูแลระบบ BookMellow
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/admin/members')}
              className="px-4 py-2.5 bg-white hover:bg-[#F3EFE8] text-[#4A2B1D] border border-[#E6E0D6] rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition"
            >
              👥 จัดการสมาชิก
            </button>
            <button
              onClick={() => navigate('/admin/manage-books')}
              className="px-5 py-2.5 bg-[#4A2B1D] hover:bg-[#633A27] text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition inline-flex items-center gap-2"
            >
              <span>+</span>
              <span>จัดการหนังสือ</span>
            </button>
          </div>
        </div>

        {status === 'loading' && (
          <div className="rounded-2xl border border-[#E6E0D6] bg-white p-12 text-center">
            <p className="text-sm text-[#8C533A] animate-pulse">กำลังโหลดข้อมูลภาพรวมระบบ...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center space-y-3">
            <p className="text-sm font-semibold text-rose-700">
              โหลดข้อมูลแดชบอร์ดไม่สำเร็จ: {error?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ'}
            </p>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition"
            >
              ลองใหม่อีกครั้ง
            </button>
          </div>
        )}

        {status === 'success' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              <StatCard label="หนังสือทั้งหมด" value={stats.books} to="/admin/manage-books" />
              <StatCard label="สมาชิก" value={stats.members} to="/admin/members" />
              <StatCard label="ผู้ดูแลระบบ (Admin)" value={stats.admins} to="/admin/members" />
              <StatCard label="รีวิว / คะแนน" value={stats.reviews} />
              <StatCard label="รายการโปรดทั้งหมด" value={stats.favorites} />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <section className="rounded-2xl border border-[#E6E0D6] bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-base text-[#1E1C1A]">หนังสือยอดนิยมในระบบ</h2>
                    <p className="text-xs text-[#7A756E]">รายการหนังสือแนะนำและคะแนนจากนักอ่าน</p>
                  </div>
                  <Link
                    to="/admin/manage-books"
                    className="text-xs font-semibold text-[#8C533A] hover:underline"
                  >
                    จัดการทั้งหมด &gt;
                  </Link>
                </div>

                {stats.topBooks.length === 0 ? (
                  <p className="py-10 text-center text-sm text-[#7A756E]">ยังไม่มีข้อมูลหนังสือ</p>
                ) : (
                  <ol className="mt-4 divide-y divide-[#F3EFE8]">
                    {stats.topBooks.map((b, i) => {
                      const categoryName = Array.isArray(b.categories)
                        ? b.categories[0]
                        : b.category || 'ทั่วไป';
                      const rating = Number(b.rating || b.average_rating || 0);

                      return (
                        <li key={b.id} className="flex items-center gap-3 py-3">
                          <span className="w-5 text-xs font-bold text-[#8C7B70]">{i + 1}</span>
                          <div className="h-12 w-8 rounded overflow-hidden bg-[#F4EFE6] flex-shrink-0">
                            <BookCover src={b.cover_url || b.cover} title={b.title} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/book/${b.id}`}
                              className="block truncate text-sm font-semibold text-[#1E1C1A] hover:text-[#8C533A] transition"
                            >
                              {b.title}
                            </Link>
                            <p className="truncate text-xs text-[#7A756E]">
                              {b.author || 'ไม่ระบุผู้แต่ง'} • {categoryName}
                            </p>
                          </div>
                          {rating > 0 && (
                            <span className="text-xs font-semibold text-[#4A2B1D] bg-[#FAF7F2] px-2.5 py-1 rounded-full border border-[#E6E0D6]">
                              ⭐ {rating.toFixed(1)}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                )}
              </section>

              <section className="rounded-2xl border border-[#E6E0D6] bg-white p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-base text-[#1E1C1A]">สมาชิกใหม่ล่าสุด</h2>
                      <p className="text-xs text-[#7A756E]">รายชื่อผู้สมัครและปุ่มจัดการสิทธิ์ด่วน</p>
                    </div>
                    <Link
                      to="/admin/members"
                      className="text-xs font-semibold text-[#8C533A] hover:underline"
                    >
                      ดูสมาชิกทั้งหมด &gt;
                    </Link>
                  </div>

                  {stats.newestMembers.length === 0 ? (
                    <p className="py-10 text-center text-sm text-[#7A756E]">ยังไม่มีข้อมูลสมาชิก</p>
                  ) : (
                    <ul className="mt-4 divide-y divide-[#F3EFE8]">
                      {stats.newestMembers.map((m) => {
                        const isMemberAdmin =
                          String(m.role || '').toLowerCase() === 'admin' ||
                          m.isAdmin === true ||
                          m.is_admin === 1;
                        const isSelf = user?.id === m.id || user?.email === m.email;

                        return (
                          <li key={m.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-[#1E1C1A]">
                                {m.displayName || m.username || 'นักอ่าน'}
                              </p>
                              <p className="truncate text-xs text-[#7A756E]">{m.email}</p>
                              <p className="text-[11px] text-[#8C7B70] mt-0.5">
                                สมัครเมื่อ: {dateTH(m.created_at || m.createdAt)}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {isMemberAdmin && (
                                <span className="rounded-full bg-[#4A2B1D] px-2.5 py-0.5 text-[11px] font-semibold text-[#FDFBF7]">
                                  admin
                                </span>
                              )}

                              {!isSelf && (
                                <button
                                  disabled={updatingId === m.id}
                                  onClick={() => handleToggleRole(m)}
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition disabled:opacity-50 ${
                                    isMemberAdmin
                                      ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                                      : 'bg-[#FAF7F2] text-[#8C533A] hover:bg-[#E8DCC4] border border-[#E6E0D6]'
                                  }`}
                                >
                                  {updatingId === m.id
                                    ? '...'
                                    : isMemberAdmin
                                    ? 'ลดสิทธิ์'
                                    : 'ตั้งเป็น Admin'}
                                </button>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                <div className="pt-4 mt-2 border-t border-[#F3EFE8]">
                  <Link
                    to="/admin/members"
                    className="inline-block text-xs sm:text-sm font-semibold text-[#8C533A] hover:underline"
                  >
                    ดูสมาชิกทั้งหมด →
                  </Link>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
export default AdminDashboard;