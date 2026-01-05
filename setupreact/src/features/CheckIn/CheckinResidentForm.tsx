import { useState } from "react";

interface Resident {
  id: string;
  name: string;
  selected: boolean;
  isExtra: boolean;
}

export default function CheckinResidentForm() {
  const [residents, setResidents] = useState<Resident[]>([
    { id: "1", name: "Nguyễn A", selected: false, isExtra: false },
  ]);

  const handleAddRow = () => {
    const newRow: Resident = {
      id: (Math.random() * 100000).toFixed(0),
      name: "",
      selected: false,
      isExtra: true,
    };
    setResidents((prev) => [...prev, newRow]);
  };

  const handleNameChange = (id: string, value: string) => {
    setResidents((prev) =>
      prev.map((r) => (r.id === id ? { ...r, name: value } : r))
    );
  };

  const handleSelect = (id: string, checked: boolean) => {
    setResidents((prev) =>
      prev.map((r) => (r.id === id ? { ...r, selected: checked } : r))
    );
  };

  const handleCheckin = () => {
    const selected = residents.filter((r) => r.selected);
    if (selected.length === 0) return alert("Bạn chưa chọn ai để checkin!");
    alert("Checkin thành công!");
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 bg-white p-6 rounded-xl shadow">

      {/* ===== Thông tin cố định ===== */}
      <div className="space-y-3 mb-6 text-sm">
        <div className="flex">
          <span className="w-40 text-gray-500">Căn Hộ</span>
          <span>A22.01</span>
        </div>

        <div className="flex">
          <span className="w-40 text-gray-500">Chủ Hộ</span>
          <span>Nguyễn A</span>
        </div>

        <div className="flex">
          <span className="w-40 text-gray-500">Dịch Vụ</span>
          <span>Bơi (Hồ A)</span>
        </div>

        <div className="flex">
          <span className="w-40 text-gray-500">Phương Thức Checkin</span>
          <span>Thẻ</span>
        </div>

        <div className="flex">
          <span className="w-40 text-gray-500">Thời Gian Vào</span>
          <span>{new Date().toISOString().replace("T", " ").slice(0, 19)}</span>
        </div>

        <div className="flex">
          <span className="w-40 text-gray-500">Số Lượng</span>
          <span>{residents.length}</span>
        </div>
      </div>

      {/* ===== Bảng cư dân ===== */}
      <div className="border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-3 w-12 text-left">STT</th>
              <th className="p-3 text-left">Họ Và Tên</th>
              <th className="p-3 w-24 text-center">Chọn</th>
            </tr>
          </thead>

          <tbody>
            {residents.map((r, index) => {
              const isLastRow = index === residents.length - 1;

              return (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{index + 1}</td>

                  <td className="p-3">
                    <input
                      className="border rounded-lg p-2 w-full"
                      placeholder="Nhập tên..."
                      value={r.name}
                      readOnly={!r.isExtra}
                      onChange={(e) => handleNameChange(r.id, e.target.value)}
                    />
                  </td>

                  <td className="p-3 text-center">

                    {/* Nút thêm nằm cùng hàng với ô nhập (CHỈ HIỆN Ở DÒNG CUỐI) */}
                    {isLastRow ? (
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs"
                        onClick={handleAddRow}
                      >
                        + Thêm
                      </button>
                    ) : (
                      <input
                        type="checkbox"
                        checked={r.selected}
                        onChange={(e) =>
                          handleSelect(r.id, e.target.checked)
                        }
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Nút checkin */}
      <div className="flex justify-center mt-6">
        <button
          className="px-10 py-2 bg-blue-700 text-white rounded-lg"
          onClick={handleCheckin}
        >
          Checkin
        </button>
      </div>
    </div>
  );
}
