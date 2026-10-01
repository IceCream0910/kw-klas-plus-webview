const PAGE_HOSTS = new Set(['kw.ac.kr', 'www.kw.ac.kr', 'klas.kw.ac.kr']);

export function universityUrl(value: unknown, purpose: 'klas' | 'page'): URL {
    if (typeof value !== 'string') throw new Error('A URL string is required');
    const url = new URL(value);
    const allowed = purpose === 'klas' ? url.hostname === 'klas.kw.ac.kr' : PAGE_HOSTS.has(url.hostname);
    if (url.protocol !== 'https:' || !allowed || url.port || url.username || url.password) {
        throw new Error('Only approved university HTTPS URLs are allowed');
    }
    return url;
}

// Never follow a university redirect into a different network boundary.
export async function fetchUniversity(url: URL, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(url.href, { ...options, redirect: 'manual' });
    if (response.status >= 300 && response.status < 400) {
        await response.body?.cancel();
        throw new Error('Upstream redirects are not allowed');
    }
    return response;
}
