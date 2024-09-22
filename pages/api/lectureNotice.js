export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { token } = req.body;
    if (!token) {
        return res.status(401).json({ error: 'Token is required' });
    }

    try {
        let allNotices = [];
        let currentPage = 0;
        let hasNextPage = true;

        while (hasNextPage) {
            const options = {
                method: 'POST',
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    Cookie: `SESSION=${token};`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    pageInit: currentPage === 0,
                    currentPage: currentPage,
                    list: [],
                    page: {}
                })
            };

            const response = await fetch('https://klas.kw.ac.kr/mst/sys/optrn/SelectPushMsgHisList.do', options);

            if (!response.ok) {
                return res.status(response.status).json({ error: 'Failed to fetch data' });
            }

            const data = await response.json();
            allNotices = [...allNotices, ...data.list];

            if (currentPage >= data.page.totalPages - 1) {
                hasNextPage = false;
            } else {
                currentPage++;
            }
        }

        return res.status(200).json({ notices: allNotices });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}