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

/* ================== ICONS ================== */
const iconEdit = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
    <path
      d="M17.414 2.586a2 2 0 0 0-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 0 0 0-2.828z"
      stroke="#4b5563"
      strokeWidth="1.5"
    />
  </svg>
);

const iconDelete = (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
    <path
      d="M9 3h6m2 0h-10m12 3H6m1 0v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6"
      stroke="#ef4444"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ================== MAIN ================== */
const ServiceTable: React.FC = () => {
  const navigate = useNavigate();

  // ✅ STATE
  const [services, setServices] = useState<Service[]>(initialServices);

  // ✅ HANDLE DELETE
  const handleDelete = (id: number) => {
    const ok = window.confirm("Bạn có chắc muốn xóa dịch vụ này không?");
    if (!ok) return;

    setServices(prev => prev.filter(service => service.id !== id));
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
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
            {services.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>
                  Không còn dịch vụ nào
                </td>
              </tr>
            )}

            {services.map(service => (
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
                      onClick={() =>
                        navigate(`/admin/services/${service.id}`)
                      }
                    >
                      {iconEdit}
                    </button>

                    <button
                      style={actionButtonStyle}
                      onClick={() => handleDelete(service.id)} // ✅ XÓA
                    >
                      {iconDelete}
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

const tableWrapperStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  maxHeight: 250,
  overflowY: "auto",
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
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
