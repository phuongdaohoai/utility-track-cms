import React from "react";

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
const initialServices: Service[] = [
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
  const [serviceList, setServiceList] = React.useState<Service[]>(initialServices);
  const [selectedService, setSelectedService] = React.useState<Service | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"edit" | "delete">("edit");

  const openEditModal = (service: Service) => {
    setSelectedService(service);
    setModalMode("edit");
    setIsOpen(true);
  };

  const openDeleteModal = (service: Service) => {
    setSelectedService(service);
    setModalMode("delete");
    setIsOpen(true);
  };

  const handleDelete = (serviceId: number) => {
    setServiceList(prev => prev.filter(s => s.id !== serviceId));
    setIsOpen(false);
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      {/* TABLE */}
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
            {serviceList.map((service) => (
              <tr key={service.id} style={rowStyle}>
                <td style={tdStyle}>{service.name}</td>
                <td style={tdStyle}>{service.pricePerHour.toLocaleString("vi-VN")} đ</td>
                <td style={tdStyle}>{service.description}</td>
                <td style={tdStyle}>
                  <span style={service.status === "active" ? statusActiveStyle : statusInactiveStyle}>
                    {service.status === "active" ? "Hoạt động" : "Không hoạt động"}
                  </span>
                </td>
                <td style={tdStyle}>{service.capacity}</td>

                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button style={actionButtonStyle} onClick={() => openEditModal(service)}>
                      {iconEdit}
                    </button>
                    <button style={actionButtonStyle} onClick={() => openDeleteModal(service)}>
                      {iconDelete}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DETAIL */}
      {isOpen && selectedService && (
        <ServiceDetailModal
          service={selectedService}
          mode={modalMode}
          onClose={() => setIsOpen(false)}
          onDelete={handleDelete}
          onSave={(updatedService) => {
            setServiceList(prev =>
              prev.map(s => (s.id === updatedService.id ? updatedService : s))
            );
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
};

/* ================== MODAL ================== */
interface ModalProps {
  service: Service;
  mode: "edit" | "delete";
  onClose: () => void;
  onDelete: (serviceId: number) => void;
  onSave: (updatedService: Service) => void;
}

const ServiceDetailModal: React.FC<ModalProps> = ({
  service,
  mode,
  onClose,
  onDelete,
  onSave,
}) => {
  const [form, setForm] = React.useState<Service>(service);

  React.useEffect(() => {
    setForm(service);
  }, [service]);

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3 style={{ marginBottom: 20 }}>
          {mode === "edit" ? "Thông Tin Dịch Vụ" : "Xác Nhận Xóa Dịch Vụ"}
        </h3>

        <label>Tên Dịch Vụ</label>
        <input value={form.name} style={inputStyle} disabled />

        <label>Mô Tả</label>
        <input
          value={form.description}
          style={inputStyle}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          disabled={mode === "delete"}
        />

        <label>Sức Chứa</label>
        <input
          type="number"
          value={form.capacity}
          style={inputStyle}
          onChange={(e) => setForm({ ...form, capacity: +e.target.value })}
          disabled={mode === "delete"}
        />

        <label>Chi Phí (Giờ)</label>
        <input
          type="number"
          value={form.pricePerHour}
          style={inputStyle}
          onChange={(e) => setForm({ ...form, pricePerHour: +e.target.value })}
          disabled={mode === "delete"}
        />

        <label>Trạng Thái</label>
        {mode === "delete" ? (
          <input
            value={form.status === "active" ? "Hoạt động" : "Không hoạt động"}
            style={inputStyle}
            disabled
          />
        ) : (
          <select
            value={form.status}
            style={inputStyle}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as Service["status"] })
            }
          >
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={btnCancel}>
            Đóng
          </button>

          {mode === "edit" ? (
            <button style={btnSave} onClick={() => onSave(form)}>
              Lưu Thông Tin
            </button>
          ) : (
            <button style={btnDelete} onClick={() => onDelete(form.id)}>
              Xóa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================== STYLES ================== */

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

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.3)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: "#fff",
  padding: 24,
  width: 500,
  borderRadius: 8,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 8,
  marginBottom: 12,
  border: "1px solid #e5e7eb",
  borderRadius: 6,
};

const btnSave: React.CSSProperties = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
  cursor: "pointer",
};

const btnCancel: React.CSSProperties = {
  background: "#e5e7eb",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
  cursor: "pointer",
};

const btnDelete: React.CSSProperties = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 6,
  cursor: "pointer",
};

export default ServiceTable;
