import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  requireAuth,
  optionalAuth,
  getGuestToken,
  resolveViewerRole,
  type AuthenticatedRequest,
} from '../middleware/auth.js';
import {
  createGiftList,
  findListsByCreator,
  getItemsForViewer,
  addGiftItem,
  deleteGiftItem,
  claimItem,
  unclaimItemIfAuthorized,
  ClaimConflictError,
  ItemNotFoundError,
} from '../services/listService.js';
import { buildExportRows } from '../services/exportService.js';
import { parseProductUrl } from '../services/urlParser.js';
import { wsManager } from '../services/websocket.js';
import {
  findListOrRespond,
  isListCreator,
  respondCreatorRequired,
  respondForbidden,
  routeParam,
} from './listRouteHelpers.js';
import { parsePositiveInt } from '../lib/validators.js';

const router = Router();

function broadcastClaimStatus(publicId: string, itemId: number, isClaimed: boolean): void {
  wsManager.broadcastItemStatus(publicId, itemId, isClaimed);
}

router.get('/mine', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ lists: findListsByCreator(req.user!.userId) });
});

router.post('/', requireAuth, (req: AuthenticatedRequest, res) => {
  const { title } = req.body as { title?: string };
  if (!title?.trim()) {
    res.status(400).json({ error: 'List title is required' });
    return;
  }

  const list = createGiftList(title.trim(), req.user!.userId);
  res.status(201).json({ list });
});

router.post('/parse-url', requireAuth, async (req, res) => {
  const { url } = req.body as { url?: string };
  if (!url?.trim()) {
    res.status(400).json({ error: 'URL is required' });
    return;
  }

  try {
    res.json(await parseProductUrl(url.trim()));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse URL';
    res.status(422).json({ error: message });
  }
});

router.get('/:id', optionalAuth, (req: AuthenticatedRequest, res) => {
  const list = findListOrRespond(routeParam(req.params.id), res);
  if (!list) {
    return;
  }

  const forceGuestView = req.query.view === 'guest';
  const role = forceGuestView ? 'guest' : resolveViewerRole(req, list);
  res.json({
    list: {
      id: list.public_id,
      title: list.title,
      created_at: list.created_at,
      is_creator: !forceGuestView && role === 'creator',
    },
    items: getItemsForViewer(list.id, role, getGuestToken(req)),
  });
});

router.post('/:id/items', requireAuth, async (req: AuthenticatedRequest, res) => {
  const list = findListOrRespond(routeParam(req.params.id), res);
  if (!list || !respondCreatorRequired(res, list, req.user!.userId)) {
    return;
  }

  const { product_url, title, image_url, price } = req.body as {
    product_url?: string;
    title?: string;
    image_url?: string | null;
    price?: string | null;
  };

  if (!product_url?.trim()) {
    res.status(400).json({ error: 'Product URL is required' });
    return;
  }

  let parsed = { title: title?.trim() ?? '', image_url: image_url ?? null, price: price ?? null };
  if (!parsed.title) {
    try {
      const metadata = await parseProductUrl(product_url.trim());
      parsed = { title: metadata.title, image_url: metadata.image_url, price: metadata.price };
    } catch {
      parsed.title = 'Gift Item';
    }
  }

  const item = addGiftItem(list.id, {
    title: parsed.title,
    image_url: parsed.image_url,
    price: parsed.price,
    product_url: product_url.trim(),
  });

  res.status(201).json({ item });
});

router.delete('/:id/items/:itemId', requireAuth, (req: AuthenticatedRequest, res) => {
  const list = findListOrRespond(routeParam(req.params.id), res);
  if (!list || !respondCreatorRequired(res, list, req.user!.userId)) {
    return;
  }

  const itemId = parsePositiveInt(req.params.itemId);
  if (itemId === null) {
    res.status(400).json({ error: 'Item id must be a positive integer' });
    return;
  }

  if (!deleteGiftItem(itemId, list.id)) {
    res.status(404).json({ error: 'Item not found' });
    return;
  }

  broadcastClaimStatus(list.public_id, itemId, false);
  res.status(204).send();
});

router.get('/:id/export', requireAuth, (req: AuthenticatedRequest, res) => {
  const list = findListOrRespond(routeParam(req.params.id), res);
  if (!list) {
    return;
  }

  if (!isListCreator(list, req.user!.userId)) {
    respondForbidden(res, 'Not authorized to export this list');
    return;
  }

  res.json({ list: { title: list.title }, items: buildExportRows(list.id) });
});

router.post('/:id/claim', optionalAuth, (req: AuthenticatedRequest, res) => {
  const list = findListOrRespond(routeParam(req.params.id), res);
  if (!list) {
    return;
  }

  const { item_id, guest_name, guest_token, on_behalf } = req.body as {
    item_id?: number;
    guest_name?: string;
    guest_token?: string;
    on_behalf?: boolean;
  };

  if (!item_id) {
    res.status(400).json({ error: 'item_id is required' });
    return;
  }

  const parsedItemId = parsePositiveInt(item_id);
  if (parsedItemId === null) {
    res.status(400).json({ error: 'item_id must be a positive integer' });
    return;
  }

  const creator = isListCreator(list, req.user?.userId);
  if (on_behalf && !creator) {
    respondForbidden(res, 'Only the list creator can claim on behalf of guests');
    return;
  }

  if (!guest_name?.trim()) {
    res.status(400).json({ error: 'Guest name is required' });
    return;
  }

  const token = on_behalf ? uuidv4() : (guest_token ?? uuidv4());

  try {
    const claim = claimItem(parsedItemId, list.id, guest_name, token);
    broadcastClaimStatus(list.public_id, parsedItemId, true);

    const viewerRole = on_behalf && creator ? 'creator' : 'guest';

    res.status(201).json({
      claim: { id: claim.id, guest_token: token },
      items: getItemsForViewer(list.id, viewerRole, token),
    });
  } catch (error) {
    if (error instanceof ClaimConflictError) {
      res.status(409).json({ error: error.message });
      return;
    }
    if (error instanceof ItemNotFoundError) {
      res.status(404).json({ error: error.message });
      return;
    }
    throw error;
  }
});

router.delete('/:id/claim/:itemId', optionalAuth, (req: AuthenticatedRequest, res) => {
  const list = findListOrRespond(routeParam(req.params.id), res);
  if (!list) {
    return;
  }

  const itemId = parsePositiveInt(req.params.itemId);
  if (itemId === null) {
    res.status(400).json({ error: 'Item id must be a positive integer' });
    return;
  }

  const result = unclaimItemIfAuthorized(
    itemId,
    list.id,
    isListCreator(list, req.user?.userId),
    getGuestToken(req),
  );

  if (!result.ok) {
    if (result.reason === 'not_found') {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    if (result.reason === 'not_claimed') {
      res.status(404).json({ error: 'Item is not claimed' });
      return;
    }
    respondForbidden(res, 'You can only unclaim your own selections');
    return;
  }

  broadcastClaimStatus(list.public_id, itemId, false);
  res.status(204).send();
});

export default router;
