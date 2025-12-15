import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './store'
import { 
  openModal, 
  closeModal, 
  updateRow, 
  removeRow, 
  resetImport 
} from './csvImportSlice'
import { parseCSVFile, importCSVData } from './csvImportSlice'
import type { CSVRow } from '../types'
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useCSVImport = () => {
  const dispatch = useAppDispatch();
  const csvImportState = useAppSelector((state) => state.csvImport);

  return {
    ...csvImportState,
    openModal: (type: 'residents' | 'staff') => dispatch(openModal(type)),
    closeModal: () => dispatch(closeModal()),
    parseCSVFile: (file: File) => dispatch(parseCSVFile(file)),
    importCSVData: (type: 'residents' | 'staff', data: CSVRow[]) => 
      dispatch(importCSVData({ type, data })),
    updateRow: (rowIndex: number, field: string, value: string) =>
      dispatch(updateRow({ rowIndex, field, value })),
    removeRow: (rowIndex: number) => dispatch(removeRow(rowIndex)),
    resetImport: () => dispatch(resetImport()),
  };
};