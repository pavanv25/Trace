export interface ParsedUA {
  browser: string | undefined;
  os: string | undefined;
  deviceType: string | undefined;
}

interface UAResult {
  browser: { name?: string };
  os: { name?: string };
  device: { type?: string };
}

interface UAParserClass {
  new (ua: string): { getResult(): UAResult };
}

// ua-parser-js v2 uses `export = UAParser`. With NodeNext + esModuleInterop the
// namespace is the constructor itself at runtime.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const UAParser = require('ua-parser-js') as UAParserClass;

export function parseUA(uaString: string): ParsedUA {
  const result = new UAParser(uaString).getResult();
  return {
    browser: result.browser.name,
    os: result.os.name,
    deviceType: result.device.type ?? 'desktop',
  };
}
