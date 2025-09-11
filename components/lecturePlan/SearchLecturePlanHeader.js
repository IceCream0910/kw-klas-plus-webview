import Spacer from '../common/spacer';

/**
 * 강의계획서 검색 페이지 헤더 컴포넌트
 * @returns {JSX.Element}
 */
const SearchLecturePlanHeader = () => {
    const handleKLASOpen = () => {
        if (typeof window !== 'undefined' && window.Android) {
            window.Android.openPage("https://klas.kw.ac.kr/std/cps/atnlc/LectrePlanStdPage.do");
        }
    };

    return (
        <>
            <Spacer y={5} />
            <h2>
                강의계획서 조회
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
            <Spacer y={30} />
        </>
    );
};

export default SearchLecturePlanHeader;
