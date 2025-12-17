import React, { useState } from "react";

interface CheckinItem {
  id: number;
  type: string;
  desc: string;
  status: "active" | "inactive";
}

const SystemConfiguration: React.FC = () => {
  // State cho form cấu hình
  const [formState, setFormState] = useState({
    operatingHours: "5h00 - 21h00",
    activity: "Bảo Trì",
    guestCheckIn: "Bật",
  });

  // State cho danh sách checkin
  const [checkinList, setCheckinList] = useState<CheckinItem[]>([
    { id: 1, type: "Thẻ", desc: "Thẻ Cư Dân", status: "active" },
    { id: 2, type: "Thủ Công", desc: "Không Mô Tả", status: "active" },
    { id: 3, type: "FaceID", desc: "Đang Bảo Trì", status: "inactive" },
    { id: 4, type: "QR Code", desc: "Đang Bảo Trì", status: "inactive" },
    { id: 5, type: "Vân Tay", desc: "Máy Sinh Trắc", status: "active" },
    { id: 6, type: "Mobile App", desc: "Checkin Qua App", status: "active" },
    { id: 7, type: "RFID", desc: "Thẻ Tầm Xa", status: "inactive" },
    { id: 8, type: "OTP", desc: "Mã Xác Thực", status: "active" },
    { id: 9, type: "Camera AI", desc: "Nhận Diện Khuôn Mặt", status: "inactive" },
    { id: 10, type: "Bluetooth", desc: "Thiết Bị Gần", status: "active" },
  ]);

  // State cho item đang chỉnh sửa
  const [editingItem, setEditingItem] = useState<CheckinItem | null>(null);

  // ====================== FORM HANDLERS ======================
  
  const handleFormChange = (field: keyof typeof formState, value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveForm = () => {
    alert(`Cấu hình đã được lưu:\n- Giờ hoạt động: ${formState.operatingHours}\n- Hoạt động: ${formState.activity}\n- Check-in khách ngoài: ${formState.guestCheckIn}`);
    // Thực tế: Gọi API để lưu dữ liệu
  };

  const handleDeleteForm = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa cấu hình hệ thống không?")) {
      setFormState({
        operatingHours: "",
        activity: "",
        guestCheckIn: "Bật"
      });
      alert("Cấu hình đã được xóa");
    }
  };

  // ====================== TABLE HANDLERS ======================
  
  const handleEditItem = (item: CheckinItem) => {
    setEditingItem({ ...item });
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    setCheckinList(prev => 
      prev.map(item => 
        item.id === editingItem.id ? editingItem : item
      )
    );
    
    alert(`Đã cập nhật phương thức "${editingItem.type}"`);
    setEditingItem(null);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleDeleteItem = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa phương thức này không?")) {
      setCheckinList(prev => prev.filter(item => item.id !== id));
      alert("Đã xóa phương thức thành công");
    }
  };

  const handleEditChange = (field: keyof CheckinItem, value: string) => {
    if (!editingItem) return;
    
    setEditingItem(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: field === 'status' ? value as "active" | "inactive" : value
      };
    });
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* ================= FORM ================= */}
        <div style={styles.box}>
          <div style={styles.formRow}>
            <label style={styles.label}>Giờ Hoạt Động</label>
            <input
              type="text"
              value={formState.operatingHours}
              onChange={(e) => handleFormChange('operatingHours', e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.formRow}>
            <label style={styles.label}>Hoạt Động</label>
            <input
              type="text"
              value={formState.activity}
              onChange={(e) => handleFormChange('activity', e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.formRow}>
            <label style={styles.label}>Check-In Khách Ngoài</label>
            <select
              style={styles.input}
              value={formState.guestCheckIn}
              onChange={(e) => handleFormChange('guestCheckIn', e.target.value)}
            >
              <option value="Bật">Bật</option>
              <option value="Tắt">Tắt</option>
            </select>
          </div>
        </div>

        {/* ================= ACTION BUTTONS ================= */}
        <div style={styles.actionRow}>
          <button style={styles.deleteBtn} onClick={handleDeleteForm}>
            Xóa
          </button>
          <button style={styles.saveBtn} onClick={handleSaveForm}>
            Lưu Thông Tin
          </button>
        </div>

        {/* ================= TITLE ================= */}
        <h3 style={styles.title}>Danh sách các phương thức checkin</h3>

        {/* ================= TABLE ================= */}
        <div style={styles.tableBox}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Kiểu Checkin</th>
                  <th style={styles.th}>Mô Tả</th>
                  <th style={styles.th}>Trạng Thái</th>
                  <th style={styles.th}>Thao Tác</th>
                </tr>
              </thead>

              <tbody>
                {checkinList.map((item) => (
                  <tr key={item.id} style={styles.tr}>
                    {editingItem?.id === item.id ? (
                      // ========== EDIT MODE ==========
                      <>
                        <td style={styles.td}>
                          <input
                            type="text"
                            value={editingItem.type}
                            onChange={(e) => handleEditChange('type', e.target.value)}
                            style={styles.editInput}
                          />
                        </td>
                        <td style={styles.td}>
                          <input
                            type="text"
                            value={editingItem.desc}
                            onChange={(e) => handleEditChange('desc', e.target.value)}
                            style={styles.editInput}
                          />
                        </td>
                        <td style={styles.td}>
                          <select
                            value={editingItem.status}
                            onChange={(e) => handleEditChange('status', e.target.value)}
                            style={styles.editSelect}
                          >
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Không hoạt động</option>
                          </select>
                        </td>
                        <td style={styles.td}>
                          <button 
                            style={styles.saveIconBtn}
                            onClick={handleSaveEdit}
                          >
                            💾
                          </button>
                          <button 
                            style={styles.cancelIconBtn}
                            onClick={handleCancelEdit}
                          >
                            ❌
                          </button>
                        </td>
                      </>
                    ) : (
                      // ========== VIEW MODE ==========
                      <>
                        <td style={styles.td}>{item.type}</td>
                        <td style={styles.td}>{item.desc}</td>
                        <td style={styles.td}>
                          {item.status === "active" ? (
                            <span style={styles.badgeActive}>Hoạt động</span>
                          ) : (
                            <span style={styles.badgeInactive}>
                              Không hoạt động
                            </span>
                          )}
                        </td>
                        <td style={styles.td}>
                          <button 
                            style={styles.editBtn}
                            onClick={() => handleEditItem(item)}
                          >
                            ✏️
                          </button>
                          <button 
                            style={styles.deleteIconBtn}
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================
            STYLES
============================= */

const baseButton: React.CSSProperties = {
  height: "40px",
  borderRadius: "6px",
  border: "none",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: "24px 40px",
    fontFamily: "Inter, sans-serif",
    backgroundColor: "#f5f7fa",
    minHeight: "100vh",
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },

  box: {
    background: "#fff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
    marginBottom: "25px",
  },

  formRow: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginBottom: "18px",
  },

  label: {
    width: "300px",
    fontWeight: 600,
    color: "#374151",
  },

  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    background: "#fff",
    transition: "border 0.2s ease",
  },

  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginBottom: "20px",
  },

  deleteBtn: {
    ...baseButton,
    minWidth: "120px",
    background: "#f3f4f6",
    color: "#374151",
  },
  
  deleteBtnHover: {
    background: "#e5e7eb",
  },

  saveBtn: {
    ...baseButton,
    minWidth: "150px",
    background: "#3B82F6",
    color: "#fff",
  },
  
  saveBtnHover: {
    background: "#2563eb",
  },

  title: {
    marginBottom: "12px",
    fontWeight: 600,
    color: "#1f2937",
    fontSize: "18px",
  },

  tableBox: {
    background: "#fff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
  },

  tableWrapper: {
    maxHeight: "400px",
    overflowY: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    padding: "12px 0",
    textAlign: "left",
    borderBottom: "1px solid #ddd",
    fontWeight: 600,
    position: "sticky",
    top: 0,
    background: "#fff",
    zIndex: 1,
    color: "#374151",
  },

  tr: {
    borderBottom: "1px solid #eee",
  },

  td: {
    padding: "12px 0",
    fontSize: "14px",
    color: "#4b5563",
  },

  badgeActive: {
    background: "#d1fae5",
    color: "#059669",
    padding: "6px 14px",
    borderRadius: "999px",
    fontWeight: 600,
    fontSize: "13px",
    display: "inline-block",
  },

  badgeInactive: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "6px 14px",
    borderRadius: "999px",
    fontWeight: 600,
    fontSize: "13px",
    display: "inline-block",
  },

  editBtn: {
    background: "#f3f4f6",
    border: "none",
    borderRadius: "6px",
    padding: "8px 12px",
    cursor: "pointer",
    marginRight: "8px",
    fontSize: "16px",
    transition: "background 0.2s ease",
  },
  
  editBtnHover: {
    background: "#e5e7eb",
  },

  deleteIconBtn: {
    background: "#fee2e2",
    border: "none",
    borderRadius: "6px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background 0.2s ease",
  },
  
  deleteIconBtnHover: {
    background: "#fecaca",
  },

  editInput: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
  },

  editSelect: {
    padding: "8px 12px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    background: "#fff",
    width: "100%",
  },

  saveIconBtn: {
    background: "#d1fae5",
    border: "none",
    borderRadius: "6px",
    padding: "8px 12px",
    cursor: "pointer",
    marginRight: "8px",
    fontSize: "16px",
    transition: "background 0.2s ease",
  },
  
  saveIconBtnHover: {
    background: "#a7f3d0",
  },

  cancelIconBtn: {
    background: "#fef3c7",
    border: "none",
    borderRadius: "6px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background 0.2s ease",
  },
  
  cancelIconBtnHover: {
    background: "#fde68a",
  },
};

// Thêm hiệu ứng hover
const addHoverEffects = () => {
  const styleSheet = document.styleSheets[0];
  
  // Xóa button hover
  styleSheet.insertRule(`
    button[style*="background: #f3f4f6"]:hover {
      background: #e5e7eb !important;
    }
  `);
  
  // Lưu button hover
  styleSheet.insertRule(`
    button[style*="background: #3B82F6"]:hover {
      background: #2563eb !important;
    }
  `);
  
  // Edit icon hover
  styleSheet.insertRule(`
    button[style*="background: #f3f4f6"]:hover {
      background: #e5e7eb !important;
    }
  `);
  
  // Xóa icon hover
  styleSheet.insertRule(`
    button[style*="background: #fee2e2"]:hover {
      background: #fecaca !important;
    }
  `);
  
  // Lưu icon hover
  styleSheet.insertRule(`
    button[style*="background: #d1fae5"]:hover {
      background: #a7f3d0 !important;
    }
  `);
  
  // Hủy icon hover
  styleSheet.insertRule(`
    button[style*="background: #fef3c7"]:hover {
      background: #fde68a !important;
    }
  `);
};

// Gọi hàm thêm hover effects khi component mount
if (typeof window !== 'undefined') {
  setTimeout(addHoverEffects, 100);
}

export default SystemConfiguration;