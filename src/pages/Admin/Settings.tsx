import React, { useState } from "react";

interface CheckinItem {
  id: number;
  type: string;
  desc: string;
  status: "active" | "inactive";
}

const SystemConfiguration: React.FC = () => {
  /* ================= FORM STATE ================= */
  const [formState, setFormState] = useState({
    operatingHours: "5h00 - 21h00",
    activity: "Bảo Trì",
    guestCheckIn: "Bật",
  });

  /* ================= TABLE STATE ================= */
  const [checkinList, setCheckinList] = useState<CheckinItem[]>([
    { id: 1, type: "Thẻ", desc: "Thẻ Cư Dân", status: "active" },
    { id: 2, type: "Thủ Công", desc: "Không Mô Tả", status: "active" },
    { id: 3, type: "FaceID", desc: "Đang Bảo Trì", status: "inactive" },
    { id: 4, type: "QR Code", desc: "Đang Bảo Trì", status: "inactive" },
    { id: 5, type: "Vân Tay", desc: "Máy Sinh Trắc", status: "active" },
  ]);

  const [editingItem, setEditingItem] = useState<CheckinItem | null>(null);

  /* ================= HANDLERS ================= */
  const handleFormChange = (field: keyof typeof formState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveForm = () => {
    alert("Đã lưu cấu hình");
  };

  const handleEditItem = (item: CheckinItem) => {
    setEditingItem({ ...item });
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    setCheckinList(prev =>
      prev.map(i => (i.id === editingItem.id ? editingItem : i))
    );
    setEditingItem(null);
  };

  const handleDeleteItem = (id: number) => {
    if (!window.confirm("Xóa phương thức này?")) return;
    setCheckinList(prev => prev.filter(i => i.id !== id));
  };

  const handleEditChange = (field: keyof CheckinItem, value: string) => {
    if (!editingItem) return;
    setEditingItem(prev =>
      prev ? { ...prev, [field]: field === "status" ? value as any : value } : prev
    );
  };

  return (
    <div style={pageStyle}>
      {/* ================= FORM ================= */}
      <div style={boxStyle}>
        {[
          ["Giờ Hoạt Động", "operatingHours"],
          ["Hoạt Động", "activity"],
        ].map(([label, key]) => (
          <div key={key} style={formRowStyle}>
            <label style={labelStyle}>{label}</label>
            <input
              style={inputStyle}
              value={formState[key as keyof typeof formState]}
              onChange={e => handleFormChange(key as any, e.target.value)}
            />
          </div>
        ))}

        <div style={formRowStyle}>
          <label style={labelStyle}>Check-in Khách Ngoài</label>
          <select
            style={inputStyle}
            value={formState.guestCheckIn}
            onChange={e => handleFormChange("guestCheckIn", e.target.value)}
          >
            <option>Bật</option>
            <option>Tắt</option>
          </select>
        </div>

        <div style={{ textAlign: "right" }}>
          <button style={primaryBtn} onClick={handleSaveForm}>
            Lưu thông tin
          </button>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <h3 style={titleStyle}>Danh sách phương thức checkin</h3>

      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Kiểu Checkin</th>
              <th style={thStyle}>Mô Tả</th>
              <th style={thStyle}>Trạng Thái</th>
              <th style={thStyle}>Thao Tác</th>
            </tr>
          </thead>

          <tbody>
            {checkinList.map(item => (
              <tr key={item.id} style={rowStyle}>
                {editingItem?.id === item.id ? (
                  <>
                    <td style={tdStyle}>
                      <input
                        style={editInput}
                        value={editingItem.type}
                        onChange={e => handleEditChange("type", e.target.value)}
                      />
                    </td>
                    <td style={tdStyle}>
                      <input
                        style={editInput}
                        value={editingItem.desc}
                        onChange={e => handleEditChange("desc", e.target.value)}
                      />
                    </td>
                    <td style={tdStyle}>
                      <select
                        style={editInput}
                        value={editingItem.status}
                        onChange={e => handleEditChange("status", e.target.value)}
                      >
                        <option value="active">Hoạt động</option>
                        <option value="inactive">Không hoạt động</option>
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <button style={iconBtn} onClick={handleSaveEdit}>💾</button>
                      <button style={iconBtn} onClick={() => setEditingItem(null)}>❌</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={tdStyle}>{item.type}</td>
                    <td style={tdStyle}>{item.desc}</td>
                    <td style={tdStyle}>
                      <span style={item.status === "active" ? badgeActive : badgeInactive}>
                        {item.status === "active" ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button style={iconBtn} onClick={() => handleEditItem(item)}>✏️</button>
                      <button style={iconBtn} onClick={() => handleDeleteItem(item.id)}>🗑️</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemConfiguration;

/* ================== STYLES (ĐỒNG NHẤT SERVICES) ================== */
const pageStyle: React.CSSProperties = {
  fontFamily: "Arial, sans-serif",
};

const boxStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: 20,
  marginBottom: 24,
  background: "#fff",
};

const formRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  marginBottom: 14,
  gap: 16,
};

const labelStyle: React.CSSProperties = {
  width: 260,
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  flex: 1,
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #e5e7eb",
};

const primaryBtn: React.CSSProperties = {
  padding: "8px 20px",
  borderRadius: 6,
  border: "none",
  background: "#143CA6",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const titleStyle: React.CSSProperties = {
  marginBottom: 12,
  fontSize: 18,
  fontWeight: 600,
};

const tableWrapperStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  maxHeight: 400,
  overflowY: "auto",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  background: "#f9fafb",
  fontWeight: 700,
  textAlign: "left",
};

const rowStyle: React.CSSProperties = {
  borderBottom: "1px solid #e5e7eb",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
};

const badgeActive: React.CSSProperties = {
  background: "#d4f8dc",
  color: "#1fa940",
  padding: "4px 12px",
  borderRadius: 20,
  fontWeight: 600,
};

const badgeInactive: React.CSSProperties = {
  background: "#ffd6d6",
  color: "#ff4343",
  padding: "4px 12px",
  borderRadius: 20,
  fontWeight: 600,
};

const iconBtn: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  background: "#fff",
  borderRadius: 6,
  padding: "6px 10px",
  cursor: "pointer",
  marginRight: 6,
};

const editInput: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #e5e7eb",
};
