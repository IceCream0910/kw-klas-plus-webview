
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { token } = req.body;
    if (!token) {
        return res.status(401).json({ error: 'Token is required' });
    }

    try {
        const options = {
            method: 'POST',
            headers: {
                Accept: 'application/json, text/plain, */*',
                Cookie: `SESSION=${token};`,
                'Content-Type': 'application/json'
            },
            body: '{"pageInit":true,"currentPage":-1,"list":[],"page":{}}'
        };

        const response = await fetch('https://klas.kw.ac.kr/mst/sys/optrn/SelectPushMsgHisList.do', options);
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Failed to fetch data' });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}