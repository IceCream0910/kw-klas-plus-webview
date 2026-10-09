export const LIMITS = Object.freeze({ bytes: 5 * 1024 * 1024, count: 3000, stale: 86400000, ttl: 7 * 86400000 });
const kinds = new Set(['task', 'teamTask', 'onlineLecture', 'notice', 'material', 'school']);
const learning = new Set(['task', 'teamTask', 'onlineLecture']);
const text = (value, max) => typeof value === 'string' ? value.slice(0, max) : '';
export function normalizeItem(value) {
    if (!value || !kinds.has(value.kind) || !Number.isFinite(value.fetchedAt)) return null;
    const item = { id: text(value.id, 768), kind: value.kind, title: text(value.title, 512),
        courseId: text(value.courseId, 128), courseName: text(value.courseName, 256), term: text(value.term, 32),
        publishedAt: text(value.publishedAt, 40), startsAt: text(value.startsAt, 40), endsAt: text(value.endsAt, 40),
        completionState: ['complete', 'incomplete'].includes(value.completionState) ? value.completionState : 'unknown',
        sourceRef: { sourceId: text(value.sourceRef?.sourceId, 256), boardNo: text(value.sourceRef?.boardNo, 20), masterNo: text(value.sourceRef?.masterNo, 64), url: '' },
        fetchedAt: value.fetchedAt };
    if (item.kind === 'school') {
        try {
            const url = new URL(value.sourceRef?.url);
            if (url.origin !== 'https://www.kw.ac.kr' || url.pathname !== '/ko/life/notice.jsp') return null;
            item.sourceRef.url = url.href.slice(0, 2048);
        } catch { return null; }
    }
    return item.id && item.title ? item : null;
}
export function prune(items, term, now = Date.now()) {
    const candidates = items.map(normalizeItem).filter(item => item && item.term === term &&
        item.fetchedAt <= now + 60000 && now - item.fetchedAt < LIMITS.ttl)
        .sort((a, b) => Number(learning.has(b.kind)) - Number(learning.has(a.kind)) || b.fetchedAt - a.fetchedAt);
    const result = [], seen = new Set();
    let bytes = 1024;
    for (const item of candidates) {
        if (seen.has(item.id)) continue;
        const size = new TextEncoder().encode(JSON.stringify(item)).length + 1;
        if (result.length >= LIMITS.count || bytes + size > LIMITS.bytes) continue;
        seen.add(item.id); bytes += size; result.push(item);
    }
    return result;
}

export class SearchCache {
    constructor({ storage = globalThis.indexedDB, now = Date.now } = {}) {
        this.storage = storage; this.now = now; this.items = []; this.scope = ''; this.term = ''; this.epoch = 0;
        this.writeQueue = Promise.resolve();
    }
    async database() {
        if (!this.storage) throw new Error('unavailable');
        return new Promise((resolve, reject) => {
            const request = this.storage.open('klas-search-v1', 1);
            request.onupgradeneeded = () => request.result.createObjectStore('snapshot');
            request.onerror = () => reject(request.error);
            request.onblocked = () => reject(new Error('blocked'));
            request.onsuccess = () => resolve(request.result);
        });
    }
    setScope(scope, term) {
        if (scope === this.scope && term === this.term) return this.loading || Promise.resolve();
        this.loading = this.loadScope(scope, term);
        return this.loading;
    }
    async loadScope(scope, term) {
        const epoch = ++this.epoch;
        this.scope = scope; this.term = term; this.items = [];
        try {
            const db = await this.database();
            const saved = await new Promise((resolve, reject) => {
                const transaction = db.transaction('snapshot');
                const request = transaction.objectStore('snapshot').get('current');
            request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
                transaction.oncomplete = () => db.close();
            });
            if (epoch !== this.epoch) return;
            if (saved?.schemaVersion === 1 && saved.scope === scope && saved.term === term) this.items = prune(saved.items, term, this.now());
        } catch { /* 저장소를 사용할 수 없어도 메모리 검색은 유지한다. */ }
        if (epoch === this.epoch) await this.persist();
    }
    all() { this.items = prune(this.items, this.term, this.now()); return this.items; }
    merge(items) {
        const incoming = items.map(normalizeItem).filter(Boolean);
        const byId = new Map(this.all().map(item => [item.id, item]));
        for (const item of incoming) if (!byId.has(item.id) || byId.get(item.id).fetchedAt <= item.fetchedAt) byId.set(item.id, item);
        this.items = prune([...byId.values()], this.term, this.now());
        void this.persist();
    }
    replaceBatch(batch, term) {
        if (term !== this.term) return;
        if (batch.status === 'success') this.items = this.items.filter(item => item.kind !== batch.kind || item.courseId !== batch.courseId);
        if (!['success', 'partial'].includes(batch.status)) return;
        this.merge(batch.items.map(item => ({ ...item, kind: batch.kind, term, courseId: batch.courseId,
            courseName: batch.courseName, id: JSON.stringify([term, batch.courseId, batch.kind, item.sourceId]),
            sourceRef: { sourceId: item.sourceId }, fetchedAt: batch.fetchedAt })));
    }
    persist() {
        const epoch = this.epoch;
        this.writeQueue = this.writeQueue.catch(() => {}).then(async () => {
            if (epoch !== this.epoch) return;
            const db = await this.database();
            if (epoch !== this.epoch) { db.close(); return; }
            await new Promise((resolve, reject) => {
                const tx = db.transaction('snapshot', 'readwrite');
                const store = tx.objectStore('snapshot'); store.clear();
                if (this.scope) store.put({ schemaVersion: 1, scope: this.scope, term: this.term, items: this.all() }, 'current');
                tx.oncomplete = () => { db.close(); resolve(); };
                tx.onerror = tx.onabort = () => { db.close(); reject(tx.error); };
            });
        }).catch(() => {});
        return this.writeQueue;
    }
    clear() { ++this.epoch; this.scope = ''; this.term = ''; this.items = []; return this.persist(); }
}
