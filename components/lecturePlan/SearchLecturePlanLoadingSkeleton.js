import Spacer from '../common/spacer';

/**
 * 강의계획서 검색 로딩 스켈레톤 컴포넌트
 * @returns {JSX.Element}
 */
const SearchLecturePlanLoadingSkeleton = () => {
    return (
        <>
            <div className="skeleton" style={{ height: '80px', width: '100%' }} />
            <Spacer y={20} />
            <div className="skeleton" style={{ height: '80px', width: '100%' }} />
            <Spacer y={20} />
            <div className="skeleton" style={{ height: '80px', width: '100%' }} />
            <Spacer y={20} />
            <div className="skeleton" style={{ height: '80px', width: '100%' }} />
            <Spacer y={20} />
            <div className="skeleton" style={{ height: '80px', width: '100%' }} />
        </>
    );
};

export default SearchLecturePlanLoadingSkeleton;
