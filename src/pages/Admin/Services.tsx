import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/* ================== TYPES ================== */
export interface Service {
  id: number;
  name: string;
  pricePerHour: number;
  description: string;
  status: "active" | "inactive";
  capacity: number;
}

/* ================== MOCK DATA ================== */
export const initialServices: Service[] = [
  { id: 1, name: "Hồ Bơi Người Lớn", pricePerHour: 30000, description: "Chiều Cao Trên M6", status: "active", capacity: 30 },
  { id: 2, name: "Gym", pricePerHour: 20000, description: "Không Mô Tả", status: "active", capacity: 30 },
  { id: 3, name: "Hồ Bơi Trẻ Em", pricePerHour: 20000, description: "Đang Bảo Trì", status: "inactive", capacity: 30 },
  { id: 4, name: "Yoga", pricePerHour: 25000, description: "Lớp sáng", status: "active", capacity: 20 },
  { id: 5, name: "Xông Hơi", pricePerHour: 15000, description: "Không mùi", status: "active", capacity: 10 },
];

/* ================== MAIN ================== */
const ServiceTable: React.FC = () => {
  const navigate = useNavigate();

  /* ===== DATA ===== */
  const [services, setServices] = useState<Service[]>(() => {
    const data = sessionStorage.getItem("services");
    if (data) return JSON.parse(data);

    sessionStorage.setItem("services", JSON.stringify(initialServices));
    return initialServices;
  });

  /* ===== FILTER ===== */
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const filteredServices = services.filter(service => {
    const matchName = service.name.toLowerCase().includes(keyword.toLowerCase());
    const matchStatus =
      statusFilter === "all" || service.status === statusFilter;

    return matchName && matchStatus;
  });

  /* ===== DELETE ===== */
  const handleDelete = (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa dịch vụ này không?")) return;

    const updated = services.filter(s => s.id !== id);
    setServices(updated);
    sessionStorage.setItem("services", JSON.stringify(updated));
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>

      {/* ================= FILTER AREA ================= */}
      <div style={filterWrapperStyle}>
        <input
          placeholder="Tìm theo tên dịch vụ..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          style={inputStyle}
        />

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          style={selectStyle}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
      </div>

      {/* ================= TABLE ================= */}
      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead style={theadStyle}>
            <tr>
              <th style={thStyle}>Tên Dịch Vụ</th>
              <th style={thStyle}>Phí / Giờ</th>
              <th style={thStyle}>Mô Tả</th>
              <th style={thStyle}>Trạng Thái</th>
              <th style={thStyle}>Sức Chứa</th>
              <th style={thStyle}>Thao Tác</th>
            </tr>
          </thead>

          <tbody>
            {filteredServices.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>
                  Không có dịch vụ phù hợp
                </td>
              </tr>
            )}

            {filteredServices.map(service => (
              <tr key={service.id} style={rowStyle}>
                <td style={tdStyle}>{service.name}</td>
                <td style={tdStyle}>
                  {service.pricePerHour.toLocaleString("vi-VN")} đ
                </td>
                <td style={tdStyle}>{service.description}</td>
                <td style={tdStyle}>
                  <span
                    style={
                      service.status === "active"
                        ? statusActiveStyle
                        : statusInactiveStyle
                    }
                  >
                    {service.status === "active"
                      ? "Hoạt động"
                      : "Không hoạt động"}
                  </span>
                </td>
                <td style={tdStyle}>{service.capacity}</td>

                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      style={actionButtonStyle}
                      onClick={() => navigate(`/admin/services/${service.id}`)}
                    >
                      ✏️
                    </button>

                    <button
                      style={actionButtonStyle}
                      onClick={() => handleDelete(service.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

  );
};

export default ServiceTable;

/* ================== CSS ================== */

const filterWrapperStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
  marginBottom: 16,
};

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #e5e7eb",
  width: 240,
};

const selectStyle: React.CSSProperties = {
  padding: "8px 40px 8px 12px", // chừa chỗ mũi tên
  borderRadius: 6,
  border: "1px solid #e5e7eb",
  appearance: "none",          // 🔥 bỏ mũi tên mặc định
  WebkitAppearance: "none",    // Safari
  MozAppearance: "none",       // Firefox
  backgroundColor: "#fff",
};

const tableWrapperStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  maxHeight: 354,      // ~ 5 dòng
  overflowY: "auto",   // bật thanh cuộn
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const theadStyle: React.CSSProperties = {
  background: "#f9fafb",
};

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontWeight: 700,
  textAlign: "left",
};

const rowStyle: React.CSSProperties = {
  borderBottom: "1px solid #e5e7eb",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
};

const statusActiveStyle: React.CSSProperties = {
  background: "#d4f8dc",
  color: "#1fa940",
  padding: "4px 12px",
  borderRadius: 20,
  fontWeight: 600,
};

const statusInactiveStyle: React.CSSProperties = {
  background: "#ffd6d6",
  color: "#ff4343",
  padding: "4px 12px",
  borderRadius: 20,
  fontWeight: 600,
};

const actionButtonStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
};
