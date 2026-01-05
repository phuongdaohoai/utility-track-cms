import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getServices, deleteService, createService } from "../../api/services.api";
import { setServices, deleteService as deleteServiceAction, Service, addService } from "../../store/servicesSlice";
import { useLocale } from "../../i18n/LocaleContext";

/* ================== MAIN ================== */
const ServicesPage: React.FC = () => {
  const { t } = useLocale();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const services = useAppSelector(state => state.services.services);

  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({
    serviceName: '',
    capacity: 0,
    description: '',
    price: 0,
    status: 1,
  });

  /* ===== FILTER ===== */
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "inactive">("all");

  /* ===== LOAD API ===== */
  const loadServices = () => {
    setLoading(true);
    getServices(1, 10)
      .then(res => {
        console.log("API Response:", res.data);
        const data = res.data.data?.items || res.data.items || [];
        dispatch(setServices(data));
      })
      .catch(err => {
        console.error("Lỗi tải services:", err);
        // Mock data for testing
        const mockData: Service[] = [
          {
            id: 1,
            serviceName: "Dịch vụ 1",
            price: 100000,
            description: "Mô tả 1",
            status: 1,
            capacity: 10,
          },
          {
            id: 2,
            serviceName: "Dịch vụ 2",
            price: 200000,
            description: "Mô tả 2",
            status: 0,
            capacity: 5,
          },
        ];
        dispatch(setServices(mockData));
        alert(t.services.usingMockData);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadServices();
  }, []);

  /* ===== DELETE ===== */
  const handleDelete = async (serviceId: number) => {
    const ok = window.confirm(t.services.confirmDelete);
    if (!ok) return;

    try {
      await deleteService(serviceId);

      // Chỉ xóa trên FE khi BE xóa thành công
      dispatch(deleteServiceAction(serviceId));
      alert(t.services.deleteSuccess);
    } catch (err: any) {
      console.error("Lỗi xóa service:", err);
      alert(
        err?.response?.data?.message ||
        t.services.deleteFailed
      );
    }
  };

  /* ===== FILTER DATA ===== */
  const filteredServices = services.filter(service => {
    const matchName = service.serviceName
      .toLowerCase()
      .includes(keyword.toLowerCase());

    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && service.status === 1) ||
      (statusFilter === "inactive" && service.status === 0);

    return matchName && matchStatus;
  });

  if (loading) return <div>{t.common.loadingData}</div>;

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      {/* ================= FILTER ================= */}
      <div style={filterWrapperStyle}>
        <input
          placeholder={t.services.searchPlaceholder}
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          style={inputStyle}
        />

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          style={selectStyle}
        >
          <option value="all">{t.services.allStatus}</option>
          <option value="active">{t.common.active}</option>
          <option value="inactive">{t.common.inactive}</option>
        </select>

        <button
          style={addButtonStyle}
          onClick={() => setShowAddModal(true)}
        >
          + {t.common.addNew}
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            {/* ===== HEADER ===== */}
            <div style={modalHeaderStyle}>
              <h3 style={{ margin: 0 }}>➕ {t.services.addNewService}</h3>
              <button
                style={modalCloseBtn}
                onClick={() => setShowAddModal(false)}
              >
                ✕
              </button>
            </div>

            {/* ===== BODY ===== */}
            <div style={modalBodyStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>{t.services.serviceNameLabel}</label>
                <input
                  value={newService.serviceName}
                  onChange={e =>
                    setNewService({ ...newService, serviceName: e.target.value })
                  }
                  style={modalInputStyle}
                  placeholder={t.services.serviceNamePlaceholder}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>{t.services.capacityLabel}</label>
                <input
                  type="number"
                  value={newService.capacity}
                  onChange={e =>
                    setNewService({ ...newService, capacity: +e.target.value })
                  }
                  style={modalInputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>{t.services.descriptionLabel}</label>
                <textarea
                  value={newService.description}
                  onChange={e =>
                    setNewService({ ...newService, description: e.target.value })
                  }
                  style={modalTextareaStyle}
                  placeholder={t.services.descriptionPlaceholder}
                />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>{t.services.priceLabel}</label>
                  <input
                    type="number"
                    value={newService.price}
                    onChange={e =>
                      setNewService({ ...newService, price: +e.target.value })
                    }
                    style={modalInputStyle}
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>{t.services.statusLabel}</label>
                  <select
                    value={newService.status}
                    onChange={e =>
                      setNewService({
                        ...newService,
                        status: +e.target.value as 0 | 1,
                      })
                    }
                    style={modalInputStyle}
                  >
                    <option value={1}>{t.common.active}</option>
                    <option value={0}>{t.common.inactive}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ===== FOOTER ===== */}
            <div style={modalFooterStyle}>
              <button
                style={cancelButtonStyle}
                onClick={() => setShowAddModal(false)}
              >
                {t.common.cancel}
              </button>

              <button
                style={saveButtonStyle}
                onClick={async () => {
                  try {
                    const res = await createService(newService);
                    dispatch(addService(res.data.data));
                    alert(t.common.addSuccess);
                    setShowAddModal(false);
                  } catch (err: any) {
                    alert(err?.response?.data?.message || t.common.addFailed);
                  }
                }}
              >
                {t.common.save}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ================= TABLE ================= */}
      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead style={theadStyle}>
            <tr>
              <th style={thStyle}>{t.services.serviceName}</th>
              <th style={thStyle}>{t.services.pricePerHour}</th>
              <th style={thStyle}>{t.services.description}</th>
              <th style={thStyle}>{t.common.status}</th>
              <th style={thStyle}>{t.services.capacity}</th>
              <th style={thStyle}>{t.common.actions}</th>
            </tr>
          </thead>

          <tbody>
            {filteredServices.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 20 }}>
                  {t.services.noServices}
                </td>
              </tr>
            )}

            {filteredServices.map(service => (
              <tr key={service.id} style={rowStyle}>
                <td style={tdStyle}>{service.serviceName}</td>

                <td style={tdStyle}>
                  {service.price.toLocaleString("vi-VN")} đ
                </td>

                <td style={tdStyle}>{service.description}</td>

                <td style={tdStyle}>
                  <span
                    style={
                      service.status === 1
                        ? statusActiveStyle
                        : statusInactiveStyle
                    }
                  >
                    {service.status === 1
                      ? t.common.active
                      : t.common.inactive}
                  </span>
                </td>

                <td style={tdStyle}>{service.capacity}</td>

                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: 10 }}>
                    {/* EDIT */}
                    <button
                      style={actionButtonStyle}
                      onClick={() =>
                        navigate(`/admin/services/${service.id}`, { state: { service } })
                      }
                      title={t.common.edit}
                    >
                      ✏️
                    </button>

                    {/* DELETE */}
                    <button
                      style={deleteButtonStyle}
                      onClick={() => handleDelete(service.id)}
                      title={t.common.delete}
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

export default ServicesPage;

/* ================== CSS ================== */
const modalHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: 12,
  borderBottom: "1px solid #e5e7eb",
};

const modalBodyStyle: React.CSSProperties = {
  marginTop: 16,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const modalFooterStyle: React.CSSProperties = {
  marginTop: 24,
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  borderTop: "1px solid #e5e7eb",
  paddingTop: 16,
};

const modalInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  outline: "none",
};

const modalTextareaStyle: React.CSSProperties = {
  ...modalInputStyle,
  minHeight: 80,
  resize: "vertical",
};

const labelStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 4,
};

const formGroupStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const modalCloseBtn: React.CSSProperties = {
  border: "none",
  background: "transparent",
  fontSize: 18,
  cursor: "pointer",
};

const cancelButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 6,
  border: "1px solid #d1d5db",
  background: "#fff",
  cursor: "pointer",
};

const saveButtonStyle: React.CSSProperties = {
  padding: "8px 20px",
  borderRadius: 6,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};


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
  padding: "8px 40px 8px 12px",
  borderRadius: 6,
  border: "1px solid #e5e7eb",
  appearance: "none",
  backgroundColor: "#fff",
};

const addButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 6,
  border: "1px solid #1e3a8a",
  background: "#1e3a8a",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const tableWrapperStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  maxHeight: 354,
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
};

const deleteButtonStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 8,
  border: "1px solid #fecaca",
  background: "#fff",
  cursor: "pointer",
  color: "#dc2626",
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  background: '#fff',
  padding: 24,
  borderRadius: 8,
  maxWidth: 500,
  width: '90%',
  maxHeight: '80vh',
  overflowY: 'auto',
};
