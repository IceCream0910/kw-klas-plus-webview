import KlasNativeBridge from '../../lib/core/klasNativeBridge';

const handleKLASOpen = () => {
    if (typeof window !== 'undefined' && KlasNativeBridge) {
        KlasNativeBridge.openPage('https://klas.kw.ac.kr/std/cps/inqire/StandStdPage.do');
    }
};

const RankingHeader = () => {
    return (
        <h2 className="page-heading" style={{ marginBottom: '20px', marginTop: '20px' }}>
            석차
            <button
                type="button"
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
