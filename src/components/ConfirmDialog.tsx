import { AlertTriangle } from 'lucide-react';
import Modal, { ModalActions } from './Modal';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * Shared destructive-action confirmation. Replaces the old "click twice"
 * pattern so every delete in the app asks the same clear question once.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  destructive = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <ModalActions
          onCancel={onClose}
          onSubmit={onConfirm}
          submitLabel={confirmLabel}
          destructive={destructive}
        />
      }
    >
      <div className="flex items-start gap-3 rounded-lg border border-border bg-elevated/50 p-3">
        <AlertTriangle
          className={`mt-0.5 h-5 w-5 flex-shrink-0 ${destructive ? 'text-danger' : 'text-accent'}`}
        />
        <p className="text-sm leading-relaxed text-muted">{message}</p>
      </div>
    </Modal>
  );
}
