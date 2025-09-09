const StudyResultItem = ({ reflectPer, studyResultShort, result }) => {
    if (!reflectPer) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 'bold' }}>{studyResultShort}</span>
            <p style={{ opacity: 0.6, fontSize: '15px' }}>
                {result && result.split('\r\n').map((line, i) => (
                    <span key={i}>
                        {line}
                        {i < result.split('\r\n').length - 1 && <br />}
                    </span>
                ))}
            </p>
        </div>
    );
};

export default StudyResultItem;
