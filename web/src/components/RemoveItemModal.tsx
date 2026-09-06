import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface RemoveItemModalProps {
  itemTitle: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function RemoveItemModal({ itemTitle, onConfirm, onClose }: RemoveItemModalProps) {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm() {
    setError(null);
    setSubmitting(true);

    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('list.removeFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{t('list.removeModalTitle')}</h2>
        <p className="modal-subtitle">{t('list.removeModalSubtitle', { title: itemTitle })}</p>

        {error && <p className="error-text">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
            {t('common.cancel')}
          </button>
          <button type="button" className="btn-danger" onClick={handleConfirm} disabled={submitting}>
            {submitting ? t('common.confirming') : t('list.confirmRemove')}
          </button>
        </div>
      </div>
    </div>
  );
}
