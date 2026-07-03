export const listKeys = {
  all: ['lists'] as const,
  mine: () => [...listKeys.all, 'mine'] as const,
  detail: (publicId: string, view?: 'guest') =>
    view === 'guest'
      ? ([...listKeys.all, publicId, 'guest'] as const)
      : ([...listKeys.all, publicId] as const),
  detailPrefix: (publicId: string) => [...listKeys.all, publicId] as const,
};
