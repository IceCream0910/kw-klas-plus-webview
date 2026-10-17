import { isNativeFeatureCompatible } from './nativeApp';
import { klasPath, klasUrl, KLAS_PAGE_PATHS, KlasApiError } from '../klas/contract';
import { nativeKlasRequest } from '../klas/nativeTransport';

export async function KLAS(url: string, token: string, body?: unknown, options: { signal?: AbortSignal } = {}): Promise<any> {
    const path = klasPath(url);
    if (isNativeFeatureCompatible('klasApi')) return nativeKlasRequest(path, body, { signal: options.signal });
    if (!token) throw new KlasApiError('SESSION_REQUIRED', 401);
    const response = await fetch('/api/proxy', {
        method: 'POST', signal: options.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, method: 'POST', headers: { Accept: 'application/json, text/plain, */*', Cookie: `SESSION=${token};` }, body }),
    });
    if (!response.ok) throw new KlasApiError('HTTP_FAILURE', response.status);
    return response.json();
}

export async function KLAS_PAGE(url: string, options: { signal?: AbortSignal } = {}): Promise<string> {
    const target = klasUrl(url);
    if (target.search || !KLAS_PAGE_PATHS.has(target.pathname)) throw new KlasApiError('INVALID_ENDPOINT');
    if (!isNativeFeatureCompatible('klasApi')) throw new KlasApiError('NATIVE_API_REQUIRED');
    return nativeKlasRequest(`page:${target.pathname}`, null, { signal: options.signal });
}
