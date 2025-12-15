import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Service } from "./Services";
import { initialServices } from "./Services";

const ServicesRepairPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const service = initialServices.find(s => s.id === Number(id));
  if (!service) return <div>Không tìm thấy dịch vụ</div>;

  const [form, setForm] = React.useState<Service>(service);

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Tên dịch vụ */}
        <FormRow label="Tên Dịch Vụ">
          <input value={form.name} disabled style={inputStyle} />
        </FormRow>

        {/* Mô tả */}
        <FormRow label="Mô Tả">
          <input
            value={form.description}
            onChange={e =>
              setForm({ ...form, description: e.target.value })
            }
            style={inputStyle}
          />
        </FormRow>

        {/* Sức chứa */}
        <FormRow label="Sức Chứa">
          <input
            type="number"
            value={form.capacity}
            onChange={e =>
              setForm({ ...form, capacity: +e.target.value })
            }
            style={inputStyle}
          />
        </FormRow>

        {/* Chi phí */}
        <FormRow label="Chi Phí">
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="number"
              value={form.pricePerHour}
              onChange={e =>
                setForm({ ...form, pricePerHour: +e.target.value })
              }
              style={{
                ...inputStyle,
                flex: 1,              // Chi phí dài
              }}
            />
            <select
              style={{
                ...inputStyle,
                width: 90,            // Giờ ngắn
                flex: "0 0 90px",
              }}
            >
              <option>Giờ</option>
            </select>
          </div>
        </FormRow>

        {/* Trạng thái */}
        <FormRow label="Trạng Thái">
          <select
            value={form.status}
            onChange={e =>
              setForm({
                ...form,
                status: e.target.value as Service["status"],
              })
            }
            style={inputStyle}
          >
            <option value="active">Hoạt Động</option>
            <option value="inactive">Không Hoạt Động</option>
          </select>
        </FormRow>

        {/* Footer */}
        <div style={footerStyle}>
          <button
            style={deleteBtn}
            onClick={() => navigate(-1)}
          >
            Xóa
          </button>
          <button style={saveBtn}>
            Lưu Thông Tin
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= COMPONENT ================= */

const FormRow: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div style={rowStyle}>
    <div style={labelStyle}>{label}</div>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

/* ================= STYLES ================= */

const pageStyle: React.CSSProperties = {
  padding: 24,
  background: "#f8fafc",
  minHeight: "100vh",
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 8,
  padding: 24,
  maxWidth: 1200,        // 👈 BẢNG DÀI RA
  margin: "0 auto",      // 👈 căn giữa
  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  marginBottom: 16,
};

const labelStyle: React.CSSProperties = {
  width: 160,            // 👈 rộng hơn cho bảng dài
  fontWeight: 500,
  color: "#374151",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 38,
  padding: "0 10px",
  border: "1px solid #e5e7eb",
  borderRadius: 6,
  fontSize: 14,
};

const footerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  marginTop: 24,
};

const deleteBtn: React.CSSProperties = {
  background: "#e5e7eb",
  color: "#111827",
  border: "none",
  padding: "8px 16px",
  borderRadius: 6,
  cursor: "pointer",
};

const saveBtn: React.CSSProperties = {
  background: "#1e3a8a",
  color: "#ffffff",
  border: "none",
  padding: "8px 18px",
  borderRadius: 6,
  cursor: "pointer",
};

export default ServicesRepairPage;
