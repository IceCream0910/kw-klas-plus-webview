export const BOARD_PATHS = { notice: 'd052b8f845784c639f036b102fdc3023', material: '6972896bfe72408eb72926780e85d041' };
export function boardItems(data, course, kind, term, now = Date.now()) {
    if (!Array.isArray(data?.list) || !Number.isInteger(data?.page?.totalPages)) throw new SearchRequestError(502);
    return data.list.slice(0, 100).filter(row => typeof row.title === 'string' && /^[0-9]{1,20}$/.test(String(row.boardNo)) && /^[0-9A-Za-z_-]{1,64}$/.test(String(row.masterNo))).map(row => ({
        id: JSON.stringify([term, course.courseId, kind, String(row.boardNo), String(row.masterNo)]), kind, term,
        title: row.title.slice(0, 512), courseId: course.courseId, courseName: course.courseName, publishedAt: typeof row.registDt === 'string' ? row.registDt.slice(0, 40) : '',
        sourceRef: { boardNo: String(row.boardNo), masterNo: String(row.masterNo) }, fetchedAt: now,
    }));
}
export class SearchRequestError extends Error {
    constructor(status) { super('search_request_failed'); this.status = status; }
}
export function schoolItems(data, term, now = Date.now()) {
    if (!Array.isArray(data?.items) || typeof data.more !== 'boolean') throw new SearchRequestError(502);
    return data.items.slice(0, 100).filter(row => typeof row.title === 'string' && typeof row.link === 'string' && row.link.length <= 2048).map(row => ({
        id: `school:${row.link}`, kind: 'school', term, title: row.title.slice(0, 512), publishedAt: row.createdDate,
        sourceRef: { url: row.link }, fetchedAt: now,
    }));
}
export async function requestJson(url, options, signal, fetcher = fetch, timeoutMs = 8000) {
    for (let attempt = 0; attempt < 2; attempt++) {
        const controller = new AbortController();
        const abort = () => controller.abort();
        if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        signal.addEventListener('abort', abort, { once: true });
        const timeout = setTimeout(abort, timeoutMs);
        try {
            const response = await fetcher(url, { ...options, signal: controller.signal, cache: 'no-store' });
            if (!response.ok) throw new SearchRequestError(response.status);
            const data = await response.json();
            if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
            return data;
        } catch (error) {
            if (signal.aborted || attempt === 1 || (error.status && error.status < 500 && error.status !== 408)) throw error;
        } finally { clearTimeout(timeout); signal.removeEventListener('abort', abort); }
    }
}
export class SearchCoordinator {
    constructor({ fetcher = (...args) => globalThis.fetch(...args), now = Date.now } = {}) {
        this.fetcher = fetcher; this.now = now; this.generation = 0; this.cache = new Map(); this.pending = new Map();
        this.controller = new AbortController();
    }
    cancel() { this.controller.abort(); this.controller = new AbortController(); ++this.generation; this.pending.clear(); }
    clear() { this.cancel(); this.cache.clear(); }
    async batch({ scope, term, token, keyword, sources, onResult }) {
        const signal = this.controller.signal;
        const fresh = new Map();
        const subscriptions = sources.map(source => {
            const key = source.kind === 'school' ? JSON.stringify([scope, term, keyword, source.page])
                : JSON.stringify([scope, term, source.courseId, source.kind, keyword, source.page]);
            const cached = this.cache.get(key);
            let promise;
            if (cached && this.now() - cached.at < 60000) promise = Promise.resolve(cached.value);
            else if (this.pending.has(key)) promise = this.pending.get(key);
            else {
                let resolve, reject;
                promise = new Promise((accept, fail) => { resolve = accept; reject = fail; });
                this.pending.set(key, promise);
                fresh.set(source.id, { source, key, promise, resolve, reject, settled: false });
            }
            return promise.then(value => {
                if (!signal.aborted) onResult({ id: source.id, status: 'success', ...value });
            }, error => {
                if (!signal.aborted) onResult({ id: source.id, status: [401, 403].includes(error.status) ? 'loginRequired' : 'failed', errorStatus: error.status || 502 });
            });
        });
        if (fresh.size) {
            const body = { term, keyword, sources: [...fresh.values()].map(entry => entry.source) };
            if (body.sources.some(source => source.kind !== 'school')) body.token = token;
            void this.readBatch(body, signal, event => {
                const entry = fresh.get(event.id);
                if (!entry || entry.settled) throw new SearchRequestError(502);
                entry.settled = true;
                if (event.status === 'success' && Array.isArray(event.items) && typeof event.more === 'boolean') {
                    const value = { items: event.items, more: event.more };
                    this.cache.set(entry.key, { at: this.now(), value });
                    while (this.cache.size > 20) this.cache.delete(this.cache.keys().next().value);
                    entry.resolve(value);
                } else entry.reject(new SearchRequestError(event.errorStatus || 502));
            }).catch(error => {
                for (const entry of fresh.values()) if (!entry.settled) { entry.settled = true; entry.reject(error); }
            }).finally(() => {
                for (const entry of fresh.values()) {
                    if (!entry.settled) entry.reject(new SearchRequestError(502));
                    if (this.pending.get(entry.key) === entry.promise) this.pending.delete(entry.key);
                }
            });
        }
        await Promise.allSettled(subscriptions);
    }
    async readBatch(body, signal, onResult) {
        const controller = new AbortController();
        const abort = () => controller.abort();
        signal.addEventListener('abort', abort, { once: true });
        let timeout, reader;
        const keepAlive = () => { clearTimeout(timeout); timeout = setTimeout(abort, 30000); };
        try {
            if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
            keepAlive();
            const response = await this.fetcher('/api/search', { method: 'POST', cache: 'no-store', signal: controller.signal,
                headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson' }, body: JSON.stringify(body) });
            if (!response.ok) throw new SearchRequestError(response.status);
            if (!response.body || !response.headers.get('content-type')?.includes('application/x-ndjson')) throw new SearchRequestError(502);
            reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '', completed = false;
            const line = text => {
                if (!text.trim()) return;
                const event = JSON.parse(text);
                if (event.type === 'result') onResult(event);
                else if (event.type === 'done') completed = true;
                else if (event.type !== 'ready') throw new SearchRequestError(502);
            };
            while (true) {
                const chunk = await reader.read();
                if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
                if (chunk.done) break;
                keepAlive(); buffer += decoder.decode(chunk.value, { stream: true });
                if (buffer.length > 2 * 1024 * 1024) throw new SearchRequestError(502);
                let newline;
                while ((newline = buffer.indexOf('\n')) !== -1) { line(buffer.slice(0, newline)); buffer = buffer.slice(newline + 1); }
            }
            buffer += decoder.decode(); line(buffer);
            if (!completed) throw new SearchRequestError(502);
        } catch (error) {
            if (!signal.aborted && error.name === 'AbortError') throw new SearchRequestError(504);
            throw error;
        } finally {
            clearTimeout(timeout); signal.removeEventListener('abort', abort);
            await reader?.cancel().catch(() => {});
        }
    }
    async sourceRequest({ scope, term, token, keyword, source }) {
        let result;
        const signal = this.controller.signal;
        await this.batch({ scope, term, token, keyword, sources: [source], onResult: response => { result = response; } });
        if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        if (!result || result.status !== 'success') throw new SearchRequestError(result?.errorStatus || 502);
        return { items: result.items, more: result.more };
    }
    board({ scope, term, token, course, kind, keyword, page = 0 }) {
        return this.sourceRequest({ scope, term, token, keyword,
            source: { id: `${course.courseId}/${kind}`, kind, courseId: course.courseId, courseName: course.courseName, page } });
    }
    school({ scope, term, keyword, page = 0 }) {
        return this.sourceRequest({ scope, term, keyword, source: { id: 'school', kind: 'school', page } });
    }
}
