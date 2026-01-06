import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { api } from "../../utils/api";
import { useLocale } from "../../i18n/LocaleContext";

const ITEMS_PER_PAGE = 10;

/* ================== FORMAT DATETIME (NEW) ================== */
const formatDateTime = (value?: string) => {
  if (!value) return "--";

  const d = new Date(value);

  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();

  return `${hours}h${minutes} - ${day}/${month}/${year}`;
};

/* ================== TYPES ================== */
interface UsageItem {
  id: number;
  quantity?: number;
  additionalGuests?: string;

  checkInOut?: {
    checkInTime?: string;
    checkOutTime?: string;
    method?: string;
  };

  resident?: {
    fullName: string;
    avatar?: string;
    phone?: string;
  };

  service?: {
    serviceName: string;
    price: number;
  };

  staff?: {
    fullName: string;
  };
}
interface HistoryDetail {
  id: number;
  usageTime: string;
  item: {
    displayName: string;
    remainingNames: string[];
    totalGuests: number;
    checkInTime?: string;
    checkOutTime?: string;
    method?: string;
    phone?: string;
  };
  apartment?: string | null;
  service: {
    serviceName: string;
    price: number;
    capacity: number;
  };
  staff?: {
    fullName: string;
  } | null;
}



/* ================== MAIN ================== */
const UsageHistory: React.FC = () => {
  const { t } = useLocale();
  const [inputText, setInputText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [data, setData] = useState<UsageItem[]>([]);
  const [selectedUser, setSelectedUser] = useState<HistoryDetail | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ================== FETCH LIST ================== */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(
          `/history_checkin?searchName=${searchText}&page=${currentPage}&limit=${ITEMS_PER_PAGE}`
        );
        if (!res.ok) {
          throw new Error(t.common.loadingData);
        }

        const json = await res.json();
        console.log("json", json.data.data);
        setData(json.data.data);
        setTotalPages(json.data.meta.totalPages);
      } catch (err) {
        console.error("Fetch usage history error:", err);
      }
    };

    fetchData();
  }, [searchText, currentPage]);

  /* ================== FETCH DETAIL ================== */
  const openDetail = async (id: number) => {
    try {
      const res = await api.get(`/history_checkin/${id}`);
      const json = await res.json();

      if (json.success) {
        setSelectedUser(json.data);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error("Fetch detail error:", err);
    }
  };

  /* ================== EXPORT EXCEL ================== */
  const exportToExcel = () => {
    const excelData = data.map((item) => ({
      [t.history.type]: item.resident ? t.history.resident : t.history.guest,
      [t.history.residentOrGuest]: item.resident?.fullName,
      [t.history.service]: item.service?.serviceName,
      [t.history.system]: item.checkInOut?.method,
      [t.history.checkInTime]: formatDateTime(item.checkInOut?.checkInTime),
      [t.history.checkOutTime]: formatDateTime(item.checkInOut?.checkOutTime),
      [t.history.quantity]: item.quantity ?? 1,
      [t.history.fee]: item.service?.price,
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "UsageHistory");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "UsageHistory.xlsx");
  };

  /* ================== PAGINATION ================== */
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div style={pageStyle}>
      {/* ===== TOP BAR ===== */}
      <div style={topBarStyle}>
        <div style={searchWrapStyle}>
          <input
            placeholder={t.history.searchPlaceholder}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={inputStyle}
          />
          <button
            style={primaryBtn}
            onClick={() => {
              setSearchText(inputText);
              setCurrentPage(1);
            }}
          >
            {t.common.search}
          </button>
        </div>

        <button style={primaryBtn} onClick={exportToExcel}>
          {t.common.exportExcel}
        </button>
      </div>

      {/* ===== LEGEND ===== */}
      <div style={legendStyle}>
        <div style={legendItem}>
          <span style={{ ...legendDot, background: "#2D9CDB" }} />
          <span>{t.history.resident}</span>
        </div>
        <div style={legendItem}>
          <span style={{ ...legendDot, background: "#F2C94C" }} />
          <span>{t.history.guest}</span>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {[
                t.history.residentOrGuest,
                t.history.service,
                t.history.system,
                t.history.checkInTime,
                t.history.checkOutTime,
                t.history.quantity,
                t.history.fee,
              ].map((h) => (
                <th key={h} style={thStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((item) => {
              const isResident = !!item.resident;

              return (
                <tr
                  key={item.id}
                  style={rowStyle}
                  onClick={() => openDetail(item.id)}
                >
                  <td style={tdStyle}>
                    <div style={userCellStyle}>
                      <div
                        style={{
                          ...colorBoxStyle,
                          background: isResident ? "#2D9CDB" : "#F2C94C",
                        }}
                      />
                      <img
                        src={item.resident?.avatar || "https://i.pravatar.cc/44"}
                        style={avatarStyle}
                      />
                      {item.resident?.fullName || t.history.guest}

                      {item.quantity && item.quantity > 1 && (
                        <span style={{ color: "#6b7280", marginLeft: 4 }}>
                          (+{item.quantity - 1})
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={tdStyle}>{item.service?.serviceName}</td>
                  <td style={tdStyle}>{item.checkInOut?.method}</td>
                  <td style={tdStyle}>
                    {formatDateTime(item.checkInOut?.checkInTime)}
                  </td>
                  <td style={tdStyle}>
                    {formatDateTime(item.checkInOut?.checkOutTime)}
                  </td>
                  <td style={tdStyle}>{item.quantity ?? 1}</td>
                  <td style={tdStyle}>{item.service?.price}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ===== PAGINATION (GIỮ NGUYÊN STYLE) ===== */}
      <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
        <div className="flex items-center gap-1 text-sm">
          <button
            onClick={() => goToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed font-extrabold"
          >
            &lt;
          </button>

          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => goToPage(pageNum)}
                className={`px-3 py-1 rounded ${currentPage === pageNum
                    ? "bg-indigo-600 text-white font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {pageNum}
              </button>
            );
          })}

          {totalPages > 5 && (
            <>
              <span className="px-2 text-gray-500">...</span>
              <button
                onClick={() => goToPage(totalPages)}
                className={`px-3 py-1 rounded ${currentPage === totalPages
                    ? "bg-indigo-600 text-white font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed font-extrabold"
          >
            &gt;
          </button>
        </div>
      </div>

      {isModalOpen && selectedUser && (
        <DetailModal user={selectedUser} onClose={() => setIsModalOpen(false)} t={t} />
      )}
    </div>
  );
};

export default UsageHistory;

/* ================== MODAL ================== */
const DetailModal = ({ user, onClose, t }: any) => {
  const remainingNames = user.item.remainingNames?.filter(Boolean) || [];

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={modalHeader}>
          <b>{t.history.detail}</b>
          <button onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: 20, lineHeight: 1.6 }}>
          <p><b>Người đại diện:</b> {user.item.displayName}</p>

          <div>
            <b>Người đi cùng:</b>
            {remainingNames.length > 0 ? (
              <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
                {remainingNames.map((name: string, i: number) => (
                  <li key={i} style={{ listStyleType: "disc" }}>
                    {name}
                  </li>
                ))}
              </ul>
            ) : (
              <span> -- </span>
            )}
          </div>

          <p><b>Số lượng:</b> {user.item.totalGuests}</p>
          <p><b>Dịch vụ:</b> {user.service.serviceName}</p>
          <p><b>Hệ thống:</b> {user.item.method}</p>
          <p><b>Giờ vào:</b> {formatDateTime(user.item.checkInTime)}</p>
          <p><b>Giờ ra:</b> {formatDateTime(user.item.checkOutTime)}</p>
          <p><b>Căn hộ:</b> {user.apartment || "--"}</p>
          <p><b>Giá:</b> {user.service.price.toLocaleString()} đ</p>
          <p><b>Nhân viên check-in:</b> {user.staff?.fullName || "--"}</p>
        </div>
      </div>
    </div>
  );
};





/* ================== STYLES (GIỮ NGUYÊN) ================== */
const pageStyle: React.CSSProperties = { fontFamily: "Arial, sans-serif" };
const topBarStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", marginBottom: 16 };
const searchWrapStyle: React.CSSProperties = { display: "flex", gap: 12 };
const inputStyle: React.CSSProperties = { padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e7eb", width: 240 };
const primaryBtn: React.CSSProperties = { padding: "8px 20px", borderRadius: 6, border: "none", background: "#143CA6", color: "#fff", fontWeight: 600 };
const tableWrapperStyle: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 8, maxHeight: 420, overflowY: "auto" };
const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse" };
const thStyle: React.CSSProperties = { padding: "12px 16px", fontWeight: 700, background: "#f9fafb", textAlign: "left" };
const rowStyle: React.CSSProperties = { borderBottom: "1px solid #e5e7eb", cursor: "pointer" };
const tdStyle: React.CSSProperties = { padding: "12px 16px" };
const userCellStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10 };
const colorBoxStyle: React.CSSProperties = { width: 12, height: 12, borderRadius: 4 };
const avatarStyle: React.CSSProperties = { width: 36, height: 36, borderRadius: "50%" };
const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center" };
const modalStyle: React.CSSProperties = { width: 500, background: "#fff", borderRadius: 8 };
const modalHeader: React.CSSProperties = { padding: "12px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between" };

const legendStyle: React.CSSProperties = { display: "flex", gap: 24, marginBottom: 12 };
const legendItem: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8 };
const legendDot: React.CSSProperties = { width: 14, height: 14, borderRadius: 4 };
