import React, { useState, useEffect } from 'react';

const LoadingComponent = () => {
    const [loadingText, setLoadingText] = useState("생각 중");
    const loadingTexts = ["생각 중", "정보 검색 중", "결과 분석 중", "답변 생성 중"];
    let index = 0;

    useEffect(() => {
        const intervalId = setInterval(() => {
            setLoadingText(loadingTexts[index]);
            index = (index + 1) % loadingTexts.length;
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="message loading">
            <div className="spinner"></div>
            {loadingText}
        </div>
    );
};

export default LoadingComponent;