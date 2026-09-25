import { describe, expect, it } from 'vitest';
import {
  blogAlternates,
  blogLocaleFromPath,
  findBlogArticle,
  isBlogPath,
  isHebrewBlogPath,
  localizeHref,
  localizedBlogPath,
  toEnglishBlogPath,
} from './blog.js';

describe('blog paths', () => {
  it('finds articles by slug', () => {
    expect(findBlogArticle('gift-list')?.path).toBe('/blog/gift-list');
    expect(findBlogArticle('wishlist')?.landingKey).toBe('giftWishlist');
    expect(findBlogArticle('missing')).toBeUndefined();
    expect(findBlogArticle(undefined)).toBeUndefined();
  });

  it('recognizes English and Hebrew blog urls', () => {
    expect(isBlogPath('/blog')).toBe(true);
    expect(isBlogPath('/blog/gift-list')).toBe(true);
    expect(isBlogPath('/he/blog/wishlist')).toBe(true);
    expect(isHebrewBlogPath('/he/blog/gift-list/')).toBe(true);
    expect(isBlogPath('/he/blog/not-a-post')).toBe(false);
    expect(isHebrewBlogPath('/blog/gift-list')).toBe(false);
    expect(isBlogPath('/faq')).toBe(false);
  });

  it('maps a path to its English and localized forms', () => {
    expect(toEnglishBlogPath('/he/blog/wishlist/')).toBe('/blog/wishlist');
    expect(toEnglishBlogPath('/blog/gift-list')).toBe('/blog/gift-list');
    expect(localizedBlogPath('/blog/gift-list', 'he')).toBe('/he/blog/gift-list');
    expect(localizedBlogPath('/blog', 'en')).toBe('/blog');
    expect(localizeHref('/faq', 'he')).toBe('/faq');
  });

  it('builds hreflang alternates and a locale from the url', () => {
    expect(blogAlternates('/blog/gift-list')).toEqual([
      { hreflang: 'en', path: '/blog/gift-list' },
      { hreflang: 'he', path: '/he/blog/gift-list' },
      { hreflang: 'he-IL', path: '/he/blog/gift-list' },
      { hreflang: 'x-default', path: '/blog/gift-list' },
    ]);
    expect(blogLocaleFromPath('/he/blog')).toBe('he');
    expect(blogLocaleFromPath('/blog/wishlist')).toBe('en');
    expect(blogLocaleFromPath('/privacy')).toBeNull();
  });
});
