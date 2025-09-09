import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!req.body || !req.body.url) {
        return res.status(400).json({ error: 'Missing URL in request body' });
    }

    const { url, method = 'POST', headers = {}, body } = req.body;

    try {
        const response = await fetch(url, {
            method,
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
            body: method === 'GET' ? undefined : JSON.stringify(body),
        });

        const contentType = response.headers.get('content-type');
        let data;

        if (contentType?.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (response.status !== 200) {
            console.error('KLAS API error:', data);
        }

        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Proxy request failed' });
    }
}
