import { KLAS } from '../core/klas';
import { BOARD_PATHS, boardItems, schoolItems } from '../search/coordinator';
export async function nativeSearchBatch(body, signal, emit) {
    const queue = [...body.sources];
    await Promise.all(Array.from({ length: Math.min(3, queue.length) }, async () => {
        while (queue.length && !signal.aborted) {
            const source = queue.shift();
            try {
                let result;
                if (source.kind === 'school') {
                    const params = new URLSearchParams({ query: body.keyword, page: String(source.page), srCategoryId: '', searchKey: '1', pageInfo: '1' });
                    const response = await fetch(`/api/crawler/kwNotice?${params}`, { signal, cache: 'no-store' });
                    if (!response.ok) throw Object.assign(new Error('HTTP_FAILURE'), { status: response.status });
                    const data = await response.json();
                    result = { items: schoolItems(data, body.term), more: data.more };
                } else {
                    const path = BOARD_PATHS[source.kind];
                    if (!path) throw new Error('INVALID_SOURCE');
                    const data = await KLAS(`https://klas.kw.ac.kr/std/lis/sport/${path}/BoardStdList.do`, '', {
                        selectYearhakgi: body.term, selectSubj: source.courseId, selectChangeYn: 'Y', searchCondition: 'ALL', searchKeyword: body.keyword,
                        currentPage: source.page, pageInit: source.page === 0,
                    }, { signal });
                    result = { items: boardItems(data, { courseId: source.courseId, courseName: source.courseName }, source.kind, body.term), more: source.page + 1 < data.page.totalPages };
                }
                if (!signal.aborted) emit({ type: 'result', id: source.id, status: 'success', ...result });
            } catch (error) {
                if (!signal.aborted) emit({ type: 'result', id: source.id, status: [401, 403].includes(error.status) || ['SESSION_REQUIRED', 'SESSION_EXPIRED', 'AUTH_ACTION_REQUIRED'].includes(error.code) ? 'loginRequired' : 'failed', errorStatus: error.status || 502 });
            }
        }
    }));
    if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
}
