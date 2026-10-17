import { serverKLAS } from '../../lib/server/klas';
import { aggregateLectureNotices } from '../../lib/klas/aggregates';
export default async function handler(req, res) {
    res.setHeader('Cache-Control', 'private, no-store');
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!req.body?.token) return res.status(401).json({ error: 'Token is required' });
    try { return res.status(200).json(await aggregateLectureNotices(serverKLAS, req.body.token, req.body.all === true)); }
    catch (error) { return res.status(error.status || 500).json({ error: 'KLAS request failed' }); }
}
