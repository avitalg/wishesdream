import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '../components/Layout.js';
import { useAuth } from '../context/AuthContext.js';
import { api, getGuestToken } from '../api/client.js';
import { AddItemForm } from '../components/AddItemForm.js';
import { ItemCard } from '../components/ItemCard.js';
import { ClaimModal } from '../components/ClaimModal.js';
import { useListWebSocket } from '../hooks/useListWebSocket.js';
import { useClaimItem } from '../hooks/mutations/useClaimItem.js';
import { useDeleteItem } from '../hooks/mutations/useDeleteItem.js';
import { useUnclaimItem } from '../hooks/mutations/useUnclaimItem.js';
import { useGiftList } from '../hooks/queries/useGiftList.js';
import { useSeo } from '../hooks/useSeo.js';

export function CreatorManagePage() {
  const { listId } = useParams<{ listId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [claimItemId, setClaimItemId] = useState<number | null>(null);
  const [claimOnBehalf, setClaimOnBehalf] = useState(false);

  const { data, isLoading, error } = useGiftList(listId);
  const claimItem = useClaimItem();
  const unclaimItem = useUnclaimItem();
  const deleteItem = useDeleteItem();

  useSeo({
    title: t('seo.manageList.title'),
    path: listId ? `/lists/${listId}/manage` : '/lists',
    noindex: true,
  });

  useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (data && !data.list.is_creator && listId) {
      navigate(`/lists/${listId}`);
    }
  }, [data, listId, navigate]);

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
      on_behalf: claimOnBehalf,
    });
  }

  async function handleUnclaim(itemId: number) {
    if (!listId) {
      return;
    }
    await unclaimItem.mutateAsync({ publicId: listId, itemId });
  }

  async function handleDelete(itemId: number) {
    if (!listId) {
      return;
    }
    if (!window.confirm(t('list.removeConfirm'))) {
      return;
    }
    await deleteItem.mutateAsync({ publicId: listId, itemId });
  }

  async function handleExport() {
    if (!listId) {
      return;
    }

    const result = await api.exportList(listId);
    const { downloadListPdf } = await import('../utils/exportListPdf.js');
    downloadListPdf(result);
  }

  const list = data?.list;
  const items = data?.items ?? [];
  const shareUrl = listId ? `${window.location.origin}/lists/${listId}` : '';
  const errorMessage =
    (error instanceof Error ? error.message : null) ??
    (claimItem.error instanceof Error ? claimItem.error.message : null);

  if (isLoading) {
    return (
      <Layout>
        <p className="loading-text">{t('common.loadingManage')}</p>
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

  return (
    <Layout>
      <section className="list-hero list-hero--manage">
        <p className="eyebrow">{t('list.hostDashboard')}</p>
        <h1>{list.title}</h1>
        <div className="header-actions">
          <button type="button" className="btn-outline btn-sm" onClick={handleExport}>
            {t('list.exportPdf')}
          </button>
          <Link to={`/lists/${listId}`} className="btn-outline btn-sm">
            {t('list.previewGuestView')}
          </Link>
        </div>
      </section>

      <div className="share-box">
        <label>{t('list.shareLabel')}</label>
        <div className="share-row">
          <input type="text" readOnly value={shareUrl} />
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={() => navigator.clipboard.writeText(shareUrl)}
          >
            {t('common.copy')}
          </button>
        </div>
      </div>

      <AddItemForm listId={listId!} />

      <section className="items-section">
        <div className="section-intro section-intro--left">
          <h2>{t('list.giftCollection')}</h2>
          <p className="form-hint">
            {items.length} {items.length === 1 ? t('common.item') : t('common.items')}
          </p>
        </div>
        {items.length === 0 ? (
          <p className="empty-state">{t('list.emptyManage')}</p>
        ) : (
          <div className="items-grid">
            {items.map((item, index) => (
              <ItemCard
                key={item.id}
                item={item}
                index={index}
                isCreator
                onClaim={() => {
                  setClaimOnBehalf(true);
                  setClaimItemId(item.id);
                }}
                onUnclaim={() => handleUnclaim(item.id)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </div>
        )}
      </section>

      {claimTarget && (
        <ClaimModal
          itemTitle={claimTarget.title}
          onBehalf={claimOnBehalf}
          onClose={() => {
            setClaimItemId(null);
            setClaimOnBehalf(false);
          }}
          onConfirm={handleClaim}
        />
      )}
    </Layout>
  );
}
