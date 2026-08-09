type TraceMethod = 'init' | 'event' | 'identify';
type QueueItem = [TraceMethod, ...unknown[]];

interface TraceConfig {
  endpoint?: string;
}

interface TraceFunction {
  (method: TraceMethod, ...args: unknown[]): void;
  q?: QueueItem[];
}

declare global {
  interface Window {
    trace: TraceFunction;
  }
}

(function (window: Window & typeof globalThis, document: Document) {
  const ANON_KEY = '_trace_aid';
  const SESSION_KEY = '_trace_sid';

  let _apiKey = '';
  let _endpoint = '';
  let _initialized = false;

  function uid(): string {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }

  function anonId(): string {
    try {
      let id = localStorage.getItem(ANON_KEY);
      if (!id) {
        id = uid();
        localStorage.setItem(ANON_KEY, id);
      }
      return id;
    } catch {
      return uid();
    }
  }

  function sessionId(): string {
    try {
      let id = sessionStorage.getItem(SESSION_KEY);
      if (!id) {
        id = uid();
        sessionStorage.setItem(SESSION_KEY, id);
      }
      return id;
    } catch {
      return uid();
    }
  }

  function send(eventName: string, props?: Record<string, unknown>): void {
    if (!_apiKey || !_endpoint) return;

    const payload = JSON.stringify({
      api_key: _apiKey,
      event: eventName,
      url: window.location.href,
      referrer: document.referrer || undefined,
      anonymous_id: anonId(),
      session_id: sessionId(),
      properties: props || {},
      timestamp: new Date().toISOString(),
    });

    // text/plain avoids CORS preflight with sendBeacon
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        _endpoint + '/collect',
        new Blob([payload], { type: 'text/plain' })
      );
    } else {
      fetch(_endpoint + '/collect', {
        method: 'POST',
        body: payload,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(function () {});
    }
  }

  function trackPageView(): void {
    send('page_view', {
      title: document.title,
      path: window.location.pathname,
      search: window.location.search || undefined,
    });
  }

  function initClickTracking(): void {
    document.addEventListener(
      'click',
      function (e) {
        const target = e.target as HTMLElement;
        const el = target.closest('button, a, [data-track]') as HTMLElement | null;
        if (!el) return;
        send('click', {
          element: el.tagName.toLowerCase(),
          text: (el.textContent || '').trim().slice(0, 100) || undefined,
          href: (el as HTMLAnchorElement).href || undefined,
          id: el.id || undefined,
          label:
            el.getAttribute('aria-label') ||
            el.getAttribute('data-track') ||
            undefined,
        });
      },
      { passive: true }
    );
  }

  function initSPATracking(): void {
    const origPush = history.pushState.bind(history);
    history.pushState = function (...args: Parameters<typeof history.pushState>) {
      origPush(...args);
      trackPageView();
    };
    window.addEventListener('popstate', trackPageView);
  }

  function init(apiKey: string, config: TraceConfig = {}): void {
    if (_initialized) return;
    _initialized = true;
    _apiKey = apiKey;
    _endpoint = (config.endpoint || '').replace(/\/$/, '');

    initClickTracking();
    initSPATracking();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', trackPageView);
    } else {
      trackPageView();
    }
  }

  const queue: QueueItem[] = (window.trace && window.trace.q) || [];

  const trace: TraceFunction = function (method: TraceMethod, ...args: unknown[]) {
    if (method === 'init') {
      init(args[0] as string, args[1] as TraceConfig);
    } else if (method === 'event') {
      send(args[0] as string, args[1] as Record<string, unknown>);
    } else if (method === 'identify') {
      send('identify', { user_id: args[0], ...((args[1] as object) || {}) });
    }
  };

  window.trace = trace;

  // Replay calls queued before this script loaded
  queue.forEach(function (call) {
    trace(call[0], ...call.slice(1));
  });
})(window, document);
