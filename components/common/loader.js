import React, { useState, useEffect } from 'react';

const LoadingComponent = ({ texts }) => {
    const defaultTexts = ["생각 중", "필요한 정보 수집 중", "답변 생성 중"];
    const loadingTexts = texts || defaultTexts;
    const [loadingText, setLoadingText] = useState(loadingTexts[0]);
    let index = 0;

    useEffect(() => {
        const intervalId = setInterval(() => {
            setLoadingText(loadingTexts[index]);
            index = (index + 1) % loadingTexts.length;
        }, 3000);

        return () => clearInterval(intervalId);
    }, [loadingTexts]);

    return (
        <div className="loading" style={{ display: 'flex', flexDirection: "row", gap: '10px' }}>
            <div className="spinner"></div>
            <span className='shimmering'>{loadingText}</span>
        </div>
    );
};

export default LoadingComponent;
