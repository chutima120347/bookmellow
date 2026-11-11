const API_BASE_URL = 'https://bookmellow-backend.onrender.com';

/**
 * ฟังก์ชันหลักสำหรับเรียกใช้งาน API ทั้งหมดในระบบ
 */
export async function apiRequest(endpoint, options = {}, customToken = null) {
  // ดึง Token จาก localStorage (ถ้าไม่มี customToken ส่งมา)
  const token = customToken || localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // แนบ Authorization Header ถ้ามี Token
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // ดักจับกรณี Token หมดอายุ (401 Unauthorized)
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth'; // พาย้ายไปหน้า Login ทันที
      throw new Error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}