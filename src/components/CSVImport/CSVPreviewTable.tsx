// components/CSVImport/CSVPreviewTable.tsx
import { FC } from 'react';
import { useCSVImport } from '../../store/hooks';
import { CSV_CONFIG } from './csvConfig'; // Import config
import { useLocale } from '../../i18n/LocaleContext';

export const CSVPreviewTable: FC = () => {
  const { t } = useLocale()
  const { data, errors, importType } = useCSVImport();

  // Lấy cột hiển thị từ config
  const displayColumns = CSV_CONFIG[importType];

  if (data.length === 0) return <div className="text-center py-12 text-gray-500">{t.csvImport.noData}</div>;

  return (
    <div className="p-6 min-h-screen">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                {displayColumns.map((col) => (
                  <th key={col.key} className="px-4 py-3 text-left text-blue-700 font-bold whitespace-nowrap">
                    {col.label} {col.required && <span className="text-red-500">*</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-gray-200 hover:bg-gray-50">
                  {displayColumns.map((col) => (
                    <td key={col.key} className="px-4 py-3 border-gray-200">
                      {row[col.key] || ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Hiển thị lỗi dòng dữ liệu (bỏ qua lỗi Header -1 vì Modal sẽ hiện) */}
      {errors.length > 0 && !errors.some(e => e.rowIndex === -1) && (
        <div className="mb-4 mt-[15px] p-3 space-y-1 max-h-24 overflow-y-auto text-sm">
           {errors.map((error, index) => (
             <div key={index} className="text-red-700">• {error.message}</div>
           ))}
        </div>
      )}
    </div>
  );
};