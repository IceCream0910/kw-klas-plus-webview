import React, { useState, useEffect } from 'react';

const LoadingComponent = () => {
    const [loadingText, setLoadingText] = useState("질문을 이해하는 중");
    const loadingTexts = ["검색 중", "정보를 찾는 중", "답변 생성 중"];
    let index = 0;

    useEffect(() => {
        const intervalId = setInterval(() => {
            setLoadingText(loadingTexts[index]);
            index = (index + 1) % loadingTexts.length;
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="message loading" style={{ flexDirection: "row" }}>
            <div className="spinner"></div>
            {loadingText}
        </div>
    );
};

export default LoadingComponent;