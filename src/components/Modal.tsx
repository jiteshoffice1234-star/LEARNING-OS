import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Optional supporting text shown under the title. */
  description?: string;
  /** Form fields / body content. */
  children: ReactNode;
  /** Action row pinned to the bottom (Cancel / Save etc). */
  footer?: ReactNode;
  /** Width of the dialog. Defaults to a comfortable 28rem. */
  maxWidth?: string;
}

/**
 * Shared dialog used by every "New X" form in the app.
 *
 * - Closes on overlay click, the ✕ button and Escape.
 * - Traps initial focus on the first focusable element so keyboard and
 *   screen-reader users land inside the dialog, not behind it.
 * - Renders nothing when `open` is false so it never blocks the page.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'max-w-md',
}: ModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Escape closes; listen on the document so it works from any field.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Move focus into the dialog when it opens.
  useEffect(() => {
    if (!open) return;
    const first = cardRef.current?.querySelector<HTMLElement>(
      'input, select, textarea, button:not([aria-hidden="true"]), [tabindex]:not([tabindex="-1"])'
    );
    first?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative glass-card rounded-t-2xl sm:rounded-2xl p-6 w-full ${maxWidth} max-h-[90vh] overflow-y-auto animate-fade-in`}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-text">{title}</h2>
            {description && <p className="text-xs text-muted mt-1">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg hover:bg-elevated text-muted shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">{children}</div>

        {footer && <div className="flex gap-2 mt-6">{footer}</div>}
      </div>
    </div>
  );
}

/** Standard cancel / submit button pair for modal footers. */
export function ModalActions({
  onCancel,
  onSubmit,
  submitLabel,
  submitDisabled,
  destructive,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  submitDisabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 px-4 py-2.5 rounded-lg bg-elevated text-text text-sm font-medium hover:bg-elevated/80 transition-colors"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitDisabled}
        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
          destructive
            ? 'bg-danger/15 text-danger hover:bg-danger/25'
            : 'bg-primary text-white hover:bg-primary/90'
        }`}
      >
        {submitLabel}
      </button>
    </>
  );
}
