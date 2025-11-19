import { parse } from 'node-html-parser';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const data = await getAcademicSchedule();
        if (!data) {
            return res.status(500).json({ error: 'Failed to fetch data' });
        }
        return res.status(200).json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

async function getAcademicSchedule() {
    try {
        const response = await fetch('https://www.kw.ac.kr/KWBoard/list5_detail.jsp');
        const html = await response.text();
        const root = parse(html);

        const yearTitle = root.querySelector('.schedule-title h3');
        const year = yearTitle?.text?.match(/\d{4}/)?.[0] || '';

        const monthBoxes = root.querySelectorAll('.month_box');
        const schedule = [];

        monthBoxes.forEach(monthBox => {
            const month = monthBox.querySelector('.month span')?.text.trim() ?? '';

            const items = [];
            const lis = monthBox.querySelectorAll('.list ul li');
            lis.forEach(li => {
                const dateText = li.querySelector('strong')?.text.trim() ?? '';
                const eventText = li.querySelector('p')?.text.trim() ?? '';
                items.push({
                    date: dateText,
                    event: eventText
                });
            });

            schedule.push({
                month,
                items
            });
        });

        return {
            year,
            schedule: schedule.shift() && schedule
        };
    } catch (error) {
        console.error('에러 발생:', error.message);
        return null;
    }
}
