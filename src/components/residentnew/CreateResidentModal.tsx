export const CreateResidentModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();

  if (!isOpen) return null;

  return (
    <Modal title="Thêm cư dân" onClose={onClose}>
      <ResidentForm
        mode="create"
        onSubmit={async (data) => {
          await dispatch(createResident(data)).unwrap();
          onSuccess();
          onClose();
        }}
      />
    </Modal>
  );
};
