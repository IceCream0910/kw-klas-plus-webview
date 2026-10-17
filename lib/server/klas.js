import { klasUrl, klasPath, KlasApiError } from '../klas/contract';
export async function fetchKlas(value, options = {}, { api = true } = {}) {
    const url = klasUrl(value);
    if (api) klasPath(value);
    const response = await fetch(url.href, { ...options, redirect: 'manual' });
    if (response.status >= 300 && response.status < 400) {
        await response.body?.cancel();
        throw new KlasApiError('AUTH_ACTION_REQUIRED', response.status);
    }
    return response;
}
export async function serverKLAS(url, token, body, { signal } = {}) {
    klasPath(url);
    if (typeof token !== 'string' || !token || token.length > 8192 || /[;\r\n]/.test(token)) throw new KlasApiError('SESSION_REQUIRED', 401);
    const response = await fetchKlas(url, {
        method: 'POST', signal,
        headers: { 'Content-Type': 'application/json;charset=UTF-8', Accept: 'application/json, text/plain, */*', Cookie: `SESSION=${token};` },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (!response.ok) throw new KlasApiError('HTTP_FAILURE', response.status);
    if (!response.headers.get('content-type')?.includes('application/json')) throw new KlasApiError('AUTH_ACTION_REQUIRED', 401);
    return response.json();
}
