import React, { useState } from "react";

export default function CheckinOutsiderForm() {
    const [representative, setRepresentative] = useState("");
    const [phone, setPhone] = useState("");
    const [service, setService] = useState("");
    const [method, setMethod] = useState("");
    const [people, setPeople] = useState([{ name: "" }]);

    const addPerson = () => {
        setPeople([...people, { name: "" }]);
    };

    const handleNameChange = (index: number, value: string) => {
        const updated = [...people];
        updated[index].name = value;
        setPeople(updated);
    };

    return (
        <div className="w-full max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow">

            {/* Đại Diện */}
            <div className="flex items-center gap-4 mb-4">
                <span className="text-gray-500 w-40">Đại Diện</span>
                <input
                    className="bg-gray-100 rounded-lg p-2 flex-1"
                    placeholder="Nhập tên..."
                    value={representative}
                    onChange={(e) => setRepresentative(e.target.value)}
                />
            </div>

            {/* Số Điện Thoại */}
            <div className="flex items-center gap-4 mb-4">
                <span className="text-gray-500 w-40">Số Điện Thoại</span>
                <input
                    className="bg-gray-100 rounded-lg p-2 flex-1"
                    placeholder="Nhập SĐT..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
            </div>

            {/* Dịch vụ */}
            <div className="flex items-center gap-4 mb-4">
                <span className="text-gray-500 w-40">Dịch Vụ</span>
                <input
                    className="bg-gray-100 rounded-lg p-2 flex-1"
                    placeholder="VD: Bơi (Hồ A)"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                />
            </div>

            {/* Phương Thức */}
            <div className="flex items-center gap-4 mb-4">
                <span className="text-gray-500 w-40">Phương Thức Checkin</span>
                <input
                    className="bg-gray-100 rounded-lg p-2 flex-1 text-gray-700"
                    value="Thủ công"
                    readOnly
                />
            </div>


            {/* Thời gian */}
            <div className="flex items-center gap-4 mb-4">
                <span className="text-gray-500 w-40">Thời Gian Vào</span>
                <span className="font-medium">{new Date().toLocaleString()}</span>
            </div>

            {/* Số lượng */}
            <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-500 w-40">Số Lượng</span>
                <input
                    className="bg-gray-100 rounded-lg p-2 w-24 text-center"
                    value={people.length}
                    readOnly
                />
            </div>

            {/* Bảng thêm người */}
            <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-600">
                        <tr>
                            <th className="p-3 w-12 text-left">STT</th>
                            <th className="p-3">Họ Và Tên</th>
                            <th className="p-3 w-24 text-center">Hoạt Động</th>
                        </tr>
                    </thead>

                    <tbody>
                        {people.map((p, index) => (
                            <tr key={index} className="border-t">
                                <td className="p-3">{index + 1}</td>

                                <td className="p-3">
                                    <input
                                        className="bg-gray-100 rounded-lg p-2 w-full"
                                        placeholder="Nhập tên..."
                                        value={p.name}
                                        onChange={(e) => handleNameChange(index, e.target.value)}
                                    />
                                </td>

                                <td className="p-3 text-center whitespace-nowrap">
                                    {index === people.length - 1 && (
                                        <button
                                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs"
                                            onClick={addPerson}
                                        >
                                            + Thêm
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center mt-6">
                <button className="px-10 py-2 bg-blue-700 text-white rounded-lg">
                    Checkin
                </button>
            </div>
        </div>
    );
}
