export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { token, subj } = req.body;
    if (!token || !subj) {
        return res.status(401).json({ error: 'Token and selectSubj are required' });
    }

    try {
        const baseOptions = {
            method: 'POST',
            headers: {
                'Cookie': `SESSION=${token};`,
                'Content-Type': 'application/json;charset=UTF-8',
            },
            body: `{"selectSubj":"${subj}"}`,
        };

        const endpoints = [
            'LectrePlanData.do',
            'LectreTimeInfo.do',
            'LectreAstnt.do',
            'LectreTeam.do',
            'LectreEnginerGwamok.do',
            'LectrePlanInputTabFourgrid.do',
            'LectreBeforeGwamok.do',
            'LectrePlanInputTabSixInfo.do',
            'popup/LectrePlanStdCrtNum.do'
        ];

        const requests = endpoints.map(endpoint => {
            const url = `https://klas.kw.ac.kr/std/cps/atnlc/${endpoint}`;
            return fetch(url, baseOptions)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to fetch ${endpoint}: ${response.status}`);
                    }
                    return response.json();
                })
                .catch(error => {
                    console.error(`Error fetching ${endpoint}:`, error);
                    return null;
                });
        });

        const results = await Promise.all(requests);

        const combinedData = {
            lecturePlan: results[0],
            lectureTime: results[1],
            lectureAssistant: results[2],
            lectureTeam: results[3],
            lectureEngineerCourse: results[4],
            lecturePlanTab4: results[5],
            lecturePrerequisite: results[6],
            lecturePlanTab6: results[7],
            lectureStdCrtNum: results[8]
        };

        Object.keys(combinedData).forEach(key => {
            if (combinedData[key] === null) {
                delete combinedData[key];
            }
        });

        return res.status(200).json({
            success: true,
            data: combinedData
        });

    } catch (error) {
        console.error('Error in lecture plan API:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
}