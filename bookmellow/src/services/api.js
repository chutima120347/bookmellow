// 1. กำหนดค่า API Base URL (รองรับ Create React App / react-scripts บน Vercel)
// ชี้ตรงไปที่ Backend บน Render ของคุณเลย (ไม่มี / ปิดท้าย)
export const API_BASE_URL = 'https://bookmellow-backend.onrender.com';

/**
 * ฟังก์ชันกลางสำหรับเรียกใช้งาน API
 */
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Something went wrong');
  }

  return data;
}

// ดึงรายชื่อสมาชิกทั้งหมดสำหรับ Admin
export async function getAdminMembers() {
  const res = await apiRequest('/api/admin/members');
  return Array.isArray(res) ? res : (res?.members || res?.data || []);
}

// อัปเดตบทบาทสมาชิก (admin / member)
export async function setMemberRole(memberId, role) {
  const endpoints = [
    { url: `/api/admin/members/${memberId}/role`, method: 'PATCH' },
    { url: `/api/admin/members/${memberId}`, method: 'PUT' },
  ];

  let lastErr = null;
  for (const ep of endpoints) {
    try {
      const res = await apiRequest(ep.url, {
        method: ep.method,
        body: JSON.stringify({ role }),
      });
      return res?.member || res?.data || { id: memberId, role };
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('ไม่สามารถเปลี่ยนบทบาทสมาชิกได้');
}