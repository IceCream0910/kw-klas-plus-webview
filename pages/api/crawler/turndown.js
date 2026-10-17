import { officialPageMarkdown } from '../../../lib/klas/pageContent';
import { fetchUniversity, universityUrl } from '../../../lib/server/universityFetch';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        const { url } = req.query;

        if (!url || typeof url !== 'string') {
            return res.status(400).json({ error: 'URL parameter is required' });
        }
        let target;
        try {
            target = universityUrl(url, 'page');
        } catch {
            return res.status(400).json({ error: 'Only approved university HTTPS URLs are allowed' });
        }

        try {
            const response = await fetchUniversity(target, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch URL: ${response.statusText}`);
            }
            const html = await response.text();

            res.status(200).json({ markdown: officialPageMarkdown(html, url) });
        } catch (error) {
            console.error('Error fetching or processing URL:', error);
            res.status(500).json({ error: `Failed to process the URL: ${error.message}` });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
