import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiError } from '../api/client.js';
import { useAddItem } from '../hooks/mutations/useAddItem.js';
import { useParseUrl } from '../hooks/mutations/useParseUrl.js';
import { GiftPriceField } from './GiftPriceField.js';
import { applyParsedGiftPrice, formatGiftPrice } from '../utils/giftPrice.js';

interface AddItemFormProps {
  listId: string;
}

interface GiftDetails {
  title: string;
  priceAmount: string;
  priceCurrency: string;
  imageUrl: string;
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

function emptyDetails(): GiftDetails {
  return { title: '', priceAmount: '', priceCurrency: '', imageUrl: '' };
}

export function AddItemForm({ listId }: AddItemFormProps) {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [details, setDetails] = useState<GiftDetails>(emptyDetails);
  const [showDetails, setShowDetails] = useState(false);
  const parseUrl = useParseUrl();
  const addItem = useAddItem();

  function resetForm() {
    setUrl('');
    setDetails(emptyDetails());
    setShowDetails(false);
    parseUrl.reset();
  }

  function applyParsedDetails(title: string, price: string | null, imageUrl: string | null) {
    const parsedPrice = applyParsedGiftPrice(price);
    setDetails({
      title,
      priceAmount: parsedPrice.amount,
      priceCurrency: parsedPrice.currency,
      imageUrl: imageUrl ?? '',
    });
    setShowDetails(true);
  }

  function resolveErrorMessage(error: unknown): string | null {
    if (!(error instanceof ApiError)) {
      return error instanceof Error ? error.message : null;
    }

    if (error.code && PARSE_ERROR_KEYS[error.code]) {
      return t(PARSE_ERROR_KEYS[error.code]);
    }

    return error.message;
  }

  async function handlePreview() {
    if (!url.trim()) {
      return;
    }

    try {
      const parsed = await parseUrl.mutateAsync(url.trim());
      applyParsedDetails(parsed.title, parsed.price, parsed.image_url);
    } catch {
      setShowDetails(true);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!url.trim()) {
      return;
    }

    const title = details.title.trim();
    if (!title) {
      setShowDetails(true);
      return;
    }

    await addItem.mutateAsync({
      publicId: listId,
      productUrl: url.trim(),
      title,
      imageUrl: details.imageUrl.trim() || null,
      price: formatGiftPrice(details.priceAmount, details.priceCurrency),
    });
    resetForm();
  }

  const loading = parseUrl.isPending || addItem.isPending;
  const errorMessage =
    resolveErrorMessage(parseUrl.error) ?? resolveErrorMessage(addItem.error);
  const canSubmit = Boolean(url.trim() && details.title.trim());

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
            addItem.reset();
          }}
          placeholder={t('list.urlPlaceholder')}
          required
        />
        <button type="button" className="btn-outline btn-sm" onClick={handlePreview} disabled={loading || !url.trim()}>
          {t('common.preview')}
        </button>
      </div>

      {errorMessage && (
        <p className="error-text" role="alert">
          {errorMessage}
        </p>
      )}

      {(showDetails || errorMessage) && (
        <div className="gift-details-fields">
          <p className="form-hint">{t('list.manualDetailsHint')}</p>

          <label className="field-label" htmlFor="gift-title">
            {t('list.giftTitleLabel')}
          </label>
          <input
            id="gift-title"
            type="text"
            value={details.title}
            onChange={(e) => setDetails((current) => ({ ...current, title: e.target.value }))}
            placeholder={t('list.giftTitlePlaceholder')}
            required
          />

          <GiftPriceField
            idPrefix="gift-price"
            amount={details.priceAmount}
            currency={details.priceCurrency}
            onAmountChange={(priceAmount) =>
              setDetails((current) => ({ ...current, priceAmount }))
            }
            onCurrencyChange={(priceCurrency) =>
              setDetails((current) => ({ ...current, priceCurrency }))
            }
          />

          <label className="field-label" htmlFor="gift-image">
            {t('list.giftImageLabel')}
          </label>
          <input
            id="gift-image"
            type="url"
            value={details.imageUrl}
            onChange={(e) => setDetails((current) => ({ ...current, imageUrl: e.target.value }))}
            placeholder={t('list.giftImagePlaceholder')}
          />

          {details.imageUrl && (
            <img src={details.imageUrl} alt="" className="preview-card__image" loading="lazy" />
          )}
        </div>
      )}

      {!showDetails && !errorMessage && (
        <div className="add-item-form__actions">
          <button
            type="button"
            className="btn-text manual-details-toggle"
            onClick={() => setShowDetails(true)}
          >
            {t('list.enterDetailsManually')}
          </button>
        </div>
      )}

      {(showDetails || errorMessage) && (
        <div className="add-item-form__actions">
          <button type="submit" className="btn-primary add-item-form__submit" disabled={loading || !canSubmit}>
            {addItem.isPending ? t('common.adding') : t('list.addToList')}
          </button>
        </div>
      )}
    </form>
  );
}
