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
            // Get days and dates from the header
            const headers = table.querySelectorAll('thead th');
            const days = [];

            headers.forEach((header, index) => {
                if (index === 0) return; // Skip the first header (구분)

                const day = header.querySelector('.nowDay')?.text.trim();
                const date = header.querySelector('.nowDate')?.text.trim();
                days.push({ day, date });
            });

            // Process each restaurant row
            const menuRows = table.querySelectorAll('tbody tr');
            const restaurants = [];

            menuRows.forEach(row => {
                const restaurantInfo = row.querySelector('td');
                const restaurantName = restaurantInfo.querySelector('.dietTitle')?.text.trim();
                const price = restaurantInfo.querySelector('.dietPrice')?.text.trim();
                const time = restaurantInfo.querySelector('.dietTime')?.text.trim();

                const weeklyMenu = [];

                // Get menu for each day
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
                    name: restaurantName,
                    price,
                    time,
                    weeklyMenu
                });
            });

            return {
                restaurants,
                weeklyMenu: restaurants[0]?.weeklyMenu || [] // Keep backward compatibility
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