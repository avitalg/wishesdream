export const listKeys = {
  all: ['lists'] as const,
  mine: () => [...listKeys.all, 'mine'] as const,
  detail: (publicId: string) => [...listKeys.all, publicId] as const,
};
