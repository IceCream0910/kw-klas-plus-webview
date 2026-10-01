import { NextApiRequest, NextApiResponse } from 'next';
import { fetchUniversity, universityUrl } from '../../lib/server/universityFetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }
    if (!req.body || !req.body.url) {
        return res.status(400).json({ error: 'Missing URL in request body' });
    }

    const { url, method = 'POST', headers = {}, body } = req.body;
    let target: URL;
    const upstreamHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
    try {
        target = universityUrl(url, 'klas');
        if (method !== 'POST' || !headers || typeof headers !== 'object' || Array.isArray(headers)) {
            throw new Error('Unsupported proxy request');
        }
        for (const [name, value] of Object.entries(headers)) {
            const key = name.toLowerCase();
            if (!['accept', 'cookie', 'content-type'].includes(key) || typeof value !== 'string' || /[\r\n]/.test(value)) {
                throw new Error('Unsupported upstream header');
            }
            if (key !== 'content-type') upstreamHeaders[key] = value;
        }
    } catch {
        return res.status(400).json({ error: 'Invalid university proxy request' });
    }

    try {
        const response = await fetchUniversity(target, {
            method,
            headers: upstreamHeaders,
            body: JSON.stringify(body),
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
