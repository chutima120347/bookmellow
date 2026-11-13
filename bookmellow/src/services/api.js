// 1. กำหนดค่า API Base URL (รองรับ Create React App / react-scripts บน Vercel)
// ชี้ตรงไปที่ Backend บน Render ของคุณเลย (ไม่มี / ปิดท้าย)
export const API_BASE_URL = 'https://bookmellow-backend.onrender.com';

export async function apiRequest(endpoint, options = {}) {
  // ดึง Token จาก localStorage (ถ้ามี)
  const token = localStorage.getItem('token');

  // ตั้งค่า HTTP Headers
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  // ยิง Request ไปยัง Backend
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // ถ้า Token หมดอายุ หรือไม่ได้รับอนุญาต (401) และ "ไม่ใช่" หน้า Login
  if (response.status === 401 && !endpoint.includes('login') && !endpoint.includes('auth')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth';
    throw new Error('Session expired. Please login again.');
  }

  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Something went wrong');
  }

  return data;
}

// 2. ดึงสถิติรวมสำหรับหน้า Admin Dashboard
export async function getAdminStats() {
  const [booksRes, membersRes] = await Promise.all([
    apiRequest('/api/books'),
    apiRequest('/api/admin/members'),
  ]);

  const books = Array.isArray(booksRes) ? booksRes : (booksRes?.books || booksRes?.data || []);
  const members = Array.isArray(membersRes) ? membersRes : (membersRes?.members || membersRes?.data || []);

  const admins = members.filter(
    (m) => String(m.role || '').toLowerCase() === 'admin' || m.isAdmin === true
  );

  const topRated = [...books]
    .sort((a, b) => Number(b.rating || b.average_rating || 0) - Number(a.rating || a.average_rating || 0))
    .slice(0, 5);

  const newestMembers = [...members]
    .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0))
    .slice(0, 5);

  return {
    books: books.length,
    members: members.length - admins.length,
    admins: admins.length,
    topRated,
    newestMembers,
  };
}

// 3. ดึงรายชื่อสมาชิกทั้งหมดสำหรับ Admin
export async function getAdminMembers() {
  const res = await apiRequest('/api/admin/members');
  return Array.isArray(res) ? res : (res?.members || res?.data || []);
}

// 4. อัปเดตบทบาทสมาชิก (admin / member)
export async function setMemberRole(memberId, role) {
  const endpoints = [
    { url: `/api/admin/members/${memberId}/role`, method: 'PATCH' },
    { url: `/api/admin/members/${memberId}/role`, method: 'PUT' },
    { url: `/api/admin/members/${memberId}/role`, method: 'POST' },
    { url: `/api/admin/members/${memberId}`, method: 'PATCH' },
    { url: `/api/admin/members/${memberId}`, method: 'PUT' },
  ];

  for (const ep of endpoints) {
    try {
      const res = await apiRequest(ep.url, {
        method: ep.method,
        body: JSON.stringify({ role, isAdmin: role === 'admin' }),
      });
      return res?.member || res?.data || { id: memberId, role };
    } catch {
    }
  }
  throw new Error('Backend ยังไม่รองรับการเปลี่ยนบทบาทสมาชิก (Method Not Allowed) กรุณาเช็ก Route ในฝั่ง Backend');
}