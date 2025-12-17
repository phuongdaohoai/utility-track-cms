import React, { useState } from "react";
import * as XLSX from "xlsx";
import saveAs from "file-saver";

const UsageHistory: React.FC = () => {
  const [inputText, setInputText] = useState(""); // input tạm
  const [searchText, setSearchText] = useState(""); // filter
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const itemsPerPage = 10;

  // Test data
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

  // Filter dữ liệu theo searchText
  const filtered = testData.filter((row) =>
    row.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedData = filtered.slice(startIndex, startIndex + itemsPerPage);

  // Chuyển trang
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Tạo số trang hiển thị
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (currentPage <= 3) pageNumbers.push(1, 2, 3, 4, "...");
      else if (currentPage >= totalPages - 2) {
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push("...");
        pageNumbers.push(currentPage - 1, currentPage, currentPage + 1);
        pageNumbers.push("...");
      }
      if (pageNumbers[pageNumbers.length - 1] !== totalPages)
        pageNumbers.push(totalPages);
    }
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  // Xuất Excel
  const exportToExcel = () => {
    const dataToExport = filtered.map((item) => ({
      "Cư Dân/Khách": item.name,
      "Dịch Vụ": item.service,
      "Hệ Thống": item.system,
      "Thời Gian Vào": item.time,
      "Thời Gian Ra": item.time,
      "Số Lượng": item.qty,
      "Phí": item.price,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "UsageHistory");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "UsageHistory.xlsx");
  };

  return (
    <>
     
    <div style={styles.page} className="mx-5 sm:mx-14 mt-7">
      {/* SEARCH + EXCEL */}
      <div style={styles.topBar}>
        <div style={styles.searchWrap}>
          <input
            placeholder="Tìm kiếm theo Cư Dân, Khách"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            style={styles.searchInput}
          />
          <button
            style={styles.btnSearch}
            onClick={() => {
              setSearchText(inputText);
              setCurrentPage(1);
            }}
          >
            Tìm Kiếm
          </button>
        </div>
        <button style={styles.btnExcel} onClick={exportToExcel}>Xuất Excel</button>
      </div>

      {/* LEGEND */}
      <div style={styles.legendBox}>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendColor, background: "#2D9CDB" }}></div>
          Cư dân
        </div>
        <div style={styles.legendItem}>
          <div style={{ ...styles.legendColor, background: "#F2C94C" }}></div>
          Khách ngoài
        </div>
      </div>

      {/* TABLE */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              {[
                "Cư Dân/ Khách",
                "Dịch Vụ",
                "Hệ Thống",
                "Thời Gian Vào",
                "Thời Gian Ra",
                "Số Lượng",
                "Phí",
              ].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {displayedData.map((item) => (
              <tr
                key={item.id}
                style={{ ...styles.tr, cursor: "pointer" }}
                onClick={() => {
                  setSelectedUser(item);
                  setIsModalOpen(true);
                }}
              >
                <td style={styles.td}>
                  <div style={styles.userCell}>
                    <div style={{ ...styles.colorBox, background: item.color }} />
                    <img src={item.avatar} style={styles.avatar} />
                    {item.name}
                  </div>
                </td>
                <td style={styles.td}>{item.service}</td>
                <td style={styles.td}>{item.system}</td>
                <td style={styles.td}>{item.time}</td>
                <td style={styles.td}>{item.time}</td>
                <td style={styles.td}>{item.qty}</td>
                <td style={styles.td}>{item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div style={styles.pagination}>
        <button
          style={styles.pageBtn}
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {"<"}
        </button>

        {pageNumbers.map((p, idx) =>
          typeof p === "number" ? (
            <button
              key={idx}
              onClick={() => goToPage(p)}
              style={{
                ...styles.pageNumber,
                ...(currentPage === p ? styles.pageActive : {}),
              }}
            >
              {p}
            </button>
          ) : (
            <span key={idx} style={styles.dots}>{p}</span>
          )
        )}

        <button
          style={styles.pageBtn}
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          {">"}
        </button>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <DetailModal
          user={selectedUser}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
    </>
  );
};

/* ============================
        MODAL COMPONENT
============================ */
const DetailModal = ({ user, onClose }: any) => {
  if (!user) return null;

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <div style={modalStyles.header}>
          <span style={modalStyles.headerTitle}>Chi tiết</span>
          <button style={modalStyles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={modalStyles.body}>
          <div style={modalStyles.infoRow}>
            <span style={modalStyles.label}>Căn Hộ</span>
            <span style={modalStyles.value}>{user.name}</span>
          </div>

          <div style={modalStyles.infoRow}>
            <span style={modalStyles.label}>Chủ Hộ</span>
            <span style={modalStyles.value}>Nguyễn A</span>
          </div>

          <div style={modalStyles.infoRow}>
            <span style={modalStyles.label}>Dịch Vụ</span>
            <span style={modalStyles.value}>{user.service}</span>
          </div>

          <div style={modalStyles.infoRow}>
            <span style={modalStyles.label}>Phương Thức Checkin</span>
            <span style={modalStyles.value}>{user.system}</span>
          </div>

          <div style={modalStyles.infoRow}>
            <span style={modalStyles.label}>Thời Gian</span>
            <span style={modalStyles.value}>{user.time}</span>
          </div>

          <div style={modalStyles.infoRow}>
            <span style={modalStyles.label}>Số lượng</span>
            <span style={modalStyles.value}>{user.qty}</span>
          </div>

          <div style={modalStyles.tableWrap}>
            <table style={modalStyles.innerTable}>
              <thead>
                <tr>
                  <th style={modalStyles.th}>STT</th>
                  <th style={modalStyles.th}>Họ và Tên</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={modalStyles.td}>1</td>
                  <td style={modalStyles.td}>Nguyễn A</td>
                </tr>
                <tr>
                  <td style={modalStyles.td}>2</td>
                  <td style={modalStyles.td}>Phạm Thị B</td>
                </tr>
                <tr>
                  <td style={modalStyles.td}>3</td>
                  <td style={modalStyles.td}>Nguyễn C</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================
          STYLES
============================ */
const styles: { [key: string]: React.CSSProperties } = {
  page: {
    padding: "24px 40px",
    fontFamily: "Inter, sans-serif",
    backgroundColor: "#f5f7fa",
    minHeight: "100vh",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
  },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  searchWrap: { display: "flex", gap: 10, flex: 1, maxWidth: 520 },
  searchInput: { flex: 1, height: 42, borderRadius: 8, border: "1px solid #DDE2E4", paddingLeft: 12, fontSize: 14, outline: "none" },
  btnSearch: { background: "#143CA6", color: "#fff", border: "none", padding: "0 32px", borderRadius: 8, fontWeight: 600, cursor: "pointer" },
  btnExcel: { background: "#143CA6", color: "#fff", border: "none", padding: "0 32px", height: 42, borderRadius: 8, fontWeight: 600, cursor: "pointer" },

  legendBox: { display: "flex", alignItems: "center", gap: 30, background: "#F5F5F5", padding: "10px 16px", borderRadius: 10, marginBottom: 14, width: "fit-content" },
  legendItem: { display: "flex", alignItems: "center", gap: 6, fontSize: 14 },
  legendColor: { width: 14, height: 14, borderRadius: 4 },

  tableContainer: { border: "1px solid #E0E0E0", borderRadius: 12, overflow: "hidden"},
  table: { width: "100%", borderCollapse: "collapse" },
  th: { background: "#F5F7FA", padding: "14px 20px", textAlign: "left", color: "#4F4F4F", fontSize: 14, fontWeight: 600, borderBottom: "1px solid #E0E0E0", position: "sticky", top: 0, zIndex: 2 },
  tr: { borderBottom: "1px solid #EDEDED" },
  td: { padding: "14px 20px", fontSize: 14, color: "#333" },

  userCell: { display: "flex", alignItems: "center", gap: 12 },
  colorBox: { width: 14, height: 14, borderRadius: 4 },
  avatar: { width: 40, height: 40, borderRadius: "50%", objectFit: "cover" },

  pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 18 },
  pageBtn: { padding: "6px 10px", borderRadius: 6, border: "1px solid #ccc", background: "#fff", cursor: "pointer" },
  pageNumber: { padding: "6px 12px", borderRadius: 6, border: "1px solid #ccc", background: "#fff", cursor: "pointer" },
  pageActive: { background: "#143CA6", color: "#fff", fontWeight: 600, border: "1px solid #143CA6" },
  dots: { padding: "0 6px" },
};

/* ============================
          MODAL STYLES
============================ */
const modalStyles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3000,
  },

  modal: {
    width: 760,
    background: "#fff",
    borderRadius: 10,
    boxShadow: "0 4px 18px rgba(0,0,0,0.12)",
    overflow: "hidden",
  },

  header: {
    height: 56,
    borderBottom: "1px solid #E0E0E0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 24px",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 600,
  },

  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 22,
    cursor: "pointer",
  },

  body: {
    padding: "26px 40px",
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 14,
    fontSize: 15,
  },

  label: {
    color: "#4F4F4F",
    fontWeight: 500,
  },

  value: {
    fontWeight: 600,
  },

  tableWrap: {
    marginTop: 22,
    border: "1px solid #E0E0E0",
    borderRadius: 6,
    overflow: "hidden",
  },

  innerTable: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    background: "#F5F7FA",
    padding: "12px 16px",
    fontWeight: 600,
    fontSize: 14,
    borderBottom: "1px solid #E0E0E0",
    textAlign: "left",
  },

  td: {
    padding: "12px 16px",
    fontSize: 14,
    borderBottom: "1px solid #F0F0F0",
    textAlign: "left",
  },
};

export default UsageHistory;
