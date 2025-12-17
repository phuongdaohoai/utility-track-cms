import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Service } from "./Services";

const ServicesRepairPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const services: Service[] = JSON.parse(
    sessionStorage.getItem("services") || "[]"
  );

  const service = services.find(s => s.id === Number(id));
  if (!service) return <div>Không tìm thấy dịch vụ</div>;

  const [form, setForm] = React.useState<Service>(service);

  const handleSave = () => {
    const updated = services.map(s =>
      s.id === form.id ? form : s
    );
    sessionStorage.setItem("services", JSON.stringify(updated));
    navigate("/admin/services");
  };

  const handleDelete = () => {
    if (!window.confirm("Bạn có chắc muốn xóa dịch vụ này không?")) return;

    const updated = services.filter(s => s.id !== form.id);
    sessionStorage.setItem("services", JSON.stringify(updated));
    navigate("/admin/services");
  };

  return (
    <>    

    <div style={pageStyle} className="mx-5 sm:mx-14 mt-7">
      <div style={cardStyle}>
        <FormRow label="Tên Dịch Vụ">
          <input value={form.name} disabled style={inputStyle} />
        </FormRow>

        <FormRow label="Mô Tả">
          <input
            value={form.description}
            onChange={e =>
              setForm({ ...form, description: e.target.value })
            }
            style={inputStyle}
          />
        </FormRow>

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

        <FormRow label="Chi Phí">
          <input
            type="number"
            value={form.pricePerHour}
            onChange={e =>
              setForm({ ...form, pricePerHour: +e.target.value })
            }
            style={inputStyle}
          />
        </FormRow>

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

        <div style={footerStyle}>
          <button style={deleteBtn} onClick={handleDelete}>
            Xóa
          </button>
          <button style={saveBtn} onClick={handleSave}>
            Lưu Thông Tin
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default ServicesRepairPage;

/* ================= COMPONENT ================= */

const FormRow: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div style={{ display: "flex", marginBottom: 16 }}>
    <div style={{ width: 160, fontWeight: 500 }}>{label}</div>
    <div style={{ flex: 1 }}>{children}</div>
  </div>
);

/* ================= STYLES ================= */

const pageStyle: React.CSSProperties = {
 
  background: "#f8fafc",
  minHeight: "100vh",
};

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  borderRadius: 8,
  padding: 24,
  maxWidth: 1000,
  margin: "0 auto",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 38,
  padding: "0 10px",
  border: "1px solid #e5e7eb",
  borderRadius: 6,
};

const footerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  marginTop: 24,
};

const deleteBtn: React.CSSProperties = {
  background: "#e5e7eb",
  border: "none",
  padding: "8px 16px",
  borderRadius: 6,
  cursor: "pointer",
};

const saveBtn: React.CSSProperties = {
  background: "#1e3a8a",
  color: "#fff",
  border: "none",
  padding: "8px 18px",
  borderRadius: 6,
  cursor: "pointer",
};
