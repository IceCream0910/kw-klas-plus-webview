import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Spacer from './spacer';

const AppVersion = ({ updater }) => {
    const [version, setVersion] = useState("");
    const [isLatest, setIsLatest] = useState(true);

    useEffect(() => {
        const userAgent = navigator.userAgent;
        const version = userAgent.split('AndroidApp_v')[1];
        if (version) {
            setVersion(version.trim());
        } else {
            setVersion("알 수 없음");
        }
    }, []);

    useEffect(() => {
        if (version.includes('.') && version < process.env.NEXT_PUBLIC_ANDROID_LATEST_VERSION) {
            setIsLatest(false);
        }
    }, [version]);

    return (
        <>
            <Toaster
                position="top-center"
            />
            {updater ?
                <>
                    {version != process.env.NEXT_PUBLIC_ANDROID_LATEST_VERSION ? <>
                        <div className="card" style={{ padding: '15px 15px 0px 15px', marginBottom: '40px', borderRadius: '15px' }} onClick={() => {
                            try {
                                Android.openExternalPage("https://play.google.com/store/apps/details?id=com.icecream.kwklasplus")
                            } catch (e) {
                                toast('Play 스토어에서 업데이트 해주세요.');
                            }
                        }}>
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignContent: 'center' }}>
                                <b style={{ fontSize: '14px' }}>새로운 앱 업데이트가 있어요!</b>
                                <div style={{ position: 'relative', top: '-8px', right: '-5px' }}>
                                    <button style={{ width: 'fit-content', background: 'var(--background)', fontSize: '11px', padding: '8px 10px' }}
                                    >업데이트</button>
                                </div>
                            </div>
                        </div>
                    </>
                        : <Spacer y={20} />}
                </>
                :
                <div style={{ display: 'flex', justifyContent: 'center', alignContent: 'center', width: '100%', fontSize: '13px', opacity: .5 }} >
                    {
                        version == process.env.NEXT_PUBLIC_ANDROID_LATEST_VERSION ?
                            "앱이 최신 버전입니다. " : "앱이 최신 버전이 아닙니다. "
                    }
                    (v{version})
                </div>}
        </>


    );
};

export default AppVersion;