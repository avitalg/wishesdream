import { useState, type FormEvent } from 'react';

interface ClaimModalProps {
  itemTitle: string;
  onConfirm: (name: string) => Promise<void>;
  onClose: () => void;
  onBehalf?: boolean;
}

export function ClaimModal({ itemTitle, onConfirm, onClose, onBehalf = false }: ClaimModalProps) {
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
      setError(err instanceof Error ? err.message : 'Failed to claim item');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{onBehalf ? 'Claim on Behalf of Guest' : 'Claim This Gift'}</h2>
        <p className="modal-subtitle">
          {onBehalf
            ? `Mark "${itemTitle}" as claimed for an offline guest.`
            : `You're reserving "${itemTitle}". Your name won't be visible to other guests.`}
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              placeholder="Sarah Johnson"
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Confirming…' : 'Confirm Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
