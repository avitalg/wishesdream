import { useTranslation } from 'react-i18next';
import { GIFT_CURRENCY_CODES } from '../utils/giftPrice.js';

interface GiftPriceFieldProps {
  idPrefix: string;
  amount: string;
  currency: string;
  onAmountChange: (amount: string) => void;
  onCurrencyChange: (currency: string) => void;
}

export function GiftPriceField({
  idPrefix,
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
}: GiftPriceFieldProps) {
  const { t } = useTranslation();
  const amountId = `${idPrefix}-amount`;
  const currencyId = `${idPrefix}-currency`;

  return (
    <>
      <label className="field-label" htmlFor={amountId}>
        {t('list.giftPriceLabel')}
      </label>
      <div className="price-input-row">
        <input
          id={amountId}
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder={t('list.giftPricePlaceholder')}
        />
        <select
          id={currencyId}
          className="price-currency-select"
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          aria-label={t('list.giftCurrencyLabel')}
        >
          <option value="">{t('list.currencyNone')}</option>
          {GIFT_CURRENCY_CODES.map((code) => (
            <option key={code} value={code}>
              {t(`list.currencies.${code}`)}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
