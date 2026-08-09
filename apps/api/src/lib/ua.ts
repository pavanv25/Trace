import UAParser from 'ua-parser-js';

export interface ParsedUA {
  browser: string | undefined;
  os: string | undefined;
  deviceType: string | undefined;
}

export function parseUA(uaString: string): ParsedUA {
  const result = new UAParser(uaString).getResult();
  return {
    browser: result.browser.name,
    os: result.os.name,
    deviceType: result.device.type ?? 'desktop',
  };
}
