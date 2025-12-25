import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  getServiceById,
  updateService,
  deleteService,
} from "../../api/services.api";

/* ================= TYPES ================= */
export interface Service {
  serviceId: number;
  serviceName: string;
  capacity: number;
  description: string;
  price: number;
  status: 0 | 1;
}

/* ================= MAIN ================= */
const ServicesRepairPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD DETAIL ================= */
  useEffect(() => {
    if (!id) return;

    // Tạo mới
    if (id === "new") {
      setForm({
        serviceId: 0,
        serviceName: "",
        capacity: 0,
        description: "",
        price: 0,
        status: 1,
      });
      setLoading(false);
      return;
    }

    // Ưu tiên lấy từ state (navigate từ list)
    const serviceFromState = (location.state as any)?.service;
    if (serviceFromState) {
      setForm(serviceFromState);
      setLoading(false);
      return;
    }

    // Gọi API thật
    getServiceById(Number(id))
      .then(res => {
        setForm(res.data.data);
      })
      .catch(err => {
        console.error("Lỗi tải chi tiết service:", err);
        alert("Không tải được dữ liệu dịch vụ");
      })
      .finally(() => setLoading(false));
  }, [id, location.state]);

  if (loading || !form) return <div>Đang tải dữ liệu...</div>;

  /* ================= ACTIONS ================= */

  const handleSave = async () => {
    try {
      if (id === "new") {
        alert("Backend chưa có API tạo mới dịch vụ");
        return;
      }

      await updateService(form.serviceId, {
        serviceName: form.serviceName,
        capacity: form.capacity,
        description: form.description,
        price: form.price,
        status: form.status,
      });

      alert("Cập nhật dịch vụ thành công");
      navigate("/admin/services");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Cập nhật dịch vụ thất bại");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa dịch vụ này không?")) return;

    try {
      await deleteService(form.serviceId);
      alert("Xóa dịch vụ thành công");
      navigate("/admin/services");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Xóa dịch vụ thất bại");
    }
  };

  /* ================= UI ================= */

  return (
    <div style={pageStyle} className="mx-5 sm:mx-14 mt-7">
      <div style={cardStyle}>
        <FormRow label="Tên Dịch Vụ">
          <input
            value={form.serviceName}
            onChange={e =>
              setForm({ ...form, serviceName: e.target.value })
            }
            style={inputStyle}
          />
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
            value={form.price}
            onChange={e =>
              setForm({ ...form, price: +e.target.value })
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
                status: +e.target.value as 0 | 1,
              })
            }
            style={inputStyle}
          >
            <option value={1}>Hoạt Động</option>
            <option value={0}>Không Hoạt Động</option>
          </select>
        </FormRow>

        <div style={footerStyle}>
          {id !== "new" && (
            <button style={deleteBtn} onClick={handleDelete}>
              Xóa
            </button>
          )}
          <button style={saveBtn} onClick={handleSave}>
            Lưu Thông Tin
          </button>
        </div>
      </div>
    </div>
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
  background: "#fee2e2",
  color: "#dc2626",
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
