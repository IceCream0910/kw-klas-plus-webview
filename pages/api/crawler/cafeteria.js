import { parse } from 'node-html-parser';

function setCorsHeaders(res) {
    const allowedOrigins = [
        'https://klas-plus-webview.taein.workers.dev',
        'https://klasplus.yuntae.in'
    ];
    
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins.join(','));
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
}

export default async function handler(req, res) {
    // CORS 헤더 설정
    setCorsHeaders(res);
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
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
            const days = [];

            headers.forEach((header, index) => {
                if (index === 0) return;

                const day = header.querySelector('.nowDay')?.text.trim();
                const date = header.querySelector('.nowDate')?.text.trim();
                days.push({ day, date });
            });

            const menuRows = table.querySelectorAll('tbody tr');
            const restaurants = [];

            menuRows.forEach(row => {
                const restaurantInfo = row.querySelector('td');
                const restaurantName = restaurantInfo.querySelector('.dietTitle')?.text.trim();
                const price = restaurantInfo.querySelector('.dietPrice')?.text.trim();
                const time = restaurantInfo.querySelector('.dietTime')?.text.trim();

                const weeklyMenu = [];

                const menuCells = row.querySelectorAll('td');
                for (let i = 1; i < menuCells.length; i++) {
                    const menu = menuCells[i].querySelector('pre')?.text.trim();
                    weeklyMenu.push({
                        day: days[i - 1].day,
                        date: days[i - 1].date,
                        menu
                    });
                }

                restaurants.push({
                    name: restaurantName.replace("광운대 함지마루", "").trim(),
                    price,
                    time,
                    weeklyMenu
                });
            });

            return {
                restaurants,
                weeklyMenu: restaurants[0]?.weeklyMenu || []
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