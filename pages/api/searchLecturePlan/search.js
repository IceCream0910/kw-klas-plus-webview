
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { token, year, hakgi, name, professor, gwamok, hakgwa, major, isMy } = req.body;
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
                "selectYear": year,
                "selecthakgi": hakgi,
                "selectRadio": isMy ? "my" : "all",
                "selectText": name,
                "selectProfsr": professor,
                "cmmnGamok": gwamok,
                "selecthakgwa": hakgwa,
                "selectMajor": major
            }),
        };

        const response = await fetch('https://klas.kw.ac.kr/std/cps/atnlc/LectrePlanStdList.do', options);
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