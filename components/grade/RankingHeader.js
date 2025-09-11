
const RankingHeader = () => {
    const handleKLASOpen = () => {
        if (typeof window !== 'undefined' && window.Android) {
            window.Android.openPage('https://klas.kw.ac.kr/std/cps/inqire/StandStdPage.do');
        }
    };

    return (
        <h2 style={{ marginBottom: '20px', marginTop: '20px' }}>
            석차
            <button
                onClick={handleKLASOpen}
                style={{
                    float: 'right',
                    border: '1px solid var(--card-background)',
                    width: 'fit-content',
                    fontSize: '14px',
                    marginTop: '-5px',
                    borderRadius: '20px',
                    padding: '10px 15px'
                }}
            >
                KLAS에서 열기
            </button>
        </h2>
    );
};

export default RankingHeader;
