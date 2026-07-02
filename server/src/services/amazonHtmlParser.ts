import * as cheerio from 'cheerio';
import type { ParsedProduct } from './parsedProduct.js';
import {
  getAmazonImageUrl,
  isGenericAmazonImage,
  parseAmazonTitleFromPageTitle,
} from './amazonParser.utils.js';

export function extractAmazonPriceFromHtml(html: string, $: cheerio.CheerioAPI): string | null {
  const displayPrice = html.match(/"displayPrice"\s*:\s*"([^"]+)"/)?.[1];
  if (displayPrice) {
    return displayPrice;
  }

  const priceAmount = html.match(/"priceAmount"\s*:\s*([0-9]+(?:\.[0-9]{1,2})?)/)?.[1];
  const currencyCode = html.match(/"currencyCode"\s*:\s*"([A-Z]{3})"/)?.[1] ?? 'USD';
  if (priceAmount) {
    return currencyCode === 'USD' ? `$${priceAmount}` : `${currencyCode} ${priceAmount}`;
  }

  const offscreen = $('.a-price .a-offscreen').first().text().trim();
  if (offscreen) {
    return offscreen;
  }

  const whole = $('.a-price-whole').first().text().trim().replace(/\.$/, '');
  const fraction = $('.a-price-fraction').first().text().trim();
  if (whole) {
    return fraction ? `$${whole}.${fraction}` : `$${whole}`;
  }

  return $('.a-price.aok-align-center .a-offscreen').first().text().trim() || null;
}

export function extractAmazonTitleFromHtml(html: string, $: cheerio.CheerioAPI): string | null {
  const productTitle = $('#productTitle').text().trim();
  if (productTitle) {
    return productTitle;
  }

  const regexTitle = html.match(/id="productTitle"[^>]*>\s*([^<]+?)\s*</)?.[1]?.trim();
  if (regexTitle) {
    return regexTitle;
  }

  const ogTitle = $('meta[property="og:title"]').attr('content')?.trim();
  if (ogTitle && ogTitle !== 'Amazon.com') {
    const parsed = parseAmazonTitleFromPageTitle(ogTitle);
    if (parsed) {
      return parsed;
    }
  }

  return parseAmazonTitleFromPageTitle($('title').first().text().trim());
}

function extractAmazonImageFromHtml($: cheerio.CheerioAPI, asin: string): string | null {
  const landingImage = $('#landingImage').attr('src') ?? $('#imgTagWrapperId img').attr('src');
  if (landingImage && !isGenericAmazonImage(landingImage)) {
    return landingImage;
  }

  const ogImage = $('meta[property="og:image"]').attr('content');
  if (ogImage && !isGenericAmazonImage(ogImage)) {
    return ogImage;
  }

  const hiRes = $('img[data-old-hires]').attr('data-old-hires');
  if (hiRes && !isGenericAmazonImage(hiRes)) {
    return hiRes;
  }

  return getAmazonImageUrl(asin);
}

export function parseAmazonHtml(html: string, asin: string): ParsedProduct {
  const $ = cheerio.load(html);
  return {
    title: extractAmazonTitleFromHtml(html, $) ?? 'Amazon Product',
    price: extractAmazonPriceFromHtml(html, $),
    image_url: extractAmazonImageFromHtml($, asin),
  };
}
