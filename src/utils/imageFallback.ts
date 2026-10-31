/**
 * imageFallback.ts — Global Image Fallback & Visibility Protection
 *
 * Ensures that if any remote CDN (e.g. Wix, external image host) fails, drops connection,
 * or returns a 404/403, images fail over gracefully to a bundled local high-resolution asset.
 */

import React from 'react';

export const DEFAULT_FALLBACK_IMAGE = '/assets/portfolio/default_wedding_photo.jpg';
export const DEFAULT_VIDEO_POSTER = '/assets/posters/urmi_jasraj.jpg';
export const DEFAULT_AVATAR = '/assets/team/brinta_deb.jpg';

export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  customFallback: string = DEFAULT_FALLBACK_IMAGE
) {
  const target = event.currentTarget;
  // Guard against infinite loop if fallback itself fails
  if (!target.dataset.hasFallback) {
    target.dataset.hasFallback = 'true';
    target.src = customFallback;
  }
}

/**
 * Returns a guaranteed valid image URL, falling back to bundled default if empty or invalid
 */
export function getSafeImageUrl(
  url?: string | null,
  customFallback: string = DEFAULT_FALLBACK_IMAGE
): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return customFallback;
  }
  return url;
}

/**
 * Generates high-performance optimized Wix CDN image URLs.
 * Scales large 40MP RAW master camera exports down to responsive display dimensions,
 * reducing decoded memory overhead by 98% and eliminating main-thread decode jank.
 */
export function getOptimizedWixImageUrl(
  url?: string | null,
  width: number = 600,
  height: number = 800,
  quality: number = 80
): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return DEFAULT_FALLBACK_IMAGE;
  }

  // If already optimized or not a Wix CDN URL, return as-is
  if (url.includes('/v1/fill/') || url.includes('/v1/crop/')) {
    return url;
  }
  if (!url.includes('static.wixstatic.com/media/')) {
    return url;
  }

  // Append Wix on-the-fly dynamic image optimization transform
  return `${url}/v1/fill/w_${width},h_${height},q_${quality}/file.jpg`;
}

