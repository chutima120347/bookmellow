import Navbar from '../components/Navbar';

function Profile() {
  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm flex items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-orange-300 flex items-center justify-center text-2xl font-bold text-orange-900">
            A
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Anya Reader</h1>
            <p className="text-xs text-slate-500 mb-2">สมาชิกสายอ่าน • อ่านแล้ว 12 เล่มในปีนี้</p>
            <span className="text-xs px-3 py-1 bg-amber-100 text-amber-800 rounded-full font-semibold">🏆 Top Bookworm</span>
          </div>
        </div>

        <div className="border-b border-orange-200 flex gap-6 mb-6 text-sm font-semibold text-slate-600">
          <button className="text-orange-600 border-b-2 border-orange-500 pb-2">อยากอ่าน (Want to Read)</button>
          <button className="hover:text-orange-600 pb-2 transition">กำลังอ่าน (Reading)</button>
          <button className="hover:text-orange-600 pb-2 transition">อ่านจบแล้ว (Read)</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition">
            <div className="w-full h-36 bg-orange-100 rounded-lg mb-2 flex items-center justify-center text-orange-400 font-bold">Cover</div>
            <h4 className="font-bold text-xs text-slate-800">ปริศนาเขาวงกต</h4>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Profile;