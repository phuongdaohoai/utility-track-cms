import React, { useState } from "react";
import * as XLSX from "xlsx";
import saveAs from "file-saver";

/* ================== MAIN ================== */
const UsageHistory: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const itemsPerPage = 10;

  /* ================== MOCK DATA ================== */
  const testData = Array.from({ length: 120 }).map((_, i) => ({
    id: i + 1,
    color: i % 2 === 0 ? "#2D9CDB" : "#F2C94C",
    avatar: `https://i.pravatar.cc/44?img=${(i % 70) + 1}`,
    name: `A.${String(i + 1).padStart(2, "0")}.0${i % 10}`,
    service: i % 2 === 0 ? "Gym" : "Bơi",
    system: ["QR", "FaceId", "RFID"][i % 3],
    time: "3h40 - 30/5/2025",
    qty: (i % 3) + 1,
    price: i % 2 === 0 ? "0" : `${((i % 4) + 1) * 10000}.000`,
  }));

  /* ================== FILTER ================== */
  const filtered = testData.filter(row =>
    row.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedData = filtered.slice(startIndex, startIndex + itemsPerPage);

  /* ================== PAGINATION ================== */
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) pages.push(1, 2, 3, 4, "...");
      else if (currentPage >= totalPages - 2) {
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push("...", currentPage - 1, currentPage, currentPage + 1, "...");
      }
      pages.push(totalPages);
    }
    return pages;
  };

  /* ================== EXPORT EXCEL ================== */
  const exportToExcel = () => {
    const data = filtered.map(item => ({
      "Cư Dân/Khách": item.name,
      "Dịch Vụ": item.service,
      "Hệ Thống": item.system,
      "Thời Gian": item.time,
      "Số Lượng": item.qty,
      "Phí": item.price,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "History");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "UsageHistory.xlsx");
  };

  return (
    <div style={pageStyle}>
      {/* ===== TOP BAR ===== */}
      <div style={topBarStyle}>
        <div style={searchWrapStyle}>
          <input
            placeholder="Tìm theo cư dân / khách"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            style={inputStyle}
          />
          <button
            style={primaryBtn}
            onClick={() => {
              setSearchText(inputText);
              setCurrentPage(1);
            }}
          >
            Tìm kiếm
          </button>
        </div>

        <button style={primaryBtn} onClick={exportToExcel}>
          Xuất Excel
        </button>
      </div>

      {/* ===== TABLE ===== */}
      <div style={tableWrapperStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {[
                "Cư Dân / Khách",
                "Dịch Vụ",
                "Hệ Thống",
                "Thời Gian",
                "Số Lượng",
                "Phí",
              ].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {displayedData.map(item => (
              <tr
                key={item.id}
                style={rowStyle}
                onClick={() => {
                  setSelectedUser(item);
                  setIsModalOpen(true);
                }}
              >
                <td style={tdStyle}>
                  <div style={userCellStyle}>
                    <div style={{ ...colorBoxStyle, background: item.color }} />
                    <img src={item.avatar} style={avatarStyle} />
                    {item.name}
                  </div>
                </td>
                <td style={tdStyle}>{item.service}</td>
                <td style={tdStyle}>{item.system}</td>
                <td style={tdStyle}>{item.time}</td>
                <td style={tdStyle}>{item.qty}</td>
                <td style={tdStyle}>{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== PAGINATION ===== */}
      <div style={paginationStyle}>
        <button style={pageBtnStyle} disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)}>‹</button>

        {getPageNumbers().map((p, i) =>
          typeof p === "number" ? (
            <button
              key={i}
              onClick={() => goToPage(p)}
              style={{
                ...pageBtnStyle,
                ...(p === currentPage ? pageActiveStyle : {}),
              }}
            >
              {p}
            </button>
          ) : (
            <span key={i}>…</span>
          )
        )}

        <button style={pageBtnStyle} disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)}>›</button>
      </div>

      {isModalOpen && (
        <DetailModal user={selectedUser} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default UsageHistory;

/* ================== MODAL ================== */
const DetailModal = ({ user, onClose }: any) => {
  if (!user) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={modalHeader}>
          <b>Chi tiết</b>
          <button onClick={onClose}>✕</button>
        </div>
        <div style={{ padding: 20 }}>
          <p><b>Cư dân:</b> {user.name}</p>
          <p><b>Dịch vụ:</b> {user.service}</p>
          <p><b>Hệ thống:</b> {user.system}</p>
          <p><b>Thời gian:</b> {user.time}</p>
        </div>
      </div>
    </div>
  );
};

/* ================== STYLES (ĐỒNG NHẤT SERVICES) ================== */
const pageStyle: React.CSSProperties = {
  fontFamily: "Arial, sans-serif",
};

const topBarStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 16,
};

const searchWrapStyle: React.CSSProperties = {
  display: "flex",
  gap: 12,
};

const inputStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 6,
  border: "1px solid #e5e7eb",
  width: 240,
};

const primaryBtn: React.CSSProperties = {
  padding: "8px 20px",
  borderRadius: 6,
  border: "none",
  background: "#143CA6",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const tableWrapperStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  maxHeight: 420,
  overflowY: "auto",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontWeight: 700,
  background: "#f9fafb",
  textAlign: "left",
};

const rowStyle: React.CSSProperties = {
  borderBottom: "1px solid #e5e7eb",
  cursor: "pointer",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
};

const userCellStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const colorBoxStyle: React.CSSProperties = {
  width: 12,
  height: 12,
  borderRadius: 4,
};

const avatarStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: "50%",
};

const paginationStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: 6,
  marginTop: 16,
};

const pageBtnStyle: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: 6,
  border: "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
};

const pageActiveStyle: React.CSSProperties = {
  background: "#143CA6",
  color: "#fff",
  borderColor: "#143CA6",
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalStyle: React.CSSProperties = {
  width: 500,
  background: "#fff",
  borderRadius: 8,
};

const modalHeader: React.CSSProperties = {
  padding: "12px 16px",
  borderBottom: "1px solid #e5e7eb",
  display: "flex",
  justifyContent: "space-between",
};
