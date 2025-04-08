import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const status = req.query.status as string || 'ok';
    if (status === 'fail') {
        fetch('https://uptime.betterstack.com/api/v1/heartbeat/miM4s314U6pFpoLK3DRo2gVL/fail')
    } else {
        fetch('https://uptime.betterstack.com/api/v1/heartbeat/miM4s314U6pFpoLK3DRo2gVL')
    }
    res.status(200).send(status)
}
