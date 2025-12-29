import React from "react";

const Checkout = () => {
  return (
    <div className="min-h-screen bg-white px-10 py-6 text-sm">
      {/* SEARCH */}
      <div className="flex items-center gap-4 mb-4 max-w-3xl">
        <div className="relative flex-1">
          <input
            placeholder="Tìm kiếm theo Cư Dân, Khách"
            className="w-full h-11 rounded-lg border border-gray-300 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <button className="h-11 px-8 rounded-lg bg-indigo-700 text-white font-semibold">
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
            <tr className="border-b text-gray-600 text-left">
              <th className="px-4 py-4 w-16"></th>
              <th className="px-6 py-4 font-semibold text-indigo-700">
                Cư Dân / Khách
              </th>
              <th className="px-6 py-4 font-semibold">Dịch Vụ</th>
              <th className="px-6 py-4 font-semibold">Thời Gian Vào</th>
              
              <th className="px-6 py-4 font-semibold">Số Lượng</th>
              <th className="px-6 py-4 font-semibold">Hành Động</th>
            </tr>
          </thead>

          <tbody>
            {/* ROW - CƯ DÂN */}
            <tr className="border-b">
              <td className="px-4 py-4">
                <span className="block w-10 h-6 rounded bg-sky-500"></span>
              </td>

              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <img
                    src="https://i.pravatar.cc/40?img=1"
                    className="w-10 h-10 rounded object-cover"
                  />
                  <span className="font-medium">A22.01</span>
                </div>
              </td>

              <td className="px-6 py-4">Gym</td>
              <td className="px-6 py-4">3h40 - 30/5/2025</td>
              
              <td className="px-6 py-4">1</td>

              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button className="px-4 py-1.5 rounded bg-yellow-400 text-white font-semibold">
                    Checkout
                  </button>
                  <button className="px-4 py-1.5 rounded bg-indigo-700 text-white font-semibold">
                    Checkout All
                  </button>
                </div>
              </td>
            </tr>

            {/* ROW - KHÁCH */}
            <tr className="border-b">
              <td className="px-4 py-4">
                <span className="block w-10 h-6 rounded bg-yellow-400"></span>
              </td>

              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <img
                    src="https://i.pravatar.cc/40?img=2"
                    className="w-10 h-10 rounded object-cover"
                  />
                  <span className="font-medium">Nguyễn A</span>
                </div>
              </td>

              <td className="px-6 py-4">Bơi</td>
              <td className="px-6 py-4">3h40 - 30/5/2025</td>
             
              <td className="px-6 py-4">1</td>

              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button className="px-4 py-1.5 rounded bg-yellow-400 text-white font-semibold">
                    Checkout
                  </button>
                  <button className="px-4 py-1.5 rounded bg-indigo-700 text-white font-semibold">
                    Checkout All
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* PAGINATION (UI ONLY) */}
      <div className="mt-4 flex items-center justify-center gap-1">
        <button className="px-3 py-1 rounded text-gray-600 hover:bg-gray-100 font-bold">
          &lt;
        </button>

        <button className="px-3 py-1 rounded bg-indigo-600 text-white font-medium">
          1
        </button>
        <button className="px-3 py-1 rounded text-gray-700 hover:bg-gray-100">
          2
        </button>
        <button className="px-3 py-1 rounded text-gray-700 hover:bg-gray-100">
          3
        </button>
        <button className="px-3 py-1 rounded text-gray-700 hover:bg-gray-100">
          4
        </button>
        <button className="px-3 py-1 rounded text-gray-700 hover:bg-gray-100">
          5
        </button>

        <span className="px-2 text-gray-500">...</span>

        <button className="px-3 py-1 rounded text-gray-700 hover:bg-gray-100">
          12
        </button>

        <button className="px-3 py-1 rounded text-gray-600 hover:bg-gray-100 font-bold">
          &gt;
        </button>
      </div>
    </div>
  );
};

export default Checkout;
