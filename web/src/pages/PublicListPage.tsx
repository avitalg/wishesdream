import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/Layout.js';
import { getGuestToken } from '../api/client.js';
import { ItemCard } from '../components/ItemCard.js';
import { ClaimModal } from '../components/ClaimModal.js';
import { useListWebSocket } from '../hooks/useListWebSocket.js';
import { useClaimItem } from '../hooks/mutations/useClaimItem.js';
import { useUnclaimItem } from '../hooks/mutations/useUnclaimItem.js';
import { useGiftList } from '../hooks/queries/useGiftList.js';

export function PublicListPage() {
  const { listId } = useParams<{ listId: string }>();
  const [claimItemId, setClaimItemId] = useState<number | null>(null);

  const { data, isLoading, error } = useGiftList(listId);
  const claimItem = useClaimItem();
  const unclaimItem = useUnclaimItem();

  useListWebSocket(listId);

  async function handleClaim(name: string) {
    if (!listId || claimItemId === null) {
      return;
    }

    await claimItem.mutateAsync({
      publicId: listId,
      item_id: claimItemId,
      guest_name: name,
      guest_token: getGuestToken() ?? undefined,
    });
  }

  async function handleUnclaim(itemId: number) {
    if (!listId) {
      return;
    }
    await unclaimItem.mutateAsync({ publicId: listId, itemId });
  }

  const list = data?.list;
  const items = data?.items ?? [];
  const errorMessage =
    (error instanceof Error ? error.message : null) ??
    (claimItem.error instanceof Error ? claimItem.error.message : null);

  if (isLoading) {
    return (
      <Layout>
        <p className="loading-text">Loading gift list…</p>
      </Layout>
    );
  }

  if (errorMessage || !list) {
    return (
      <Layout>
        <p className="error-text">{errorMessage ?? 'List not found'}</p>
      </Layout>
    );
  }

  const claimTarget = items.find((item) => item.id === claimItemId);
  const myClaims = items.filter((item) => item.claimed_by_you);
  const availableCount = items.filter((item) => !item.is_claimed).length;

  return (
    <Layout>
      <section className="list-hero">
        <p className="eyebrow">Gift Registry</p>
        <h1>{list.title}</h1>
        <div className="list-stats">
          <span className="stat-pill stat-pill--available">{availableCount} available</span>
          <span className="stat-pill stat-pill--claimed">{items.length - availableCount} selected</span>
          <span className="stat-pill">{items.length} total</span>
        </div>
      </section>

      {myClaims.length > 0 && (
        <div className="my-claims-banner">
          <strong>Your selections ({myClaims.length})</strong>
          <p>You can unclaim any of your items if you change your mind.</p>
        </div>
      )}

      {items.length === 0 ? (
        <p className="empty-state">This list doesn't have any gifts yet. Check back soon!</p>
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
