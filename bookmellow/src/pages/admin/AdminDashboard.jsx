import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BookCover from '../../components/BookCover';
import { useAuth } from '../../auth/AuthContext';
import { apiRequest } from '../../services/api';

// การ์ดตัวเลข 1 ใบ (ธีม BookMellow)
function StatCard({ label, value, to }) {
  const body = (
    <>
      <p className="text-sm text-[#7A756E]">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-[#1E1C1A]">{value}</p>
    </>
  );
  const cls = 'rounded-2xl border border-[#E6E0D6] bg-white p-5 transition';
  return to ? <Link to={to} className={`${cls} block hover:border-[#8C533A] shadow-sm`}>{body}</Link> : <div className={cls}>{body}</div>;
}

const dateTH = (iso) => new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });


function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setStatus('loading');
      setError(null);
      try {
        // ดึงข้อมูลภาพรวมจาก API ของ BookMellow
        let dashboardRes = null;
        try {
          const res = await apiRequest('/api/admin/dashboard');
          dashboardRes = res?.data || res;
        } catch {
          dashboardRes = null;
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
          (m) => String(m.role || '').toLowerCase() === 'admin' || m.isAdmin === true
        ).length;

        const topRated = dashboardRes?.topRated || dashboardRes?.topBooks || [...booksList]
          .sort((a, b) => Number(b.rating || b.average_rating || 0) - Number(a.rating || a.average_rating || 0))
          .slice(0, 5);

        const newestMembers = dashboardRes?.newestMembers || [...membersList]
          .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0))
          .slice(0, 5);

        if (!ignore) {
          setStats({
            books: dashboardRes?.books ?? booksList.length,
            members: dashboardRes?.members ?? (membersList.length - adminCount),
            admins: dashboardRes?.admins ?? adminCount,
            reviews: dashboardRes?.reviews ?? 0,
            favorites: dashboardRes?.favorites ?? 0,
            topRated,
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
  }, [user, reloadKey]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#4A2B1D] flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1E1C1A]">Admin Dashboard</h1>
            <p className="text-xs sm:text-sm text-[#7A756E] mt-1">ภาพรวมและจัดการระบบ BookMellow</p>
          </div>
          <Link
            to="/admin/manage-books"
            className="px-5 py-2.5 bg-[#4A2B1D] hover:bg-[#633A27] text-white rounded-xl text-xs sm:text-sm font-semibold transition self-start sm:self-auto"
          >
            + จัดการหนังสือ
          </Link>
        </div>

        {status === 'loading' && (
          <div className="rounded-2xl border border-[#E6E0D6] bg-white p-12 text-center text-sm text-[#8C533A] animate-pulse">
            กำลังโหลดข้อมูลภาพรวม...
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

        {status === 'success' && stats && (
          <div className="space-y-8">
            {/* การ์ดสถิติ 5 ช่อง */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <StatCard label="หนังสือ" value={stats.books} to="/admin/manage-books" />
              <StatCard label="สมาชิก" value={stats.members} to="/admin/members" />
              <StatCard label="admin" value={stats.admins} to="/admin/members" />
            </div>

            {/* ตาราง 2 คอลัมน์ */}
            <div className="grid gap-6 md:grid-cols-2">
              <section className="rounded-2xl border border-[#E6E0D6] bg-white p-5">
                <h2 className="font-semibold text-[#1E1C1A]">หนังสือที่สมาชิกให้คะแนนสูงสุด</h2>
                <p className="text-xs text-[#7A756E]">คะแนนรีวิวจากสมาชิกในระบบ BookMellow</p>
                {stats.topRated.length === 0 ? (
                  <p className="py-8 text-center text-sm text-[#8C7B70]">ยังไม่มีคะแนนรีวิวหนังสือ</p>
                ) : (
                  <ol className="mt-3 divide-y divide-[#F3EFE8]">
                    {stats.topRated.map((b, i) => {
                      const rating = Number(b.rating || b.average_rating || 0);
                      const reviewCount = b.reviewCount || b.review_count || 0;
                      return (
                        <li key={b.id} className="flex items-center gap-3 py-2.5">
                          <span className="w-5 text-sm text-[#8C7B70]">{i + 1}</span>
                          <div className="h-12 w-8 rounded overflow-hidden bg-[#F4EFE6] flex-shrink-0">
                            <BookCover src={b.cover_url || b.cover} title={b.title} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link to={`/book/${b.id}`}
                              className="block truncate text-sm font-medium text-[#1E1C1A] hover:text-[#8C533A]"
                            >
                              {b.title}
                            </Link>
                            {b.author && (
                              <p className="truncate text-xs text-[#7A756E]">ผู้เขียน: {b.author}</p>
                            )}
                          </div>
                          <span className="text-sm text-[#4A2B1D]">
                            ⭐ {rating > 0 ? rating.toFixed(1) : ' '}{' '}
                            {reviewCount > 0 && (
                              <span className="text-xs text-[#8C7B70]">({reviewCount})</span>
                            )}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </section>

              <section className="rounded-xl border border-emerald-100 bg-white p-4">
                <h2 className="font-semibold text-slate-900">สมาชิกใหม่ล่าสุด</h2>
                <ul className="mt-3 divide-y divide-slate-100">
                  {stats.newestMembers.map(m => (
                    <li key={m.id} className="flex items-center justify-between py-2 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{m.displayName}</p>
                        <p className="truncate text-xs text-slate-500">{m.email}</p>
                      </div>
                      <div className="text-right text-xs text-slate-400">
                        {m.role === 'admin' && <span className="mr-2 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">admin</span>}
                        {dateTH(m.createdAt)}
                      </div>
                    </li>
                  ))}
                </ul>
                <Link to="/admin/members" className="mt-4 inline-block text-sm font-semibold text-[#8C533A] hover:underline">ดูสมาชิกทั้งหมด</Link>
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