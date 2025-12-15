// components/CSVImport/CSVImportButton.tsx
import { FC } from 'react';
import { Upload } from 'lucide-react';
import { useCSVImport } from '../../store/hooks';
import { CSVImportModal } from './CSVImportModal';

interface CSVImportButtonProps {
  importType: 'residents' | 'staff';
}

export const CSVImportButton: FC<CSVImportButtonProps> = ({ importType }) => {
  const { openModal } = useCSVImport();

  return (
    <>
      <button
        onClick={() => openModal(importType)}
        className="px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800 transition-colors inline-flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        Import CSV
      </button>
      
      <CSVImportModal />
    </>
  );
};