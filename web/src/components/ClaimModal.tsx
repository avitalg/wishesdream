import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

interface ClaimModalProps {
  itemTitle: string;
  onConfirm: (name: string) => Promise<void>;
  onClose: () => void;
  onBehalf?: boolean;
}

export function ClaimModal({ itemTitle, onConfirm, onClose, onBehalf = false }: ClaimModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await onConfirm(name.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.claimFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{onBehalf ? t('list.claimOnBehalfTitle') : t('list.claimModalTitle')}</h2>
        <p className="modal-subtitle">
          {onBehalf
            ? t('list.claimOnBehalfSubtitle', { title: itemTitle })
            : t('list.claimModalSubtitle', { title: itemTitle })}
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            {t('common.name')}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              placeholder={t('auth.namePlaceholder')}
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? t('common.confirming') : t('list.confirmClaim')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
