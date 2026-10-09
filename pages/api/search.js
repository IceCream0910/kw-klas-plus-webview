import { fetchUniversity, universityUrl } from '../../lib/server/universityFetch';
import { BOARD_PATHS, boardItems, schoolItems, SearchRequestError } from '../../lib/search/coordinator';
import { getKWNoticeList } from './crawler/kwNotice';

export const config = { api: { bodyParser: { sizeLimit: '64kb' } } };

function validate(body) {
    if (!body || typeof body.keyword !== 'string' || body.keyword.length > 200 ||
        typeof body.term !== 'string' || body.term.length > 32 || !Array.isArray(body.sources) || body.sources.length < 1 || body.sources.length > 61 ||
        (body.token !== undefined && (typeof body.token !== 'string' || body.token.length > 8192 || /[;\r\n]/.test(body.token)))) throw new Error();
    const ids = new Set();
    return body.sources.map(source => {
        if (!source || !['school', 'notice', 'material'].includes(source.kind) || !Number.isInteger(source.page) || source.page < 0 || source.page > 100) throw new Error();
        if (source.kind !== 'school' && (!/^\d{4},[1-4]$/.test(body.term) || typeof source.courseId !== 'string' || !source.courseId || source.courseId.length > 128 ||
            typeof source.courseName !== 'string' || source.courseName.length > 256)) throw new Error();
        const id = source.kind === 'school' ? 'school' : `${source.courseId}/${source.kind}`;
        if (source.id !== id || ids.has(id)) throw new Error();
        ids.add(id);
        return { id, kind: source.kind, page: source.page, courseId: source.courseId, courseName: source.courseName };
    });
}

async function fetchSource(source, body, signal) {
    const controller = new AbortController();
    const abort = () => controller.abort();
    const timer = setTimeout(abort, source.kind === 'school' ? 20000 : 8000);
    signal.addEventListener('abort', abort, { once: true });
    try {
        if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        if (source.kind === 'school') {
            const data = await getKWNoticeList('', body.keyword, source.page, '1', controller.signal);
            return { items: schoolItems(data, body.term), more: data.more };
        }
        if (!body.token) throw new SearchRequestError(401);
        const response = await fetchUniversity(universityUrl(`https://klas.kw.ac.kr/std/lis/sport/${BOARD_PATHS[source.kind]}/BoardStdList.do`, 'klas'), {
            method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'application/json', Accept: 'application/json', Cookie: `SESSION=${body.token};` },
            body: JSON.stringify({ selectYearhakgi: body.term, selectSubj: source.courseId, selectChangeYn: 'Y', searchCondition: 'ALL', searchKeyword: body.keyword,
                currentPage: source.page, pageInit: source.page === 0 }),
        });
        if (!response.ok) throw new SearchRequestError(response.status);
        if (!response.headers.get('content-type')?.includes('application/json')) throw new SearchRequestError(401);
        const data = await response.json();
        return { items: boardItems(data, { courseId: source.courseId, courseName: source.courseName }, source.kind, body.term), more: source.page + 1 < data.page.totalPages };
    } finally { clearTimeout(timer); signal.removeEventListener('abort', abort); }
}

async function fetchWithRetry(source, body, signal) {
    for (let attempt = 0; attempt < 2; attempt++) {
        try { return await fetchSource(source, body, signal); }
        catch (error) {
            if (signal.aborted || error.name === 'AbortError' || error.name === 'TimeoutError' || attempt === 1 ||
                (error.status && error.status < 500 && error.status !== 408)) throw error;
        }
    }
}

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'private, no-store, no-transform');
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ error: 'Method not allowed' }); }
    let sources;
    try { sources = validate(req.body); } catch { return res.status(400).json({ error: 'Invalid search request' }); }
    const controller = new AbortController();
    const disconnect = () => { if (!res.writableEnded) controller.abort(); };
    res.on('close', disconnect);
    res.status(200);
    res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
    res.setHeader('Content-Encoding', 'identity');
    res.setHeader('X-Accel-Buffering', 'no');
    const emit = event => { if (!controller.signal.aborted && !res.writableEnded) res.write(`${JSON.stringify(event)}\n`); };
    emit({ type: 'ready' });
    const queue = [...sources].sort((a, b) => Number(b.kind === 'school') - Number(a.kind === 'school'));
    try {
        await Promise.all(Array.from({ length: Math.min(3, queue.length) }, async () => {
            while (queue.length && !controller.signal.aborted) {
                const source = queue.shift();
                try {
                    const result = await fetchWithRetry(source, req.body, controller.signal);
                    emit({ type: 'result', id: source.id, status: 'success', ...result });
                } catch (error) {
                    if (controller.signal.aborted) break;
                    const status = error.status || (error.name === 'AbortError' || error.name === 'TimeoutError' ? 504 : 502);
                    emit({ type: 'result', id: source.id, status: [401, 403].includes(status) ? 'loginRequired' : 'failed', errorStatus: status });
                }
            }
        }));
        emit({ type: 'done' });
    } finally { res.removeListener('close', disconnect); if (!res.writableEnded && !res.destroyed) res.end(); }
}
