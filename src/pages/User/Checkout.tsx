import React, { useEffect, useState } from "react";
import checkInService, { CheckInItem } from "../../services/checkInService";

const Checkout: React.FC = () => {
  // ===== STATE =====
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CheckInItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState(""); 
  const [filterQuery, setFilterQuery] = useState(""); 
  
  const itemsPerPage = 10;

  // ===== FETCH DATA =====
  const fetchData = async (page: number, search: string) => {
    setLoading(true);
    try {
      const res = await checkInService.getCurrentCheckIns(page, itemsPerPage, search);
      const responseData = res.data; 

      if (responseData && Array.isArray(responseData.items)) {
          setData(responseData.items);
          setTotalPages(Math.ceil(responseData.totalItem / itemsPerPage));
      } else {
          setData([]);
          setTotalPages(0);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, filterQuery);
  }, [currentPage, filterQuery]); 

  // ===== HANDLERS =====
  
  // 1. Xử lý Checkout (Mới thêm)
  const handleCheckout = async (id: number) => {
    // Xác nhận trước khi thực hiện
    const confirm = window.confirm("Bạn có chắc chắn muốn Checkout cho lượt này?");
    if (!confirm) return;

    try {
      // Gọi API
      await checkInService.checkout(id);
      
      // Thông báo thành công
      alert("Checkout thành công!");
      
      // Load lại dữ liệu để cập nhật danh sách
      fetchData(currentPage, filterQuery);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Có lỗi xảy ra khi checkout.");
    }
  };

  const handleSearch = () => {
    setFilterQuery(searchText);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // ===== HELPERS & RENDER =====
  const isGuest = (room: string) => room === "-" || !room;

  const formatTime = (isoString: string) => {
    if (!isoString) return "";
    console.log(isoString);
    const date = new Date(isoString);
    console.log("date", date);
    const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });
    const day = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' });
    return `${time}h - ${day}`;
  };

  const renderPaginationButtons = () => {
    // ... (Giữ nguyên logic render pagination của bạn)
    const pages = [];
    if (totalPages <= 6) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (currentPage > 3) pages.push("...");
        let start = Math.max(2, currentPage - 1);
        let end = Math.min(totalPages - 1, currentPage + 1);
        if (currentPage < 4) end = 5;
        if (currentPage > totalPages - 3) start = totalPages - 4;
        for (let i = start; i <= end; i++) pages.push(i);
        if (currentPage < totalPages - 2) pages.push("...");
        pages.push(totalPages);
    }
    return pages.map((page, index) => {
        if (page === "...") return <span key={`dots-${index}`} className="px-2 text-gray-500">...</span>;
        return (
            <button
                key={page}
                type="button"
                onClick={() => handlePageChange(page as number)}
                className={`px-3 py-1 rounded font-medium transition ${
                    currentPage === page ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
                {page}
            </button>
        );
    });
  };

  return (
    <div className="min-h-screen bg-white px-10 py-6 text-sm">
      {/* SEARCH */}
      <div className="flex items-center gap-4 mb-4 max-w-3xl">
        <div className="relative flex-1">
          <input
            placeholder="Tìm kiếm theo Cư Dân, Khách, Phòng..."
            className="w-full h-11 rounded-lg border border-gray-300 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <button onClick={handleSearch} className="h-11 px-8 rounded-lg bg-indigo-700 text-white font-semibold hover:bg-indigo-800 transition">
          Tìm Kiếm
        </button>
      </div>

      {/* LEGEND */}
      <div className="w-fit p-3 mb-4 rounded-lg border border-gray-200 bg-[#fafafa]">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <span className="w-10 h-6 rounded bg-sky-500"></span>
            <span className="font-medium">Cư dân</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-10 h-6 rounded bg-yellow-400"></span>
            <span className="font-medium">Khách ngoài</span>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b text-gray-600 text-left bg-gray-50">
              <th className="px-6 py-4 font-bold text-indigo-700">Loại</th>
              <th className="px-6 py-4 font-bold text-indigo-700">Cư dân/ Khách</th>
              <th className="px-6 py-4 font-bold text-indigo-700">Dịch Vụ</th>
              <th className="px-6 py-4 font-bold text-indigo-700">Thời Gian Vào</th>
              <th className="px-6 py-4 font-bold text-indigo-700">Số Lượng</th>
              <th className="px-6 py-4 font-bold text-indigo-700">Hành Động</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">Đang tải dữ liệu...</td></tr>
            ) : data.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">Không có dữ liệu check-in nào.</td></tr>
            ) : (
                data.map((item) => {
                    const guest = isGuest(item.room);
                    return (
                        <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                            <td className="px-4 py-4">
                                <span className={`block w-10 h-6 rounded mx-auto ${guest ? 'bg-yellow-400' : 'bg-sky-500'}`}></span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={`https://i.pravatar.cc/40?img=${item.id % 70}`}
                                        className="w-10 h-10 rounded object-cover border border-gray-200"
                                        alt="Avatar"
                                    />
                                    <div>
                                        <div className="font-bold text-gray-800">{item.displayName}</div>
                                        <div className="text-xs text-gray-500">{guest ? "Khách vãng lai" : item.room}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-700">{item.serviceName}</td>
                            <td className="px-6 py-4 text-gray-600">{formatTime(item.checkInTime)}</td>
                            <td className="px-6 py-4 pl-10 font-semibold">{item.totalPeople}</td>
                            <td className="px-6 py-4">
                                <button 
                                    // 🔥 SỰ KIỆN CLICK GỌI API CHECKOUT
                                    onClick={() => handleCheckout(item.id)}
                                    className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-sm"
                                >
                                    Checkout All
                                </button>
                            </td>
                        </tr>
                    );
                })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2 select-none">
            <button 
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded text-gray-600 hover:bg-gray-100 font-bold disabled:opacity-30 disabled:cursor-not-allowed"
            >
            &lt;
            </button>
            {renderPaginationButtons()}
            <button 
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded text-gray-600 hover:bg-gray-100 font-bold disabled:opacity-30 disabled:cursor-not-allowed"
            >
            &gt;
            </button>
        </div>
      )}
    </div>
  );
};

export default Checkout;