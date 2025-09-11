/**
 * 성적 관련 유틸리티 함수들
 */

/**
 * 차트 데이터 생성
 */
export const generateChartData = (synthesisGPAs, isDarkMode = false) => {
    const chartData = synthesisGPAs
        .slice(0, -1)
        .filter((value) => !value.name.includes('계절학기'));

    return {
        labels: chartData.map((value) => value.name),
        datasets: [
            {
                label: '전공 평점',
                data: chartData.map((value) => value.majorGPA.includeF),
                borderColor: '#e74c3c',
                borderWidth: 1,
                fill: false,
                tension: 0,
                pointBackgroundColor: isDarkMode ? '#2c3e50' : 'white',
                pointRadius: 5,
            },
            {
                label: '전공 외 평점',
                data: chartData.map((value) => value.nonMajorGPA.includeF),
                borderColor: '#2980b9',
                borderWidth: 1,
                fill: false,
                tension: 0,
                pointBackgroundColor: isDarkMode ? '#2c3e50' : 'white',
                pointRadius: 5,
            },
            {
                label: '평균 평점',
                data: chartData.map((value) => value.averageGPA.includeF),
                borderColor: '#bdc3c7',
                borderWidth: 2,
                fill: false,
                tension: 0,
                pointBackgroundColor: isDarkMode ? '#2c3e50' : 'white',
                pointRadius: 5,
            },
        ],
    };
};

/**
 * 다크 모드 확인
 */
export const isDarkModePreferred = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};
