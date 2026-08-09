export interface GeoResult {
  country: string | undefined;
  city: string | undefined;
}

const PRIVATE_PREFIXES = ['127.', '::1', '10.', '192.168.', '172.16.', '172.17.', '172.18.', '172.19.', '172.20.', '172.21.', '172.22.', '172.23.', '172.24.', '172.25.', '172.26.', '172.27.', '172.28.', '172.29.', '172.30.', '172.31.', 'localhost', '::ffff:127.'];

export async function geolocate(ip: string): Promise<GeoResult> {
  if (!ip || PRIVATE_PREFIXES.some((p) => ip.startsWith(p))) {
    return { country: undefined, city: undefined };
  }

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, {
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return { country: undefined, city: undefined };
    const data = (await res.json()) as { status: string; country?: string; city?: string };
    if (data.status === 'success') {
      return { country: data.country, city: data.city };
    }
  } catch {
    // timeout or network error — don't block ingestion
  }
  return { country: undefined, city: undefined };
}
