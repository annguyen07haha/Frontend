"use client";
import { useState, useEffect } from "react";

export default function Home() {
  // 1. CÁC BIẾN STATE (DỮ LIỆU)
  const [students, setStudents] = useState<any[]>([]);
  const [formData, setFormData] = useState({ ma_sv: "", ho_ten: "", lop: "", diem: "" });
  
  // Biến state cho WebSocket
  const [wsMessage, setWsMessage] = useState("");
  const [chatLog, setChatLog] = useState<string[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);

  // 2. CÁC HÀM XỬ LÝ REST API (HTTP)
  const fetchStudents = async () => {
    const res = await fetch("http://127.0.0.1:8000/api/students");
    const data = await res.json();
    setStudents(data);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("http://127.0.0.1:8000/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        diem: parseFloat(formData.diem) || 0
      }),
    });
    setFormData({ ma_sv: "", ho_ten: "", lop: "", diem: "" });
    fetchStudents();
  };

  const handleDelete = async (ma_sv: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sinh viên này?")) return;
    await fetch(`http://127.0.0.1:8000/api/students/${ma_sv}`, {
      method: "DELETE",
    });
    fetchStudents();
  };

  // 3. CÁC HÀM XỬ LÝ WEBSOCKET
  const connectWebSocket = () => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws");
    socket.onmessage = (event) => setChatLog((prev) => [...prev, event.data]);
    setWs(socket);
  };

  const sendWsMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (ws && wsMessage) {
      ws.send(wsMessage);
      setWsMessage("");
    }
  };

  // 4. GIAO DIỆN HIỂN THỊ (HTML)
  return (
    <main className="p-10 font-sans max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-blue-600 text-center">Hệ thống Quản lý Sinh viên</h1>
      
      {/* Form Thêm Sinh Viên */}
      <form onSubmit={handleAdd} className="mb-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Mã SV</label>
          <input required type="text" className="w-full border p-2 rounded" value={formData.ma_sv} onChange={(e) => setFormData({...formData, ma_sv: e.target.value})} />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Họ Tên</label>
          <input required type="text" className="w-full border p-2 rounded" value={formData.ho_ten} onChange={(e) => setFormData({...formData, ho_ten: e.target.value})} />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Lớp</label>
          <input required type="text" className="w-full border p-2 rounded" value={formData.lop} onChange={(e) => setFormData({...formData, lop: e.target.value})} />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Điểm</label>
          <input required type="number" step="0.1" className="w-full border p-2 rounded" value={formData.diem} onChange={(e) => setFormData({...formData, diem: e.target.value})} />
        </div>
        <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 transition">
          Thêm
        </button>
      </form>

      {/* Bảng Danh sách Sinh Viên */}
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full border-collapse bg-white">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-700">Mã SV</th>
              <th className="p-4 text-left font-semibold text-gray-700">Họ Tên</th>
              <th className="p-4 text-left font-semibold text-gray-700">Lớp</th>
              <th className="p-4 text-center font-semibold text-gray-700">Điểm</th>
              <th className="p-4 text-center font-semibold text-gray-700">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.map((sv) => (
              <tr key={sv.ma_sv} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-800">{sv.ma_sv}</td>
                <td className="p-4 text-gray-800">{sv.ho_ten}</td>
                <td className="p-4 text-gray-800">{sv.lop}</td>
                <td className="p-4 text-center font-bold text-green-600">{sv.diem}</td>
                <td className="p-4 text-center">
                  <button onClick={() => handleDelete(sv.ma_sv)} className="text-red-500 font-semibold hover:text-red-700">
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Giao diện Kiểm thử WebSocket */}
      <div className="mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-blue-600">Kiểm thử WebSocket Echo</h2>
        {!ws ? (
          <button onClick={connectWebSocket} className="bg-green-600 text-white font-bold py-2 px-6 rounded hover:bg-green-700 transition">
            Kết nối WebSocket
          </button>
        ) : (
          <form onSubmit={sendWsMessage} className="flex gap-4">
            <input type="text" value={wsMessage} onChange={(e) => setWsMessage(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-1 border p-2 rounded" required />
            <button type="submit" className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 transition">Gửi</button>
          </form>
        )}
        <div className="mt-4 bg-gray-100 p-4 rounded min-h-[100px] text-gray-800 font-mono text-sm">
          {chatLog.map((msg, i) => <p key={i}>{msg}</p>)}
        </div>
      </div>
    </main>
  );
}
