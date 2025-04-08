import { parse } from 'node-html-parser';

export default async function handler(req, res) {
    const srCategoryId = req.query.srCategoryId || "";

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const data = await getKWNoticeList(srCategoryId);
        if (!data) {
            return res.status(500).json({ error: 'Failed to fetch data' });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}


async function getKWNoticeList(srCategoryId) {
    try {
        const response = await fetch('https://www.kw.ac.kr/ko/life/notice.jsp?srCategoryId=' + srCategoryId);
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

                return {
                    number: parseInt(number),
                    category,
                    title,
                    link: link ? `https://www.kw.ac.kr${link}` : null,
                    hasAttachment,
                    views: views ? parseInt(views.replace('조회수 ', '')) : null,
                    createdDate: createdDate ? createdDate.replace('작성일 ', '') : null,
                    modifiedDate: modifiedDate ? modifiedDate.replace('수정일 ', '') : null,
                    author
                };
            });
            return noticeList;
        } else {
            return [];
        }
    } catch (error) {
        console.error('에러 발생:', error.message);
        return [];
    }
}