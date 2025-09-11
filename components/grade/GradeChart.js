import { Bar } from 'react-chartjs-2';

const GradeChart = ({ data, type = 'grade' }) => {
    const gradeDatasets = [
        {
            data: [data.attendBiyul || 0],
            backgroundColor: '#FF6B6B',
            label: '출석',
            barThickness: 15
        },
        {
            data: [data.middleBiyul || 0],
            backgroundColor: '#4DABF7',
            label: '중간고사',
            barThickness: 15
        },
        {
            data: [data.lastBiyul || 0],
            backgroundColor: '#FFA94D',
            label: '기말고사',
            barThickness: 15
        },
        {
            data: [data.reportBiyul || 0],
            backgroundColor: '#69DB7C',
            label: '과제보고서',
            barThickness: 15
        },
        {
            data: [data.learnBiyul || 0],
            backgroundColor: '#9775FA',
            label: '수업태도',
            barThickness: 15
        },
        {
            data: [data.quizBiyul || 0],
            backgroundColor: '#F783AC',
            label: '퀴즈',
            barThickness: 15
        },
        {
            data: [data.gitaBiyul || 0],
            backgroundColor: '#3BC9DB',
            label: '기타',
            barThickness: 15
        }
    ];

    const vlDatasets = [
        {
            data: [data.pa1 || 0],
            backgroundColor: '#FF6B6B',
            label: '지적탐구',
            barThickness: 15
        },
        {
            data: [data.pa2 || 0],
            backgroundColor: '#4DABF7',
            label: '글로벌리더십',
            barThickness: 15
        },
        {
            data: [data.pa3 || 0],
            backgroundColor: '#FFA94D',
            label: '자기관리 및 개발',
            barThickness: 15
        },
        {
            data: [data.pa5 || 0],
            backgroundColor: '#69DB7C',
            label: '창의융합',
            barThickness: 15
        },
        {
            data: [data.pa6 || 0],
            backgroundColor: '#9775FA',
            label: '공존·공감',
            barThickness: 15
        },
        {
            data: [data.pa7 || 0],
            backgroundColor: '#F783AC',
            label: '미래도전지향',
            barThickness: 15
        }
    ];

    const chartData = {
        labels: [type === 'grade' ? '반영 비율' : 'VL역량'],
        datasets: type === 'grade' ? gradeDatasets : vlDatasets
    };

    const options = {
        indexAxis: 'y',
        plugins: {
            legend: {
                display: false,
                position: 'right'
            },
            datalabels: {
                display: true,
                color: '#000',
                anchor: 'end',
                align: 'start',
                formatter: (value, context) => context.dataset.label
            }
        },
        scales: {
            x: {
                display: false,
                stacked: true,
                max: 100,
                grid: { display: false }
            },
            y: {
                display: false,
                stacked: true,
                grid: { display: false }
            }
        },
        maintainAspectRatio: false
    };

    return (
        <div style={{ position: 'relative', height: '50px' }}>
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default GradeChart;
