// components/CSVImport/CSVImportModal.tsx
import { FC, useRef, ChangeEvent } from 'react';
import { X, Upload, AlertCircle, CheckCircle, FileX } from 'lucide-react';
import { useCSVImport } from '../../store/hooks';
import { CSVPreviewTable } from './CSVPreviewTable';
interface CSVImportModalProps {
  onSuccess?: () => void; // Hàm callback tùy chọn
}
export const CSVImportModal: FC<CSVImportModalProps> = ({ onSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isModalOpen,
    importType,
    isLoading,
    uploadStatus,
    uploadMessage,
    closeModal,
    parseCSVFile,
    importCSVData,
    data,
    errors,
    resetImport
  } = useCSVImport();

  // Check if there is a header error (rowIndex = -1)
  const isHeaderError = errors.some(e => e.rowIndex === -1);
  const headerErrorMessage = errors.find(e => e.rowIndex === -1)?.message;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFile = async (file: File) => {
    // Pass object { file, type } to parseCSVFile thunk
    await parseCSVFile({ file, type: importType });
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleConfirm = async () => {
    // if (errors.length > 0) {
    //   alert('Vui lòng sửa tất cả lỗi trước khi import');
    //   return;
    // }

    if (data.length === 0) {
      alert('Không có dữ liệu để import');
      return;
    }
    const result = await importCSVData(importType, data);
    if (result.meta.requestStatus === 'fulfilled') {
      if (onSuccess) {
        onSuccess(); 
      }
    }
  };

  const handleClose = () => {

    if (data.length > 0 && !isHeaderError && !window.confirm('Dữ liệu chưa được lưu. Bạn có chắc chắn muốn đóng?')) {
      return;
    }
    closeModal();
    resetImport();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const handleClosesucess = () => {
    closeModal();
    resetImport();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[100vh] overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Xem trước danh sách {importType === 'staff' ? 'nhân sự' : 'cư dân'}
            </h2>
            {/* Show Success message */}
            {uploadStatus === 'success' && (
              <div className="flex items-center gap-2 mt-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">{uploadMessage}</span>
              </div>
            )}
            {/* Show General Error message (not header error) */}
            {uploadStatus === 'error' && !isHeaderError && (
              <div className="flex items-center gap-2 mt-1 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{uploadMessage}</span>
              </div>
            )}
          </div>
          <button
            onClick={handleClosesucess}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-180px)]">

          {/* HEADER ERROR DISPLAY */}
          {isHeaderError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex flex-col items-center justify-center text-center gap-3">
              <FileX className="w-12 h-12 text-red-500" />
              <div>
                <h3 className="text-lg font-bold text-red-700">Cấu trúc file không hợp lệ!</h3>
                <p className="text-red-600 mt-1">{headerErrorMessage}</p>
              </div>
              <button
                onClick={() => {
                  resetImport();
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
                className="mt-2 text-indigo-600 font-medium hover:underline flex items-center gap-1"
              >
                <Upload className="w-4 h-4" /> Chọn file khác
              </button>
            </div>
          )}

          {/* Upload Area - Show when no data AND no header error */}
          {data.length === 0 && !isHeaderError && (
            <div className="text-center py-8">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-indigo-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".csv"
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-700 mb-2">
                  Kéo thả file CSV vào đây hoặc click để chọn
                </h3>
                <p className="text-sm text-gray-500">
                  Hỗ trợ file CSV với định dạng UTF-8
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-3"></div>
                <p className="text-gray-600">Đang xử lý file...</p>
              </div>
            </div>
          )}

          {/* Preview Table - Only show if data exists and NO header error */}
          {!isLoading && data.length > 0 && !isHeaderError && <CSVPreviewTable />}
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {/* Only show counts if valid structure */}
              {!isHeaderError && data.length > 0 && (
                <span>
                  Đã tải lên {data.length} bản ghi •
                  {errors.length > 0 ? (
                    <span className="text-red-600 ml-1"> {errors.length} lỗi cần sửa</span>
                  ) : (
                    <span className="text-green-600 ml-1"> Không có lỗi</span>
                  )}
                </span>
              )}
            </div>

            <div className="flex gap-3">
              {uploadStatus === 'success' ? (
                <button
                  onClick={handleClosesucess}
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors min-w-[100px]"
                >
                  Đóng
                </button>
              ) : (

                <>
                  <button
                    onClick={handleClose}
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors min-w-[100px]"
                    disabled={isLoading || uploadStatus === 'uploading'}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleConfirm}
                    // disabled={isLoading || uploadStatus === 'uploading' || data.length === 0 || errors.length > 0 || isHeaderError}
                    className={`px-5 py-2.5 rounded-lg transition-colors min-w-[100px] ${isLoading || uploadStatus === 'uploading' || data.length === 0 || isHeaderError
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                  >
                    {uploadStatus === 'uploading' ? 'Đang import...' : 'Xác nhận'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};