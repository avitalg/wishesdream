import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAddItem } from '../hooks/mutations/useAddItem.js';
import { useParseUrl } from '../hooks/mutations/useParseUrl.js';

interface AddItemFormProps {
  listId: string;
}

export function AddItemForm({ listId }: AddItemFormProps) {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const parseUrl = useParseUrl();
  const addItem = useAddItem();

  const preview = parseUrl.data
    ? { title: parseUrl.data.title, price: parseUrl.data.price }
    : null;

  async function handlePreview() {
    if (!url.trim()) {
      return;
    }
    await parseUrl.mutateAsync(url.trim());
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!url.trim()) {
      return;
    }

    await addItem.mutateAsync({ publicId: listId, productUrl: url.trim() });
    setUrl('');
    parseUrl.reset();
  }

  const loading = parseUrl.isPending || addItem.isPending;
  const errorMessage =
    (parseUrl.error instanceof Error ? parseUrl.error.message : null) ??
    (addItem.error instanceof Error ? addItem.error.message : null);

  return (
    <form className="add-item-form" onSubmit={handleSubmit}>
      <h3>{t('list.addGift')}</h3>
      <p className="form-hint">{t('list.addGiftHint')}</p>

      <div className="url-input-row">
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            parseUrl.reset();
          }}
          placeholder={t('list.urlPlaceholder')}
          required
        />
        <button type="button" className="btn-outline btn-sm" onClick={handlePreview} disabled={loading || !url.trim()}>
          {t('common.preview')}
        </button>
      </div>

      {preview && (
        <div className="preview-card">
          <strong>{preview.title}</strong>
          {preview.price && <span>{preview.price}</span>}
        </div>
      )}

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <button type="submit" className="btn-primary" disabled={loading || !url.trim()}>
        {addItem.isPending ? t('common.adding') : t('list.addToList')}
      </button>
    </form>
  );
}
