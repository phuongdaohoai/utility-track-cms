import { FC, useState } from 'react';
import { Plus } from 'lucide-react'; 
import { CreateResidentModal } from './CreateResidentModal';

interface CreateResidentButtonProps {
  onSuccess?: () => void; 
}

export const CreateResidentButton: FC<CreateResidentButtonProps> = ({ onSuccess }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = () => {
    if (onSuccess) onSuccess();
 
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-indigo-700 text-white rounded hover:bg-indigo-800 transition-colors inline-flex items-center gap-2 font-medium"
      >
     
        <Plus className="w-4 h-4" /> 
        Thêm Cư Dân
      </button>

      <CreateResidentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
};