import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CheckoutDetailModal from "../../components/CheckoutDetailModal";
import { useLocale } from '../../i18n/LocaleContext';
import checkInService, { CheckInItem } from "../../services/checkInService";

interface DetailCheckoutState {
  visible: boolean;
  person?: CheckInItem;
  checkedOut: boolean;
}

const Checkout: React.FC = () => {
  const { t } = useLocale()
  const navigate = useNavigate();
  // === STATE POPUP ===
  const [checkoutPopup, setCheckoutPopup] = useState<DetailCheckoutState>({
    visible: false,
    checkedOut: false,
  });
  const [modalLoading, setModalLoading] = useState(false);

  // ===== STATE =====
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [filterType, setFilterType] = useState<"resident" | "guest" | "all">("all");
  const [isStaffView, setIsStaffView] = useState(false);

  // State lưu số lượng muốn checkout cho từng người
  const itemsPerPage = 10;

  // ===== FETCH DATA =====
  const fetchData = async (page: number, search: string, type?: "resident" | "guest") => {
    setLoading(true);
    try {
      const res = await checkInService.getCurrentCheckIns(page, itemsPerPage, search, type);
      const responseData = res.data;

      if (responseData && Array.isArray(responseData.items)) {
        let filteredItems = responseData.items;

        // Filter ở client side nếu API không filter đúng
        if (type) {
          filteredItems = responseData.items.filter((item: CheckInItem) => {
            const isItemGuest = isGuest(item.room);
            if (type === "guest") {
              return isItemGuest; // Chỉ lấy khách
            } else if (type === "resident") {
              return !isItemGuest; // Chỉ lấy cư dân
            }
            return true;
          });
        }

        setData(filteredItems);
        const totalItems = responseData.totalItem || filteredItems.length;
        setTotalPages(Math.ceil(totalItems / itemsPerPage));

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
  function isTokenExpired(token: string): boolean {
    try {
      const payloadBase64 = token.split(".")[1]
      if (!payloadBase64) return true

      const payloadJson = atob(payloadBase64)
      const payload = JSON.parse(payloadJson)

      if (!payload.exp) return true

      const currentTime = Math.floor(Date.now() / 1000)
      return payload.exp < currentTime
    } catch (error) {
      return true // token lỗi → coi như hết hạn
    }
  }
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken")

    if (!accessToken || isTokenExpired(accessToken)) {
      localStorage.removeItem("accessToken")
      navigate("/login", { replace: true })
    }
  }, [navigate])
  // Lấy danh sách check-in của nhân sự (chỉ để xem, không checkout)
  const fetchStaffData = async (page: number, search: string) => {
    setLoading(true);
    try {
      const res = await (checkInService as any).getStaffCheckIns(page, itemsPerPage, search);
      const responseData = res.data;

      if (responseData && Array.isArray(responseData.items)) {
        const items = responseData.items;
        setData(items);
        const totalItems = responseData.totalItem || items.length;
        setTotalPages(Math.ceil(totalItems / itemsPerPage));
      } else {
        setData([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu nhân sự:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };
 

  // Kiểm tra token, nếu hết hạn thì chuyển về màn hình login checkout
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || isTokenExpired(accessToken)) {
      localStorage.removeItem("accessToken");
      navigate("/logincheckout", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (isStaffView) {
      // Chế độ xem nhân sự
      fetchStaffData(currentPage, filterQuery);
    } else {
      const type = filterType === "all" ? undefined : filterType;
      console.log("Filter type:", filterType, "-> API type:", type); // Debug log
      fetchData(currentPage, filterQuery, type);
    }
  }, [currentPage, filterQuery, filterType, isStaffView]);

  // ===== HANDLERS =====

  // 1. Xử lý mở/đóng popup
  const openCheckoutPopup = async (item: CheckInItem) => {
    // Mở modal ngay với dữ liệu sẵn có để UI phản hồi nhanh
    setCheckoutPopup({ visible: true, person: item, checkedOut: false });
  };

  const closeCheckoutPopup = () => {
    setCheckoutPopup({ visible: false, person: undefined, checkedOut: false });
  };

  // 2. Checkout ALL cho một lượt
  const handleCheckoutAll = async (id: number) => {
    const confirm = window.confirm(
      t.checkout.confirmCheckoutAll
    );
    if (!confirm) return;
    setModalLoading(true);
    try {
      await checkInService.checkout(id);
      alert(t.checkout.checkoutAllSuccess);
      const type = filterType === "all" ? undefined : filterType;
      fetchData(currentPage, filterQuery, type);
      closeCheckoutPopup();
    } catch (error: any) {
      console.error(error);
      alert(error.message || t.checkout.errorCheckout);
    } finally {
      setModalLoading(false);
    }
  };

  // 3. Checkout theo danh sách khách đã chọn (không checkout đại diện)
  const handleSavePartial = async (id: number, guests: string[]) => {
    if (!guests || guests.length === 0) {
      alert(t.checkout.selectGuests);
      return;
    }
    setModalLoading(true);
    try {
      await checkInService.partialCheckoutByGuests(id, guests);
      alert(t.checkout.partialCheckoutSuccess);
      const type = filterType === "all" ? undefined : filterType;
      await fetchData(currentPage, filterQuery, type);
      closeCheckoutPopup();
    } catch (error: any) {
      console.error(error);
      alert(error.message || t.checkout.errorCheckout);
    } finally {
      setModalLoading(false);
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
    const date = new Date(isoString);
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
          className={`px-3 py-1 rounded font-medium transition ${currentPage === page ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
            }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <>
      <div className="min-h-screen bg-white px-10 py-6 text-sm">
        {/* <button
          onClick={() => navigate('/mainmenu')}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
        >
          ← Quay lại
        </button> */}
        {/* SEARCH */}
        <div className="flex items-center gap-4 mb-4 max-w-3xl">
          <div className="relative flex-1">
            <input
              placeholder={t.checkout.searchPlaceholder}
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
            {t.checkout.search}
          </button>
        </div>

        {/* LEGEND & FILTER */}
        <div className="flex gap-4">
          <div className="w-fit p-3 mb-2 rounded-lg border border-gray-200 bg-[#fafafa]">
          <div className="flex items-center gap-10">
            <button
              onClick={() => {
                // Khi chọn lại cư dân thì thoát chế độ xem nhân sự
                if (isStaffView) {
                  setIsStaffView(false);
                }
                // Toggle: nếu đã chọn resident thì reset về all, nếu không thì chọn resident
                const newType = filterType === "resident" ? "all" : "resident";
                setFilterType(newType);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-3 transition cursor-pointer ${filterType === "resident"
                ? "opacity-100 font-bold"
                : "opacity-70 hover:opacity-100"
                }`}
            >
              <span className="w-10 h-6 rounded bg-sky-500"></span>
              <span className="font-medium">{t.checkout.resident}</span>
            </button>
            <button
              onClick={() => {
                // Khi chọn lại khách ngoài thì thoát chế độ xem nhân sự
                if (isStaffView) {
                  setIsStaffView(false);
                }
                // Toggle: nếu đã chọn guest thì reset về all, nếu không thì chọn guest
                const newType = filterType === "guest" ? "all" : "guest";
                setFilterType(newType);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-3 transition cursor-pointer ${filterType === "guest"
                ? "opacity-100 font-bold"
                : "opacity-70 hover:opacity-100"
                }`}
            >
              <span className="w-10 h-6 rounded bg-yellow-400"></span>
              <span className="font-medium">{t.checkout.outsideGuest}</span>
            </button>
          </div>
          </div>

          {/* NÚT XEM NHÂN SỰ CHECK-IN (ngoài filter cư dân/khách) */}
          <div className="w-fit p-3 mb-2 rounded-lg border border-gray-200 bg-[#fafafa]">
          <button
            onClick={() => {
              const next = !isStaffView;
              setIsStaffView(next);
              setCurrentPage(1);
            }}
            className={`flex items-center gap-3 transition cursor-pointer
              ${isStaffView
                ? " text-white border-indigo-600"
                : "bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50"
              }`}
          >
            <span className="w-10 h-6 rounded bg-purple-500"></span>
            <span className="font-medium text-black">{t.checkout.staff}</span>
          </button>
        </div>
        </div>

        {/* TABLE */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              {isStaffView ? (
                <tr className="border-b text-gray-600 text-left bg-gray-50">
                  <th className="px-6 py-4 font-bold text-indigo-700 w-10">{t.checkout.type}</th>
                  <th className="px-6 py-4 font-bold text-indigo-700">{t.checkout.residentOrGuest}</th>
                  <th className="px-6 py-4 font-bold text-indigo-700">{t.checkout.service}</th>
                  <th className="px-6 py-4 font-bold text-indigo-700">{t.checkout.checkInTime}</th>
                  <th className="px-6 py-4 font-bold text-indigo-700">{t.checkout.checkOutTime}</th>
                </tr>
              ) : (
                <tr className="border-b text-gray-600 text-left bg-gray-50">
                  <th className="px-6 py-4 font-bold text-indigo-700 w-10">{t.checkout.type}</th>
                  <th className="px-6 py-4 font-bold text-indigo-700">{t.checkout.residentOrGuest}</th>
                  <th className="px-6 py-4 font-bold text-indigo-700">{t.checkout.service}</th>
                  <th className="px-6 py-4 font-bold text-indigo-700">{t.checkout.checkInTime}</th>
                  <th className="px-6 py-4 font-bold text-indigo-700">{t.checkout.quantity}</th>
                  <th className="px-6 py-4 font-bold text-indigo-700">{t.checkout.action}</th>
                </tr>
              )}
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">{t.checkout.loading}</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-500">{t.checkout.noData}</td></tr>
              ) : isStaffView ? (
                // View nhân sự: chỉ hiển thị danh sách, không cho checkout
                data.map((item: any) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-4">
                      <span className="block w-10 h-6 rounded mx-auto bg-purple-500"></span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-700 border border-gray-200">
                          {item.displayName?.charAt(0) || "S"}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">{item.displayName}</div>
                          <div className="text-xs text-gray-500">{item.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {item.method || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatTime(item.checkInTime)}
                    </td>
                    <td className="px-6 py-4 pl-10 font-semibold">
                      {item.checkOutTime ? formatTime(item.checkOutTime) : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                data.map((item: CheckInItem) => {
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
                            <div className="text-xs text-gray-500">{guest ? t.checkout.guestName : item.room}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">{item.serviceName}</td>
                      <td className="px-6 py-4 text-gray-600">{formatTime(item.checkInTime)}</td>
                      <td className="px-6 py-4 pl-10 font-semibold">{item.totalPeople}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openCheckoutPopup(item)}
                          className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-sm"
                        >
                          {t.checkout.checkout}
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
      {/* MODAL CHECKOUT DETAIL */}
      <CheckoutDetailModal
        visible={checkoutPopup.visible}
        item={checkoutPopup.person}
        onClose={closeCheckoutPopup}
        onSavePartial={handleSavePartial}
        onCheckoutAll={handleCheckoutAll}
        loading={modalLoading}
      />
    </>
  );
};

export default Checkout;