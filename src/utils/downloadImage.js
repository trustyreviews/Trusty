import { Platform } from 'react-native';

/** Sanitize a filename segment for downloads. */
export function safeFilenamePart(value) {
  return String(value || 'review')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

/**
 * Trigger a real browser file download (PC/web).
 * Uses a Blob URL — large data: URIs are often blocked by Chrome.
 */
export function downloadImageFromDataUri(dataUri, filename) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    throw new Error('Downloads are only available in the browser.');
  }
  if (!dataUri || typeof dataUri !== 'string') {
    throw new Error('Nothing to download — capture returned empty.');
  }

  let href = dataUri;
  let revoke = null;

  if (dataUri.startsWith('data:')) {
    const comma = dataUri.indexOf(',');
    if (comma < 0) throw new Error('Invalid image data.');
    const header = dataUri.slice(0, comma);
    const data = dataUri.slice(comma + 1);
    const mime = /data:(.*?);/.exec(header)?.[1] || 'image/png';
    const binary = atob(data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mime });
    href = URL.createObjectURL(blob);
    revoke = () => URL.revokeObjectURL(href);
  }

  const link = document.createElement('a');
  link.href = href;
  link.download = filename || 'trusty-review.png';
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  if (revoke) setTimeout(revoke, 2000);
}
