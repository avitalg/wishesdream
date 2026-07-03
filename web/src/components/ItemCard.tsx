import { useTranslation } from 'react-i18next';
import type { GiftItem } from '../types/index.js';
import { isCreatorItem } from '../types/index.js';

interface ItemCardProps {
  item: GiftItem;
  index: number;
  isCreator: boolean;
  onClaim?: () => void;
  onUnclaim?: () => void;
  onDelete?: () => void;
}

export function ItemCard({ item, index, isCreator, onClaim, onUnclaim, onDelete }: ItemCardProps) {
  const { t } = useTranslation();
  const creatorItem = isCreatorItem(item) ? item : null;

  function renderStatus() {
    if (!item.is_claimed) {
      return <span className="status-badge available">{t('common.available')}</span>;
    }

    if (item.claimed_by_you) {
      return <span className="status-badge yours">{t('common.claimedByYou')}</span>;
    }

    if (isCreator && creatorItem?.guest_name) {
      return (
        <span className="status-badge claimed">
          {t('common.claimedBy', { name: creatorItem.guest_name })}
        </span>
      );
    }

    return <span className="status-badge claimed">{t('common.alreadySelected')}</span>;
  }

  function renderActions() {
    if (item.claimed_by_you && onUnclaim) {
      return (
        <button type="button" className="btn-outline btn-sm" onClick={onUnclaim}>
          {t('common.unclaim')}
        </button>
      );
    }

    if (isCreator && item.is_claimed && onUnclaim) {
      return (
        <button type="button" className="btn-outline btn-sm" onClick={onUnclaim}>
          {t('common.unclaim')}
        </button>
      );
    }

    if (!item.is_claimed && onClaim) {
      return (
        <button type="button" className="btn-primary btn-sm" onClick={onClaim}>
          {t('common.claimGift')}
        </button>
      );
    }

    if (item.is_claimed && !item.claimed_by_you && !isCreator) {
      return (
        <button type="button" className="btn-disabled btn-sm" disabled>
          {t('common.alreadySelected')}
        </button>
      );
    }

    return null;
  }

  return (
    <article className={`item-card ${item.is_claimed ? 'is-claimed' : ''}`}>
      <div className="item-image-wrap">
        {item.image_url ? (
          <img src={item.image_url} alt={item.title} className="item-image" loading="lazy" />
        ) : (
          <div className="item-image-placeholder">
            <span aria-hidden="true">🎁</span>
          </div>
        )}
        <div className="item-image-badge">{renderStatus()}</div>
      </div>

      <div className="item-body">
        <p className="item-number">{t('common.giftNumber', { number: index + 1 })}</p>
        <h3 className="item-title">{item.title}</h3>
        {item.price && <p className="item-price">{item.price}</p>}

        <div className="item-actions">
          <a
            href={item.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="item-view-link"
          >
            {t('common.viewProduct')}
          </a>
          <div className="item-action-buttons">
            {renderActions()}
            {isCreator && onDelete && (
              <button type="button" className="btn-text-danger btn-sm" onClick={onDelete}>
                {t('common.remove')}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
