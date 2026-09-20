const ALLOWED_IMAGE_PROTOCOLS = ['https:', 'http:'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.svg'];

export function isValidImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();

  // Allow local relative public paths e.g. /images/products/saree-1.jpg
  if (trimmed.startsWith('/images/') || trimmed.startsWith('/')) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    if (!ALLOWED_IMAGE_PROTOCOLS.includes(parsed.protocol)) {
      return false;
    }
    // Block local/private IPs in external URLs to prevent SSRF
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

export function sanitizeImageUrls(urls: string[] | string): string[] {
  let list: string[] = [];
  if (typeof urls === 'string') {
    try {
      const parsed = JSON.parse(urls);
      if (Array.isArray(parsed)) list = parsed;
    } catch {
      list = [urls];
    }
  } else if (Array.isArray(urls)) {
    list = urls;
  }

  return list.filter((u) => u && typeof u === 'string' && isValidImageUrl(u));
}
