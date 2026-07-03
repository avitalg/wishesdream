import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout.js';
import { ItemCard } from '../components/ItemCard.js';
import { ClaimModal } from '../components/ClaimModal.js';
import { useListWebSocket } from '../hooks/useListWebSocket.js';
import { useClaimItem } from '../hooks/mutations/useClaimItem.js';
import { useUnclaimItem } from '../hooks/mutations/useUnclaimItem.js';
import { useGiftList } from '../hooks/queries/useGiftList.js';
import { useSeo } from '../hooks/useSeo.js';

export function PublicListPage() {
  const { listId } = useParams<{ listId: string }>();
  const { t } = useTranslation();
  const [claimItemId, setClaimItemId] = useState<number | null>(null);

  const { data, isLoading, error } = useGiftList(listId, { viewAsGuest: true });
  const claimItem = useClaimItem();
  const unclaimItem = useUnclaimItem();

  const list = data?.list;

  useSeo({
    title: list?.title ?? t('seo.publicList.title'),
    description: t('seo.publicList.description'),
    path: listId ? `/lists/${listId}` : '/lists',
    noindex: true,
  });

  useListWebSocket(listId);

  async function handleClaim(name: string) {
    if (!listId || claimItemId === null) {
      return;
    }

    await claimItem.mutateAsync({
      publicId: listId,
      item_id: claimItemId,
      guest_name: name,
      viewAsGuest: true,
    });
  }

  async function handleUnclaim(itemId: number) {
    if (!listId) {
      return;
    }
    await unclaimItem.mutateAsync({ publicId: listId, itemId });
  }

  const items = data?.items ?? [];
  const errorMessage =
    (error instanceof Error ? error.message : null) ??
    (claimItem.error instanceof Error ? claimItem.error.message : null);

  if (isLoading) {
    return (
      <Layout>
        <p className="loading-text">{t('common.loadingList')}</p>
      </Layout>
    );
  }

  if (errorMessage || !list) {
    return (
      <Layout>
        <p className="error-text">{errorMessage ?? t('common.listNotFound')}</p>
      </Layout>
    );
  }

  const claimTarget = items.find((item) => item.id === claimItemId);
  const myClaims = items.filter((item) => item.claimed_by_you);
  const availableCount = items.filter((item) => !item.is_claimed).length;

  return (
    <Layout>
      <section className="list-hero">
        <p className="eyebrow">{t('list.giftRegistry')}</p>
        <h1>{list.title}</h1>
        <div className="list-stats">
          <span className="stat-pill stat-pill--available">
            {t('list.availableCount', { count: availableCount })}
          </span>
          <span className="stat-pill stat-pill--claimed">
            {t('list.selectedCount', { count: items.length - availableCount })}
          </span>
          <span className="stat-pill">{t('list.totalCount', { count: items.length })}</span>
        </div>
      </section>

      {myClaims.length > 0 && (
        <div className="my-claims-banner">
          <strong>{t('list.yourSelections', { count: myClaims.length })}</strong>
          <p>{t('list.unclaimHint')}</p>
        </div>
      )}

      {items.length === 0 ? (
        <p className="empty-state">{t('list.emptyPublic')}</p>
      ) : (
        <div className="items-grid">
          {items.map((item, index) => (
            <ItemCard
              key={item.id}
              item={item}
              index={index}
              isCreator={false}
              onClaim={() => setClaimItemId(item.id)}
              onUnclaim={() => handleUnclaim(item.id)}
            />
          ))}
        </div>
      )}

      {claimTarget && (
        <ClaimModal
          itemTitle={claimTarget.title}
          onClose={() => setClaimItemId(null)}
          onConfirm={handleClaim}
        />
      )}
    </Layout>
  );
}
