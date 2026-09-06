import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../api/client.js';
import { useParseUrl } from '../hooks/mutations/useParseUrl.js';
import { GiftPriceField } from './GiftPriceField.js';
import type { GiftItem } from '../types/index.js';
import { applyParsedGiftPrice, formatGiftPrice, parseGiftPrice } from '../utils/giftPrice.js';

interface EditItemModalProps {
  item: GiftItem;
  onConfirm: (payload: {
    productUrl: string;
    title: string;
    imageUrl: string | null;
    price: string | null;
  }) => Promise<void>;
  onClose: () => void;
}

const PARSE_ERROR_KEYS: Record<string, string> = {
  INVALID_URL: 'list.parseErrors.invalidUrl',
  BLOCKED_URL: 'list.parseErrors.blockedUrl',
  TOO_MANY_REDIRECTS: 'list.parseErrors.tooManyRedirects',
  REDIRECT_LOOP: 'list.parseErrors.redirectLoop',
  FETCH_FAILED: 'list.parseErrors.fetchFailed',
  NO_PRODUCT_DATA: 'list.parseErrors.noProductData',
  PARSE_FAILED: 'list.parseErrors.parseFailed',
};

export function EditItemModal({ item, onConfirm, onClose }: EditItemModalProps) {
  const { t } = useTranslation();
  const initialPrice = parseGiftPrice(item.price);
  const [productUrl, setProductUrl] = useState(item.product_url);
  const [title, setTitle] = useState(item.title);
  const [priceAmount, setPriceAmount] = useState(initialPrice.amount);
  const [priceCurrency, setPriceCurrency] = useState(initialPrice.currency);
  const [imageUrl, setImageUrl] = useState(item.image_url ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const parseUrl = useParseUrl();

  function resolveErrorMessage(err: unknown): string | null {
    if (!(err instanceof ApiError)) {
      return err instanceof Error ? err.message : null;
    }

    if (err.code && PARSE_ERROR_KEYS[err.code]) {
      return t(PARSE_ERROR_KEYS[err.code]);
    }

    return err.message;
  }

  async function handlePreview() {
    if (!productUrl.trim()) {
      return;
    }

    setError(null);

    try {
      const parsed = await parseUrl.mutateAsync(productUrl.trim());
      const parsedPrice = applyParsedGiftPrice(parsed.price);
      setTitle(parsed.title);
      setPriceAmount(parsedPrice.amount);
      setPriceCurrency(parsedPrice.currency);
      setImageUrl(parsed.image_url ?? '');
    } catch (err) {
      setError(resolveErrorMessage(err));
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle || !productUrl.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      await onConfirm({
        productUrl: productUrl.trim(),
        title: trimmedTitle,
        imageUrl: imageUrl.trim() || null,
        price: formatGiftPrice(priceAmount, priceCurrency),
      });
      onClose();
    } catch (err) {
      setError(resolveErrorMessage(err) ?? t('list.editGiftFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  const loading = parseUrl.isPending || submitting;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <h2>{t('list.editGift')}</h2>
        <p className="modal-subtitle">{t('list.editGiftHint')}</p>

        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="edit-product-url">
            {t('list.productUrlLabel')}
          </label>
          <div className="url-input-row">
            <input
              id="edit-product-url"
              type="url"
              value={productUrl}
              onChange={(e) => {
                setProductUrl(e.target.value);
                parseUrl.reset();
              }}
              placeholder={t('list.urlPlaceholder')}
              required
            />
            <button
              type="button"
              className="btn-outline btn-sm"
              onClick={handlePreview}
              disabled={loading || !productUrl.trim()}
            >
              {t('common.preview')}
            </button>
          </div>

          <div className="gift-details-fields">
            <label className="field-label" htmlFor="edit-gift-title">
              {t('list.giftTitleLabel')}
            </label>
            <input
              id="edit-gift-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('list.giftTitlePlaceholder')}
              required
            />

            <GiftPriceField
              idPrefix="edit-gift-price"
              amount={priceAmount}
              currency={priceCurrency}
              onAmountChange={setPriceAmount}
              onCurrencyChange={setPriceCurrency}
            />

            <label className="field-label" htmlFor="edit-gift-image">
              {t('list.giftImageLabel')}
            </label>
            <input
              id="edit-gift-image"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder={t('list.giftImagePlaceholder')}
            />

            {imageUrl && (
              <img src={imageUrl} alt="" className="preview-card__image" loading="lazy" />
            )}
          </div>

          {error && (
            <p className="error-text" role="alert">
              {error}
            </p>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={loading || !title.trim()}>
              {submitting ? t('common.saving') : t('list.saveChanges')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
