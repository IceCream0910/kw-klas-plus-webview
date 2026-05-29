export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { token, all = false } = req.body;
    if (!token) {
        return res.status(401).json({ error: 'Token is required' });
    }

    if (all) {
        try {
            const firstOptions = {
                method: 'POST',
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    Cookie: `SESSION=${token};`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    pageInit: true,
                    currentPage: 0,
                    list: [],
                    page: {}
                })
            };

            const firstResponse = await fetch('https://klas.kw.ac.kr/mst/sys/optrn/SelectPushMsgHisList.do', firstOptions);

            if (!firstResponse.ok) {
                return res.status(firstResponse.status).json({ error: 'Failed to fetch data' });
            }

            const firstData = await firstResponse.json();
            let allNotices = [...(firstData.list || [])];
            const totalPages = firstData.page ? firstData.page.totalPages : 1;

            if (totalPages > 1) {
                const pagePromises = [];
                for (let page = 1; page < totalPages; page++) {
                    const options = {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json, text/plain, */*',
                            Cookie: `SESSION=${token};`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            pageInit: false,
                            currentPage: page,
                            list: [],
                            page: {}
                        })
                    };
                    pagePromises.push(
                        fetch('https://klas.kw.ac.kr/mst/sys/optrn/SelectPushMsgHisList.do', options)
                            .then(async (res) => {
                                if (!res.ok) throw new Error(`Failed to fetch page ${page}`);
                                const d = await res.json();
                                return d.list || [];
                            })
                    );
                }
                const results = await Promise.all(pagePromises);
                for (const list of results) {
                    allNotices = [...allNotices, ...list];
                }
            }

            return res.status(200).json({ notices: allNotices });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {

        try {
            const options = {
                method: 'POST',
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    Cookie: `SESSION=${token};`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    pageInit: true,
                    currentPage: 0,
                    list: [],
                    page: {}
                })
            };

            const response = await fetch('https://klas.kw.ac.kr/mst/sys/optrn/SelectPushMsgHisList.do', options);

            if (!response.ok) {
                return res.status(response.status).json({ error: 'Failed to fetch data' });
            }

            const data = await response.json();
            return res.status(200).json({
                notices: data.list,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

}