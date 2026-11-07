export const isDemoSession = () => typeof window !== 'undefined' && window.__klasDemoSession?.version === 1;

if (isDemoSession() && typeof window.fetch === 'function') {
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input, options) => {
        // Do not keep serving fixtures if this document leaves its demo session.
        if (!isDemoSession()) return originalFetch(input, options);
        const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url, window.location.href);
        if (url.origin === window.location.origin && url.pathname.startsWith('/api/')) {
            const endpoints = { '/api/crawler/cafeteria': '/demo/PublicCafeteria.do', '/api/crawler/kwNotice': '/demo/PublicNotices.do' };
            const endpoint = endpoints[url.pathname];
            if (endpoint) {
                return import('../klas/nativeTransport').then(({ nativeKlasRequest }) =>
                    nativeKlasRequest(endpoint, Object.fromEntries(url.searchParams))
                ).then(data => Response.json(data));
            }
            return Promise.resolve(Response.json({ error: 'DEMO_UNSUPPORTED_ENDPOINT' }, { status: 501 }));
        }
        if (url.hostname === 'kw.ac.kr' || url.hostname.endsWith('.kw.ac.kr')) return Promise.reject(new Error('DEMO_NETWORK_BLOCKED'));
        return originalFetch(input, options);
    };
}

// 기존 import 호환을 유지하며 데모 동작은 Native에 위임한다.
export function demoBridgeInvocation() { return null; }
