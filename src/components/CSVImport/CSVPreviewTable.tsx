import { FC } from 'react';
import { useCSVImport } from '../../store/hooks';

export const CSVPreviewTable: FC = () => {
  const {
    data,
    errors,
    importType, // resident hoặc staff
  } = useCSVImport();

  const getDisplayColumns = () => {
    if (data.length === 0) return [];

    // Lấy tất cả key có trong data
    const allKeys = new Set<string>();
    data.forEach(row => Object.keys(row).forEach(k => allKeys.add(k)));

    let priorityOrder: string[] = [];
    let labelMap: Record<string, string> = {};

    if (importType === 'staff') {
      priorityOrder = [
        'fullName',   
        'email',
        'phone',
        'roleId',      
        'password',
      ];

      labelMap = {
        fullName: 'Tên nhân sự',
        email: 'Email',
        phone: 'Số điện thoại',
        roleId: 'Quyền (Role ID)',
        password: 'Mật khẩu',
      };
    } else {
      // ==================== CƯ DÂN (mặc định) ====================
      priorityOrder = [
        'fullName',
        'email',
        'roomNumber',
        'building',
        'phone',
        'citizenCard',
        'gender',
        'birthday',
      ];

      labelMap = {
        fullName: 'Tên cư dân',
        email: 'Email',
        roomNumber: 'Số phòng',
        building: 'Tòa nhà',
        phone: 'Số điện thoại',
        citizenCard: 'CCCD/CMND',
        gender: 'Giới tính',
        birthday: 'Ngày sinh',
      };
    }

    // Sắp xếp theo priority, các cột thừa (nếu có) đẩy xuống cuối
    const sortedKeys = priorityOrder
      .filter(k => allKeys.has(k))
      .concat([...allKeys].filter(k => !priorityOrder.includes(k)));

    return sortedKeys.map(key => ({
      key,
      label: labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1),
    }));
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Chưa có dữ liệu để hiển thị
      </div>
    );
  }

  return (
    <>
      <div className="p-6 min-h-screen">
        {/* Preview Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  {getDisplayColumns().map((col) => (
                    <th
                      key={col.key}
                      className="px-4 py-3 text-left text-blue-700 font-bold whitespace-nowrap"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    {getDisplayColumns().map((col) => {
                      const value = row[col.key] || '';
                      return (
                        <td key={col.key} className="px-4 py-3 border-gray-200 last:border-r-0">
                          <div className="text-gray-700">{value}</div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Error Summary */}
        {errors.length > 0 && (
          <div className="mb-4 mt-[15px] p-3">
            <div className="space-y-1 max-h-24 overflow-y-auto text-sm">
              {errors.map((error, index) => (
                <div key={index} className="text-red-700">
                  • {error.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};