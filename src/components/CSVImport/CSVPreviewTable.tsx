
import { FC } from 'react';

import { useCSVImport } from '../../store/hooks';

export const CSVPreviewTable: FC = () => {
  const {
    data,
    errors,
    importType,
   
  } = useCSVImport();

  const getDisplayColumns = () => {
    if (importType === 'staff') {
      return [
        { key: 'staffCode', label: 'Mã nhân sự' },
        { key: 'staffName', label: 'Tên nhân sự' },
        { key: 'email', label: 'Email' },
        { key: 'position', label: 'Vị trí' },
        { key: 'department', label: 'Phòng ban' },
        { key: 'role', label: 'Quyền' },
        { key: 'password', label: 'Mật khẩu' },
      ];
    }

    return [
      { key: 'residentCode', label: 'Mã cư dân' },
      { key: 'fullName', label: 'Tên cư dân' },
      { key: 'email', label: 'Email' },
      { key: 'room', label: 'Phòng' },
      { key: 'building', label: 'Tòa nhà' },
      { key: 'phone', label: 'Số điện thoại' },
    ];
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
                      className="px-4 py-3 text-left  text-blue-700 font-bold whitespace-nowrap"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.map((row, rowIndex) => {
                  return (
                    <tr
                      key={rowIndex}
                      className={`border-b border-gray-200 hover:bg-gray-50 `}
                    >
                      {getDisplayColumns().map((col) => {
                        const value = row[col.key] || '';


                        return (
                          <td key={col.key} className="px-4 py-3  border-gray-200 last:border-r-0">
                            <div className={'text-gray-700'}>
                              {value}
                            </div>

                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
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
                •  {error.message}
              </div>
            ))}
          </div>
        </div>
      )}
      </div>


    </>
  );
};