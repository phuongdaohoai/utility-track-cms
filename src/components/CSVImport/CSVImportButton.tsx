// components/CSVImport/CSVImportButton.tsx
import { FC } from 'react';
import { Upload } from 'lucide-react';
import { useCSVImport } from '../../store/hooks';
import { CSVImportModal } from './CSVImportModal';
import { useLocale } from '../../i18n/LocaleContext';


interface CSVImportButtonProps {
  importType: 'residents' | 'staff';
  onSuccess?: () => void; 
}
export const CSVImportButton: FC<CSVImportButtonProps> = ({ importType, onSuccess }) => {
  const { t } = useLocale()
  const { openModal } = useCSVImport();

  return (
    <>
      <button
        onClick={() => openModal(importType)}
        className="px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800 transition-colors inline-flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        {t.csvImport.importCSV}
      </button>
      
      <CSVImportModal onSuccess={onSuccess} />
    </>
  );
};