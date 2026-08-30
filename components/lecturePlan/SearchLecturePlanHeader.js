import KlasNativeBridge from '../../lib/core/klasNativeBridge';
import Spacer from '../common/spacer';

const handleKLASOpen = () => {
    if (typeof window !== 'undefined' && KlasNativeBridge) {
        KlasNativeBridge.openPage("https://klas.kw.ac.kr/std/cps/atnlc/LectrePlanStdPage.do");
    }
};

const SearchLecturePlanHeader = () => {
    return (
        <>
            <Spacer y={5} />
            <h2 className="page-heading">
                강의계획서 조회
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
            <Spacer y={30} />
        </>
    );
};

export default SearchLecturePlanHeader;
