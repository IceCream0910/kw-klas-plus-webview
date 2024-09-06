import React, { useState, useEffect } from 'react';

const AppVersion = () => {
    const [version, setVersion] = useState("");

    useEffect(() => {
        const userAgent = navigator.userAgent;
        const version = userAgent.split('AndroidApp_v')[1];
        if (version) {
            setVersion(version);
        } else {
            setVersion("알 수 없음");
        }
    }, []);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignContent: 'center', width: '100%', fontSize: '13px', opacity: .5 }} onClick={() => location.href = 'https://play.google.com/store/apps/details?id=com.icecream.kwklasplus'} >
            {
                version == process.env.NEXT_PUBLIC_ANDROID_LATEST_VERSION ?
                    "앱이 최신 버전입니다. " : "앱이 최신 버전이 아닙니다. "
            }
            (v{version})
        </div>
    );
};

export default AppVersion;