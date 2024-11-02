
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
                Cookie: `SESSION=${token};`,
                'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({
                "stopFlag": ""
            }),
        };

        const response = await fetch('https://klas.kw.ac.kr/std/cps/atnlc/CmmnGamokList.do', options);
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