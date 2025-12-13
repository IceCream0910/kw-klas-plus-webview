
import { useState, useEffect } from 'react';

const SettingsInfoSection = ({ appVersion = 'n/a' }) => {
    const [cfRay, setCfRay] = useState('loading...');
    const [cfPlacement, setCfPlacement] = useState('loading...');

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
                className="unclikable"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                disabled
            >
                <span style={{ fontSize: '16px' }}>앱 버전</span>
                <span style={{ opacity: .8, fontSize: '14px' }}>v{appVersion}</span>
            </button>

            <button
                className="unclikable"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                disabled
            >
                <span style={{ fontSize: '16px' }}>Ray ID</span>
                <span style={{ opacity: .8, fontSize: '14px' }}>{cfRay}</span>
            </button>

            <button
                className="unclikable"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                disabled
            >
                <span style={{ fontSize: '16px' }}>Region</span>
                <span style={{ opacity: .8, fontSize: '14px' }}>{cfPlacement}</span>
            </button>
        </>
    );
};

export default SettingsInfoSection;
