import { ResidentForm } from "./ResidentForm";

export const EditResidentModal = ({ isOpen, residentId, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const resident = useAppSelector((s) => s.residents.currentResident);

  useEffect(() => {
    if (isOpen && residentId) dispatch(fetchResidentById(residentId));
  }, [isOpen, residentId]);

  if (!isOpen || !resident) return null;

  return (
    <Modal title="Chỉnh sửa cư dân" onClose={onClose}>
      <ResidentForm
        mode="edit"
        initialData={{
          ...resident,
          phone: resident.phone,
          apartmentId: resident.apartment?.id,
        }}
        onSubmit={async (data) => {
          await dispatch(updateResident({ id: residentId, data })).unwrap();
          onSuccess();
          onClose();
        }}
      />
    </Modal>
  );
};
