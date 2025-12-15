// components/staff/CreateStaffButton.tsx
import { FC, useState } from 'react';
import { Plus } from 'lucide-react';
import { CreateStaffModal } from './CreateStaffModal';

interface CreateStaffButtonProps {
  onSuccess?: () => void; // Callback khi tạo thành công
}

export const CreateStaffButton: FC<CreateStaffButtonProps> = ({ onSuccess }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800 transition-colors inline-flex items-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Thêm Mới
      </button>

      <CreateStaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
};