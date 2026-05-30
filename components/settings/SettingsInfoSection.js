import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const copyToClipboard = (title, value) => {
    if (!value || value === 'loading...' || value === 'error') return;
    navigator.clipboard.writeText(value).then(() => {
        toast(`${title} 값을 복사했어요.`, {
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            },
        });
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        toast('복사에 실패했습니다.');
    });
};

const SettingsInfoSection = ({ appVersion = 'n/a' }) => {
    const [cfRay, setCfRay] = useState('loading...');
    const [cfPlacement, setCfPlacement] = useState('loading...');
    const [rybbitUid, setRybbitUid] = useState(() => {
        if (typeof window !== 'undefined') {
            const uid = localStorage.getItem('rybbit-user-id');
            return uid ? uid.substring(0, 16) + '...' : 'n/a';
        }
        return 'loading...';
    });

    useEffect(() => {
        fetch(window.location.href, { method: 'HEAD' })
            .then(response => {
                const ray = response.headers.get('cf-ray') || 'n/a';
                const placement = response.headers.get('cf-placement') || 'n/a';
                setCfRay(ray);
                setCfPlacement(placement);
            })
            .catch(() => {
                setCfRay('error');
                setCfPlacement('error');
            });
    }, []);

    return (
        <>
            <button
                type="button"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => copyToClipboard('앱 버전', appVersion)}
            >
                <span style={{ fontSize: '16px' }}>앱 버전</span>
                <div>
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            Android.openExternalLink('https://klasplus.yuntae.in');
                        }}
                        style={{
                            opacity: .8,
                            fontSize: '12px',
                            backgroundColor: 'var(--button-background)',
                            width: 'fit-content',
                            height: '24px',
                            padding: '4px 8px',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '15px',
                        }}
                    >
                        업데이트 확인
                    </span>
                    <span style={{ opacity: .8, fontSize: '14px' }}>&nbsp;v{appVersion}</span>
                </div>
            </button>

            <button
                type="button"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => copyToClipboard('Ray ID', cfRay)}
            >
                <span style={{ fontSize: '16px' }}>Ray ID</span>
                <span style={{ opacity: .8, fontSize: '14px' }}>{cfRay}</span>
            </button>

            <button
                type="button"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => copyToClipboard('Region', cfPlacement)}
            >
                <span style={{ fontSize: '16px' }}>Region</span>
                <span style={{ opacity: .8, fontSize: '14px' }}>{cfPlacement}</span>
            </button>

            <button
                type="button"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => {
                    const uid = localStorage.getItem('rybbit-user-id');
                    copyToClipboard('UID', uid || 'n/a');
                }}
            >
                <span style={{ fontSize: '16px' }}>UID</span>
                <span style={{ opacity: .8, fontSize: '14px' }}>{rybbitUid}</span>
            </button>
        </>
    );
};

export default SettingsInfoSection;
