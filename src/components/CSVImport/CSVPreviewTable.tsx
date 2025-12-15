// components/CSVImport/CSVPreviewTable.tsx
import { FC } from 'react';
import { AlertCircle } from 'lucide-react';
import { useCSVImport } from '../../store/hooks';

export const CSVPreviewTable: FC = () => {
  const { 
    data, 
    errors, 
    importType, 
    updateRow,
    removeRow 
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

  const getRowErrors = (rowIndex: number) => {
    return errors.filter(error => error.rowIndex === rowIndex);
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
      {/* Error Summary */}
      {errors.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="font-medium text-red-800">Có {errors.length} lỗi:</span>
          </div>
          <div className="space-y-1 max-h-24 overflow-y-auto text-sm">
            {errors.map((error, index) => (
              <div key={index} className="text-red-700">
                • {error.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {getDisplayColumns().map((col) => (
                  <th 
                    key={col.key} 
                    className="p-3 text-left font-medium text-gray-700 border-b whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="p-3 text-left font-medium text-gray-700 border-b">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => {
                const rowErrors = getRowErrors(rowIndex);
                const hasError = rowErrors.length > 0;

                return (
                  <tr 
                    key={rowIndex} 
                    className={`hover:bg-gray-50 ${hasError ? 'bg-red-50' : ''}`}
                  >
                    {getDisplayColumns().map((col) => {
                      const value = row[col.key] || '';
                      const fieldError = rowErrors.find(e => e.field === col.key);

                      return (
                        <td key={col.key} className="p-3 border-b">
                          <input
                            type="text"
                            value={value}
                            onChange={(e) => updateRow(rowIndex, col.key, e.target.value)}
                            className={`w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 ${
                              fieldError 
                                ? 'border-red-500 focus:ring-red-500' 
                                : 'border-gray-300 focus:ring-indigo-500'
                            }`}
                          />
                          {fieldError && (
                            <div className="text-xs text-red-600 mt-1">
                              {fieldError.message}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-3 border-b">
                      <button
                        onClick={() => removeRow(rowIndex)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        <div className="p-3 bg-gray-50 text-sm text-gray-600">
          Tổng số: {data.length} {importType === 'staff' ? 'nhân sự' : 'cư dân'}
        </div>
      </div>
    </>
  );
};