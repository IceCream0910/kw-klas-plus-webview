import { parse } from 'node-html-parser';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const srCategoryId = req.query.srCategoryId || "";
    const query = req.query.query || "";
    const searchKey = req.query.searchKey ?? '1';
    const page = Number(req.query.page || 0);
    if (typeof query !== 'string' || query.length > 200 || typeof srCategoryId !== 'string' || !/^\d{0,10}$/.test(srCategoryId) || typeof searchKey !== 'string' || !/^[1-4]$/.test(searchKey) || !Number.isInteger(page) || page < 0 || page > 100) {
        return res.status(400).json({ error: 'Invalid search' });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const data = await getKWNoticeList(srCategoryId, query, page, searchKey);
        if (!data) {
            return res.status(500).json({ error: 'Failed to fetch data' });
        }

        res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');
        return res.status(200).json(req.query.pageInfo === '1' ? data : data.items);
    } catch (error) {
        return res.status(error.name === 'TimeoutError' || error.name === 'AbortError' ? 504 : 502).json({ error: 'School notice unavailable' });
    }
}


export async function getKWNoticeList(srCategoryId, query, page, searchKey = '1', signal) {
    try {
        const url = new URL('https://www.kw.ac.kr/ko/life/notice.jsp');
        url.searchParams.set('srCategoryId', srCategoryId);
        url.searchParams.set('tpage', String(page + 1));
        if (query) {
            url.searchParams.set('mode', 'list');
            url.searchParams.set('searchKey', searchKey);
            url.searchParams.set('searchVal', query);
        }
        const response = await fetch(url, {
            signal: signal ?? AbortSignal.timeout(20000),
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        if (!response.ok) throw new Error('upstream_failed');
        const html = await response.text();

        const root = parse(html);
        const boardListBox = root.querySelector('div.board-list-box');

        if (boardListBox) {
            const notices = boardListBox.querySelectorAll('li');
            const noticeList = notices.map(notice => {
                const number = notice.querySelector('span.no')?.text.trim();
                const category = notice.querySelector('strong.category')?.text.trim();
                const linkElement = notice.querySelector('div.board-text a');
                const title = linkElement?.text.replace(category, '').trim();
                const link = linkElement?.getAttribute('href');
                const hasAttachment = notice.querySelector('span.ico-file') !== null;
                const infoText = notice.querySelector('p.info')?.text.trim();
                const [views, createdDate, modifiedDate, author] = infoText ? infoText.split('|').map(item => item.trim()) : [];

                let canonicalLink = null;
                if (link) {
                    const target = new URL(link, 'https://www.kw.ac.kr');
                    const documentId = target.searchParams.get('DUID');
                    if (target.origin === 'https://www.kw.ac.kr' && /^\d+$/.test(documentId || '')) canonicalLink = `https://www.kw.ac.kr/ko/life/notice.jsp?BoardMode=view&DUID=${documentId}`;
                }
                return {
                    number: parseInt(number),
                    category,
                    title,
                    link: canonicalLink,
                    hasAttachment,
                    views: views ? parseInt(views.replace('조회수 ', '')) : null,
                    createdDate: createdDate ? createdDate.replace('작성일 ', '') : null,
                    modifiedDate: modifiedDate ? modifiedDate.replace('수정일 ', '') : null,
                    author
                };
            });
            const more = root.querySelectorAll('.paging a[href]').some(anchor => {
                const target = new URL(anchor.getAttribute('href'), 'https://www.kw.ac.kr');
                return Number(target.searchParams.get('tpage')) > page + 1;
            });
            return { items: noticeList, more };
        } else {
            throw new Error('unexpected_markup');
        }
    } catch (error) {
        throw error;
    }
}
