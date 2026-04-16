import React from 'react';

interface SafeDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const SafeDeleteModal: React.FC<SafeDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Löschen bestätigen",
  message = "Sind Sie sicher, dass Sie dieses Element löschen möchten?",
  confirmText = "Löschen",
  cancelText = "Abbrechen"
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="termin-modal-overlay">
      <div
        className="termin-modal-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h3>{title}</h3>
        <p>{message}</p>
        <div
          style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}
        >
          <button type="button" onClick={onClose} className="btn-outline-muted">
            {cancelText}
          </button>
          <button type="button" onClick={handleConfirm} className="btn btn-danger">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafeDeleteModal;
