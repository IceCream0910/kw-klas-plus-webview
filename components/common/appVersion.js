import React, { useSyncExternalStore } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Spacer from '../common/spacer';

const emptySubscribe = () => () => {};

const getClientSnapshot = () => {
    if (typeof window === 'undefined') return "";
    const userAgent = navigator.userAgent;
    const versionMatch = userAgent.split('AndroidApp_v')[1];
    return versionMatch ? versionMatch.trim() : "알 수 없음";
};

const getServerSnapshot = () => "";

const handleUpdateClick = () => {
    try {
        Android.openExternalPage("https://play.google.com/store/apps/details?id=com.icecream.kwklasplus")
    } catch (e) {
        toast('Play 스토어에서 업데이트 해주세요.');
    }
};

const AppVersion = ({ updater }) => {
    const version = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

    return (
        <>
            <Toaster
                position="top-center"
            />
            {updater ?
                <>
                    {process.env.NEXT_PUBLIC_DEVELOPMENT != 'true' && version != process.env.NEXT_PUBLIC_ANDROID_LATEST_VERSION ? <>
                        <Spacer y={20} /> <button
                            type="button"
                            className="card"
                            style={{
                                display: 'block',
                                width: '100%',
                                textAlign: 'left',
                                font: 'inherit',
                                background: 'none',
                                border: 'none',
                                padding: '15px 15px 0px 15px',
                                borderRadius: '15px',
                                cursor: 'pointer'
                            }}
                            onClick={handleUpdateClick}
                        >
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignContent: 'center' }}>
                                <b style={{ fontSize: '14px' }}>새로운 앱 업데이트가 있어요!</b>
                                <div style={{ position: 'relative', top: '-8px', right: '-5px' }}>
                                    <span
                                        style={{
                                            display: 'inline-block',
                                            width: 'fit-content',
                                            background: 'var(--background)',
                                            fontSize: '12px',
                                            padding: '8px 10px',
                                            borderRadius: '8px',
                                            color: 'var(--text-color)',
                                            border: '1px solid var(--card-background)'
                                        }}
                                    >업데이트</span>
                                </div>
                            </div>
                        </button>
                    </>
                        : <Spacer y={10} />}
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
