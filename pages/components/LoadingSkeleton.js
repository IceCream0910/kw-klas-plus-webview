const LoadingSkeleton = ({ type = 'list' }) => {
    if (type === 'list') {
        return (
            <>
                {Array(6).fill(0).map((_, index) => (
                    <div
                        key={index}
                        className="skeleton"
                        style={{
                            height: '40px',
                            width: '100%',
                            marginBottom: '15px'
                        }}
                    />
                ))}
            </>
        );
    }

    if (type === 'detail') {
        return (
            <>
                <div className="skeleton" style={{ height: '30px', width: '30%', marginBottom: '10px' }} />
                <div className="skeleton" style={{ height: '10px', width: '40%' }} />
                <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                    <div className="skeleton" style={{ height: '200px', width: '100%' }} />
                </div>
                <div className="skeleton" style={{ height: '50px', width: '100%', marginBottom: '15px' }} />
                <div className="skeleton" style={{ height: '50px', width: '100%' }} />
            </>
        );
    }

    return null;
};

export default LoadingSkeleton;
