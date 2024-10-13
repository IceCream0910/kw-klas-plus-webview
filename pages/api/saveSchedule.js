
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const body = req.body;
    const { token } = body;
    if (!body || !token) {
        return res.status(401).json({ error: 'Missing required values' });
    }
    delete body.token;

    try {
        const options = {
            method: 'POST',
            headers: {
                Accept: 'application/json, text/html, */*',
                Cookie: `SESSION=${token};`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        };

        const response = await fetch('https://klas.kw.ac.kr/std/ads/admst/MySchdulSave.do', options);
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