
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { token, attachId } = req.body;
    if (!token || !attachId) {
        return res.status(401).json({ error: 'Missing required values' });
    }

    try {
        const options = {
            method: 'POST',
            headers: {
                Accept: 'application/json, text/plain, */*',
                Cookie: `SESSION=${token};`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "attachId": attachId,
                "storageId": "CLS_BOARD"
            })
        };

        const response = await fetch(`https://klas.kw.ac.kr/common/file/UploadFileList.do`, options);
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