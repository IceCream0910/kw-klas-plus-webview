import { parse } from 'node-html-parser';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const data = await getHaksik();
        if (!data) {
            return res.status(500).json({ error: 'Failed to fetch data' });
        }

        return res.status(200).json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getHaksik() {
    try {
        const response = await fetch('https://www.kw.ac.kr/ko/life/facility11.jsp');
        const html = await response.text();

        const root = parse(html);
        const table = root.querySelector('table.tbl-list');

        if (table) {
            const headers = table.querySelectorAll('thead th');
            const menuRow = table.querySelector('tbody tr');

            const weeklyMenu = [];

            headers.forEach((header, index) => {
                if (index === 0) return; // 첫 번째 열은 "구분"이므로 건너뜁니다.

                const day = header.querySelector('.nowDay')?.text.trim();
                const date = header.querySelector('.nowDate')?.text.trim();
                const menu = menuRow.querySelectorAll('td')[index].querySelector('pre')?.text.trim();

                weeklyMenu.push({
                    day,
                    date,
                    menu
                });
            });

            // 식당 정보 추출
            const restaurantInfo = menuRow.querySelector('td');
            const restaurantName = restaurantInfo.querySelector('.dietTitle')?.text.trim();
            const price = restaurantInfo.querySelector('.dietPrice')?.text.trim();
            const time = restaurantInfo.querySelector('.dietTime')?.text.trim();

            return {
                weeklyMenu
            };
        } else {
            console.log('식단표를 찾을 수 없습니다.');
            return null;
        }
    } catch (error) {
        console.error('에러 발생:', error.message);
        return null;
    }
}