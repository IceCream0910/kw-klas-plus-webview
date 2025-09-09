/**
 * 건물명을 정규화하는 함수
 * @param input - 건물명이 포함된 문자열 (예: "비401")
 * @returns 정규화된 건물명으로 치환된 문자열 (예: "비마401")
 */
export function normalizeBuildingName(input: string): string {
    const buildingMap: Record<string, string> = {
        '누': '누리',
        '문': '문화',
        '한': '한울',
        '연': '연구',
        '옥': '옥의',
        '비': '비마',
        '참': '참빛',
        '새': '새빛',
        '화': '화도',
        '기': '기념'
    };

    const match = input.match(/^([가-힣]+)(\d+.*)?$/);

    if (!match) {
        return input;
    }

    const [, buildingName, roomNumber = ''] = match;

    if (buildingName.length >= 2) {
        return input;
    }

    const normalizedBuildingName = buildingMap[buildingName];

    if (normalizedBuildingName) {
        return normalizedBuildingName + roomNumber;
    }

    return input;
}