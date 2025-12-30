import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/app/store";

import {
  setSearch,
  setFilter,
  checkoutById,
} from "@/features/Checkout/CheckoutSlice";
import { useState } from "react";

interface CheckoutItem {
  id: string;
  name: string;
  avatar: string;
  service: string;
  timeIn: string;
  type: "resident" | "guest";
}

export default function CheckoutList() {
  const dispatch = useDispatch();
  const { search, filter, list } = useSelector(
    (state: RootState) => state.checkout
  );

  const [keyword, setKeyword] = useState("");

  const filteredList = list.filter((item: CheckoutItem) => {
    const matchFilter =
      filter === "all" ? true : item.type === filter;

    const matchSearch = keyword
      ? item.name.toLowerCase().includes(keyword.toLowerCase()) ||
        item.service.toLowerCase().includes(keyword.toLowerCase()) ||
        item.id.toLowerCase().includes(keyword.toLowerCase())
      : true;

    return matchFilter && matchSearch;
  });

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow">

      {/* Search bar */}
      <div className="flex gap-3 items-center mb-4">
        <input
          className="flex-1 bg-gray-100 rounded-xl px-4 py-3 outline-none"
          placeholder="Tìm kiếm theo Cư Dân, Khách"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button className="bg-blue-700 text-white px-6 py-3 rounded-xl">
          Tìm Kiếm
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded-xl text-white ${
            filter === "resident" ? "bg-blue-500" : "bg-blue-300"
          }`}
          onClick={() => dispatch(setFilter("resident"))}
        >
          Cư dân
        </button>

        <button
          className={`px-4 py-2 rounded-xl text-white ${
            filter === "guest" ? "bg-yellow-500" : "bg-yellow-300"
          }`}
          onClick={() => dispatch(setFilter("guest"))}
        >
          Khách ngoài
        </button>
      </div>

      {/* Table */}
      <table className="w-full text-sm mt-3">
        <thead>
          <tr className="text-gray-500 border-b">
            <th className="p-3 text-left">Cư Dân/Khách</th>
            <th className="p-3 text-left">Dịch Vụ</th>
            <th className="p-3 text-left">Thời Gian Vào</th>
            <th className="p-3"></th>
          </tr>
        </thead>

        <tbody>
          {filteredList.map((item: CheckoutItem) => (
            <tr key={item.id} className="border-b hover:bg-gray-50">
              <td className="p-3 flex gap-3 items-center">
                <span
                  className={`w-3 h-3 rounded-full ${
                    item.type === "resident" ? "bg-blue-400" : "bg-yellow-400"
                  }`}
                ></span>

                <img
                  src={item.avatar}
                  className="w-9 h-9 rounded-full object-cover"
                />

                <span>{item.name}</span>
              </td>

              <td className="p-3">{item.service}</td>
              <td className="p-3">{item.timeIn}</td>

              <td className="p-3 text-right">
                <button
                  onClick={() => dispatch(checkoutById(item.id))}
                  className="bg-red-600 text-white px-4 py-2 rounded-xl"
                >
                  Checkout
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredList.length === 0 && (
        <div className="text-center text-gray-400 py-6">
          Không có kết quả
        </div>
      )}
    </div>
  );
}
