// 1. กำหนดค่า API Base URL (รองรับ Create React App / react-scripts บน Vercel)
export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  'https://bookmellow-backend.onrender.com';

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

  // ถ้า Token หมดอายุ หรือไม่ได้รับอนุญาต (401)
  if (response.status === 401) {
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