import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getServices, deleteService, createService } from "../../api/services.api";
import { setServices, deleteService as deleteServiceAction, Service, addService } from "../../store/servicesSlice";

/* ================== MAIN ================== */
const ServicesPage: React.FC = () => {
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
        alert("Sử dụng dữ liệu mẫu do API lỗi");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadServices();
  }, []);

  /* ===== DELETE ===== */
  const handleDelete = async (serviceId: number) => {
  const ok = window.confirm("Bạn có chắc muốn xóa dịch vụ này không?");
  if (!ok) return;

  try {
    await deleteService(serviceId);

    // Chỉ xóa trên FE khi BE xóa thành công
    dispatch(deleteServiceAction(serviceId));
    alert("Xóa dịch vụ thành công");
  } catch (err: any) {
    console.error("Lỗi xóa service:", err);
    alert(
      err?.response?.data?.message ||
      "Xóa dịch vụ thất bại"
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

  if (loading) return <div>Đang tải dữ liệu...</div>;

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      {/* ================= FILTER ================= */}
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

        <button
          style={addButtonStyle}
          onClick={() => setShowAddModal(true)}
        >
          + Thêm mới
        </button>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <h3>Thêm dịch vụ mới</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                placeholder="Tên dịch vụ"
                value={newService.serviceName}
                onChange={e => setNewService({ ...newService, serviceName: e.target.value })}
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="Sức chứa"
                value={newService.capacity}
                onChange={e => setNewService({ ...newService, capacity: +e.target.value })}
                style={inputStyle}
              />
              <input
                placeholder="Mô tả"
                value={newService.description}
                onChange={e => setNewService({ ...newService, description: e.target.value })}
                style={inputStyle}
              />
              <input
                type="number"
                placeholder="Giá"
                value={newService.price}
                onChange={e => setNewService({ ...newService, price: +e.target.value })}
                style={inputStyle}
              />
              <select
                value={newService.status}
                onChange={e => setNewService({ ...newService, status: +e.target.value as 0 | 1 })}
                style={selectStyle}
              >
                <option value={1}>Hoạt động</option>
                <option value={0}>Không hoạt động</option>
              </select>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  style={{ ...addButtonStyle, background: '#6b7280' }}
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </button>
                <button
                  style={addButtonStyle}
                  onClick={async () => {
                    try {
                      const res = await createService(newService);

                      // BE phải trả về object service vừa tạo
                      const created: Service = res.data.data;

                      dispatch(addService(created));
                      alert('Thêm thành công');

                      setShowAddModal(false);
                      setNewService({
                        serviceName: '',
                        capacity: 0,
                        description: '',
                        price: 0,
                        status: 1,
                      });
                    } catch (err: any) {
                      console.error('Add failed:', err);
                      alert(
                        err?.response?.data?.message ||
                        'Thêm dịch vụ thất bại'
                      );
                    }
                  }}
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                      ? "Hoạt động"
                      : "Không hoạt động"}
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
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>

                    {/* DELETE */}
                    <button
                      style={deleteButtonStyle}
                      onClick={() => handleDelete(service.id)}
                      title="Xóa dịch vụ"
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
