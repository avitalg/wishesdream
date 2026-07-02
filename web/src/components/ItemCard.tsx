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
  const creatorItem = isCreatorItem(item) ? item : null;

  function renderStatus() {
    if (!item.is_claimed) {
      return <span className="status-badge available">Available</span>;
    }

    if (item.claimed_by_you) {
      return <span className="status-badge yours">Claimed by You</span>;
    }

    if (isCreator && creatorItem?.guest_name) {
      return (
        <span className="status-badge claimed">
          Claimed by {creatorItem.guest_name}
        </span>
      );
    }

    return <span className="status-badge claimed">Already Selected</span>;
  }

  function renderActions() {
    if (item.claimed_by_you && onUnclaim) {
      return (
        <button type="button" className="btn-outline btn-sm" onClick={onUnclaim}>
          Unclaim
        </button>
      );
    }

    if (isCreator && item.is_claimed && onUnclaim) {
      return (
        <button type="button" className="btn-outline btn-sm" onClick={onUnclaim}>
          Unclaim
        </button>
      );
    }

    if (!item.is_claimed && onClaim) {
      return (
        <button type="button" className="btn-primary btn-sm" onClick={onClaim}>
          Claim Gift
        </button>
      );
    }

    if (item.is_claimed && !item.claimed_by_you && !isCreator) {
      return (
        <button type="button" className="btn-disabled btn-sm" disabled>
          Already Selected
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
        <p className="item-number">Gift {index + 1}</p>
        <h3 className="item-title">{item.title}</h3>
        {item.price && <p className="item-price">{item.price}</p>}

        <div className="item-actions">
          <a
            href={item.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="item-view-link"
          >
            View product →
          </a>
          <div className="item-action-buttons">
            {renderActions()}
            {isCreator && onDelete && (
              <button type="button" className="btn-text-danger btn-sm" onClick={onDelete}>
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
