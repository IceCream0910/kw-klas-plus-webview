export const KLAS_ORIGIN = 'https://klas.kw.ac.kr';
export function klasUrl(value) {
    if (typeof value !== 'string' || value.length > 8192 || /[\\\x00-\x20\x7f]/.test(value)) throw new Error('INVALID_ENDPOINT');
    const rawPath = value.startsWith(`${KLAS_ORIGIN}/`) ? value.slice(KLAS_ORIGIN.length).split('?')[0] : '';
    if (!rawPath || rawPath.startsWith('//') || rawPath.includes('%') || rawPath.split('/').some(part => part === '.' || part === '..')) throw new Error('INVALID_ENDPOINT');
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'klas.kw.ac.kr' || url.port || url.username || url.password || value.includes('#')) throw new Error('INVALID_ENDPOINT');
    return url;
}
export function klasPath(value) {
    const url = klasUrl(value);
    return url.pathname + url.search;
}
export function isKlasMutation(path) {
    return !path.startsWith('page:');
}
export class KlasApiError extends Error {
    constructor(code, status) { super(code === 'OUTCOME_UNKNOWN' ? '처리 결과를 확인할 수 없습니다. 목록을 조회해 반영 여부를 확인하고 같은 변경을 자동으로 다시 실행하지 마세요.' : code); this.name = 'KlasApiError'; this.code = code; this.status = status; }
}
