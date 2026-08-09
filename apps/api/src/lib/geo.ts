export interface GeoResult {
  country: string | undefined;
  city: string | undefined;
}

function isPrivateIP(ip: string): boolean {
  if (!ip || ip === '::1' || ip === 'localhost') return true;
  // IPv4 private ranges
  if (/^127\./.test(ip)) return true;
  if (/^10\./.test(ip)) return true;
  if (/^192\.168\./.test(ip)) return true;
  if (/^169\.254\./.test(ip)) return true; // link-local
  // 172.16.0.0 – 172.31.255.255
  const m = ip.match(/^172\.(\d+)\./);
  if (m && Number(m[1]) >= 16 && Number(m[1]) <= 31) return true;
  // IPv6 loopback / ULA
  if (/^::ffff:127\./.test(ip)) return true;
  if (/^fc|^fd/i.test(ip)) return true;
  return false;
}

export async function geolocate(ip: string): Promise<GeoResult> {
  if (isPrivateIP(ip)) return { country: undefined, city: undefined };

  try {
    // ipapi.co supports HTTPS on the free tier
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return { country: undefined, city: undefined };
    const data = (await res.json()) as { error?: boolean; country_name?: string; city?: string };
    if (!data.error) {
      return { country: data.country_name, city: data.city };
    }
  } catch {
    // timeout or network error — never block ingestion
  }
  return { country: undefined, city: undefined };
}
