import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { api } from "../../utils/api";
import { useLocale } from "../../i18n/LocaleContext";

const ITEMS_PER_PAGE = 10;

/* ================== FORMAT DATETIME (IMPROVED) ================== */
const formatDateTime = (value?: string) => {
  if (!value) return "--";
  const d = new Date(value);
  // Using toLocaleString handles timezone correctly
  return d.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false
  });
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
  const [loading, setLoading] = useState(false);

  /* ================== FETCH LIST ================== */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // NOTE: api.get returns the data object directly based on your previous api.ts
        const res: any = await api.get(
          `/history_checkin`,
          {
            params: {
              searchName: searchText,
              page: currentPage,
              limit: ITEMS_PER_PAGE
            }
          }
        );

        // Adjust this access path based on your exact API response structure
        // Assuming response is: { success: true, data: { data: [...], meta: { totalPages: 5 } } }
        const responseData = res?.data || res;

        if (responseData?.data) {
          setData(responseData.data);
          setTotalPages(responseData.meta?.totalPages || 0);
        } else {
          setData([]);
          setTotalPages(0);
        }
      } catch (err) {
        console.error("Fetch usage history error:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchText, currentPage]);

  /* ================== FETCH DETAIL ================== */
  const openDetail = async (id: number) => {
    try {
      const res: any = await api.get(`/history_checkin/${id}`);
      
      // Check for success flag or data existence
      if (res.success || res.data) {
        setSelectedUser(res.data);
        setIsModalOpen(true);
      }
    } catch (err) {
      console.error("Fetch detail error:", err);
    }
  };

  /* ================== EXPORT EXCEL ================== */
  const exportToExcel = () => {
    if (data.length === 0) {
      alert("No data to export");
      return;
    }

    const excelData = data.map((item) => ({
      [t.history.type]: item.resident ? t.history.resident : t.history.guest,
      [t.history.residentOrGuest]: item.resident?.fullName || "Guest",
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
    saveAs(new Blob([buffer]), `UsageHistory_${new Date().getTime()}.xlsx`);
  };

  /* ================== PAGINATION LOGIC (FIXED) ================== */
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const maxVisibleButtons = 5;
    
    // Calculate start and end page for the sliding window
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    // Adjust startPage if endPage hits the limit
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    const pages = [];

    // First page button
    if (startPage > 1) {
      pages.push(
        <button key={1} onClick={() => goToPage(1)} className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded">1</button>
      );
      if (startPage > 2) pages.push(<span key="dots-start" className="px-2 text-gray-500">...</span>);
    }

    // Middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 rounded transition ${
            currentPage === i
              ? "bg-indigo-600 text-white font-medium"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {i}
        </button>
      );
    }

    // Last page button
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push(<span key="dots-end" className="px-2 text-gray-500">...</span>);
      pages.push(
        <button key={totalPages} onClick={() => goToPage(totalPages)} className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded">{totalPages}</button>
      );
    }

    return pages;
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
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearchText(inputText);
                setCurrentPage(1);
              }
            }}
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
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 20 }}>{t.common.loadingData}</td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: 20 }}>{t.common.noResults}</td>
              </tr>
            ) : (
              data.map((item) => {
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
                          alt=""
                        />
                        {item.resident?.fullName  || "Guest"}

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
                    <td style={tdStyle}>{item.service?.price?.toLocaleString()}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ===== PAGINATION (FIXED) ===== */}
      {totalPages > 1 && (
        <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
          <div className="flex items-center gap-1 text-sm">
            <button
              onClick={() => goToPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed font-extrabold"
            >
              &lt;
            </button>

            {renderPaginationButtons()}

            <button
              onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed font-extrabold"
            >
              &gt;
            </button>
          </div>
        </div>
      )}

      {/* ===== DETAIL MODAL ===== */}
      {isModalOpen && selectedUser && (
        <DetailModal user={selectedUser} onClose={() => setIsModalOpen(false)} t={t} />
      )}
    </div>
  );
};

export default UsageHistory;

/* ================== MODAL COMPONENT ================== */
interface DetailModalProps {
  user: HistoryDetail;
  onClose: () => void;
  t: any;
}

const DetailModal: React.FC<DetailModalProps> = ({ user, onClose, t }) => {
  const remainingNames = user.item.remainingNames?.filter(Boolean) || [];

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={modalHeader}>
          <b>{t.history.detail}</b>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>

        <div style={{ padding: 20, lineHeight: 1.6 }}>
          <p><b>{t.history.residentOrGuest}:</b> {user.item.displayName}</p>

          <div>
            <b>{t.checkInApartment.additionalGuests}:</b>
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

          <p><b>{t.history.quantity}:</b> {user.item.totalGuests}</p>
          <p><b>{t.history.service}:</b> {user.service.serviceName}</p>
          <p><b>{t.history.system}:</b> {user.item.method}</p>
          <p><b>{t.history.checkInTime}:</b> {formatDateTime(user.item.checkInTime)}</p>
          <p><b>{t.history.checkOutTime}:</b> {formatDateTime(user.item.checkOutTime)}</p>
          <p><b>{t.checkInApartment.apartment}:</b> {user.apartment || "--"}</p>
          <p><b>{t.history.price}:</b> {user.service.price?.toLocaleString()} đ</p>
          <p><b>Staff:</b> {user.staff?.fullName || "--"}</p>
        </div>
      </div>
    </div>
  );
};

/* ================== STYLES ================== */
const pageStyle: React.CSSProperties = { fontFamily: "Arial, sans-serif" };
const topBarStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", marginBottom: 16 };
const searchWrapStyle: React.CSSProperties = { display: "flex", gap: 12 };
const inputStyle: React.CSSProperties = { padding: "8px 12px", borderRadius: 6, border: "1px solid #e5e7eb", width: 240 };
const primaryBtn: React.CSSProperties = { padding: "8px 20px", borderRadius: 6, border: "none", background: "#143CA6", color: "#fff", fontWeight: 600, cursor: 'pointer' };
const tableWrapperStyle: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 8, maxHeight: 420, overflowY: "auto" };
const tableStyle: React.CSSProperties = { width: "100%", borderCollapse: "collapse" };
const thStyle: React.CSSProperties = { padding: "12px 16px", fontWeight: 700, background: "#f9fafb", textAlign: "left" };
const rowStyle: React.CSSProperties = { borderBottom: "1px solid #e5e7eb", cursor: "pointer" };
const tdStyle: React.CSSProperties = { padding: "12px 16px" };
const userCellStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10 };
const colorBoxStyle: React.CSSProperties = { width: 12, height: 12, borderRadius: 4 };
const avatarStyle: React.CSSProperties = { width: 36, height: 36, borderRadius: "50%", objectFit: "cover" };
const overlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalStyle: React.CSSProperties = { width: 500, background: "#fff", borderRadius: 8, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" };
const modalHeader: React.CSSProperties = { padding: "12px 16px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" };
const legendStyle: React.CSSProperties = { display: "flex", gap: 24, marginBottom: 12 };
const legendItem: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8 };
const legendDot: React.CSSProperties = { width: 14, height: 14, borderRadius: 4 };