import React, { useState } from "react";

const SystemConfiguration: React.FC = () => {
  const [formState] = useState({
    operatingHours: "5h00 - 21h00",
    activity: "Bảo Trì",
    guestCheckIn: "Bật",
  });

  const checkinList = [
    { id: 1, type: "Thẻ", desc: "Thẻ Cư Dân", status: "active" },
    { id: 2, type: "Thủ Công", desc: "Không Mô Tả", status: "active" },
    { id: 3, type: "FaceID", desc: "Đang Bảo Trì", status: "inactive" },
    { id: 4, type: "QR Code", desc: "Đang Bảo Trì", status: "inactive" },
  ];

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
              style={styles.input}
              readOnly
            />
          </div>

          <div style={styles.formRow}>
            <label style={styles.label}>Hoạt Động</label>
            <input
              type="text"
              value={formState.activity}
              style={styles.input}
              readOnly
            />
          </div>

          <div style={styles.formRow}>
            <label style={styles.label}>Check-In Khách Ngoài</label>
            <select style={styles.select} defaultValue={formState.guestCheckIn}>
              <option value="Bật">Bật</option>
              <option value="Tắt">Tắt</option>
            </select>
          </div>
        </div>

        {/* ================= ACTION BUTTONS ================= */}
        <div style={styles.actionRow}>
          <button style={styles.deleteBtn}>Xóa</button>
          <button style={styles.saveBtn}>Lưu Thông Tin</button>
        </div>

        {/* ================= TITLE ================= */}
        <h3 style={styles.title}>Danh sách các phương thức checkin</h3>

        {/* ================= TABLE ================= */}
        <div style={styles.tableBox}>
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
                    <button style={styles.iconBtn}>✏️</button>
                    <button style={styles.iconBtn}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    justifyContent: "center",
    padding: "40px",
    fontFamily: "Inter, sans-serif",
  },

  container: {
    width: "1000px",
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },

  label: {
    width: "220px",
    fontWeight: 600,
  },

  input: {
    width: "60%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
  },

  select: {
    width: "63%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #ddd",
    fontSize: "14px",
    background: "#fff",
  },

  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "12px",
    marginBottom: "20px",
  },

  deleteBtn: {
    ...baseButton,
    minWidth: "120px",
    background: "#e5e7eb",
    color: "#111",
  },

  saveBtn: {
    ...baseButton,
    minWidth: "150px",
    background: "#3B82F6",
    color: "#fff",
  },

  title: {
    marginBottom: "12px",
    fontWeight: 600,
  },

  tableBox: {
    background: "#fff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
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
  },

  tr: {
    borderBottom: "1px solid #eee",
  },

  td: {
    padding: "12px 0",
    textAlign: "left",
    fontSize: "14px",
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

  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "18px",
    marginRight: "10px",
  },
};

export default SystemConfiguration;
