import Spacer from '../common/spacer';

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
