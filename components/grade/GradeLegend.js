const GradeLegend = ({ data, type = 'grade' }) => {
    const gradeItems = [
        { key: 'attendBiyul', label: '출석', color: '#FF6B6B' },
        { key: 'middleBiyul', label: '중간고사', color: '#4DABF7' },
        { key: 'lastBiyul', label: '기말고사', color: '#FFA94D' },
        { key: 'reportBiyul', label: '과제보고서', color: '#69DB7C' },
        { key: 'learnBiyul', label: '수업태도', color: '#9775FA' },
        { key: 'quizBiyul', label: '퀴즈', color: '#F783AC' },
        { key: 'gitaBiyul', label: '기타', color: '#3BC9DB' }
    ];

    const vlItems = [
        { key: 'pa1', label: '지적탐구', color: '#FF6B6B' },
        { key: 'pa2', label: '글로벌리더십', color: '#4DABF7' },
        { key: 'pa3', label: '자기관리 및 개발', color: '#FFA94D' },
        { key: 'pa5', label: '창의융합', color: '#69DB7C' },
        { key: 'pa6', label: '공존 공감', color: '#9775FA' },
        { key: 'pa7', label: '미래도전지향', color: '#F783AC' }
    ];

    const items = type === 'grade' ? gradeItems : vlItems;

    return (
        <div style={{ fontSize: '14px', lineHeight: '1.2', opacity: type === 'vl' ? 0.7 : 1 }}>
            {items.map((item, index) => {
                const value = data[item.key];
                if (value > 0) {
                    return (
                        <span key={item.key} style={{ color: item.color }}>
                            {index > 0 && items.slice(0, index).some(prevItem => data[prevItem.key] > 0) && '· '}
                            {item.label}: {value}%{' '}
                        </span>
                    );
                }
                return null;
            })}
        </div>
    );
};

export default GradeLegend;
