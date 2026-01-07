import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  getServiceById,
  updateService,
  deleteService,
} from "../../api/services.api";
// 1. Import Hook đa ngôn ngữ
import { useLocale } from "../../i18n/LocaleContext";

/* ================= TYPES ================= */
export interface Service {
  id: number;
  serviceName: string;
  capacity: number;
  description: string;
  price: number;
  status: 0 | 1;
  version?: number;
}

/* ================= MAIN ================= */
const ServicesRepairPage: React.FC = () => {
  // 2. Sử dụng hook
  const { t } = useLocale();
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
        id: 0,
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
      .then((res) => {
        // Tuỳ cấu trúc response của bạn, nếu api.ts đã trả về data thì bỏ .data
        // Ở đây giữ nguyên logic cũ của bạn là res.data.data
        setForm(res.data?.data || res.data); 
      })
      .catch((err) => {
        console.error("Lỗi tải chi tiết service:", err);
        alert(err.message || t.services.usingMockData); // Fallback message
      })
      .finally(() => setLoading(false));
  }, [id, location.state, t]);

  if (loading || !form) return <div>{t.common.loadingData}</div>;

  /* ================= ACTIONS ================= */

  const handleSave = async () => {
    try {
      if (id === "new") {
        alert("Backend chưa có API tạo mới dịch vụ (Mock)");
        return;
      }

      await updateService(form.id, {
        serviceName: form.serviceName,
        capacity: form.capacity,
        description: form.description,
        price: form.price,
        status: form.status,
        version: form.version, // ⭐ BẮT BUỘC
      });

      alert(t.common.saveSuccess); // "Đã lưu"
      navigate("/admin/services");
    } catch (err: any) {
      console.error("Update failed:", err);
      // Hiển thị lỗi từ BE (đã dịch) hoặc lỗi mặc định
      alert(err.message || t.common.saveFailed);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t.services.confirmDelete)) return;

    try {
      await deleteService(form.id);
      alert(t.services.deleteSuccess);
      navigate("/admin/services");
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(err.message || t.services.deleteFailed);
    }
  };

  /* ================= UI ================= */

  return (
    <div style={pageStyle} className="mx-5 sm:mx-14 mt-7">
      <div style={cardStyle}>
        <FormRow label={t.services.serviceNameLabel}>
          <input
            value={form.serviceName}
            onChange={(e) =>
              setForm({ ...form, serviceName: e.target.value })
            }
            style={inputStyle}
            placeholder={t.services.serviceNamePlaceholder}
          />
        </FormRow>

        <FormRow label={t.services.descriptionLabel}>
          <input
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            style={inputStyle}
            placeholder={t.services.descriptionPlaceholder}
          />
        </FormRow>

        <FormRow label={t.services.capacityLabel}>
          <input
            type="number"
            value={form.capacity}
            onChange={(e) =>
              setForm({ ...form, capacity: +e.target.value })
            }
            style={inputStyle}
          />
        </FormRow>

        <FormRow label={t.services.priceLabel}>
          <input
            type="number"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: +e.target.value })
            }
            style={inputStyle}
          />
        </FormRow>

        <FormRow label={t.services.statusLabel}>
          <select
            value={form.status}
            onChange={(e) =>
              setForm({
                ...form,
                status: +e.target.value as 0 | 1,
              })
            }
            style={inputStyle}
          >
            <option value={1}>{t.common.active}</option>
            <option value={0}>{t.common.inactive}</option>
          </select>
        </FormRow>

        <div style={footerStyle}>
          {id !== "new" && (
            <button style={deleteBtn} onClick={handleDelete}>
              {t.common.delete}
            </button>
          )}
          <button style={saveBtn} onClick={handleSave}>
            {t.settings.saveInfo} {/* "Lưu thông tin" */}
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