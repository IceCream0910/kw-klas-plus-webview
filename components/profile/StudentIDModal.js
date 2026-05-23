import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import IonIcon from '@reacticons/ionicons';
import Spacer from '../common/spacer';

const DummyQR = ({ isDarkMode }) => (
    <svg
        width="140"
        height="140"
        viewBox="0 0 21 21"
        fill={isDarkMode ? "#ffffff" : "#222222"}
        style={{
            opacity: isDarkMode ? 0.35 : 0.25,
            transition: 'opacity 0.3s'
        }}
    >
        {/* Top-Left Finder */}
        <rect x="0" y="0" width="7" height="7" rx="0.5" />
        <rect x="1" y="1" width="5" height="5" rx="0.3" fill={isDarkMode ? "#221a1b" : "#ffffff"} />
        <rect x="2" y="2" width="3" height="3" rx="0.2" />

        {/* Top-Right Finder */}
        <rect x="14" y="0" width="7" height="7" rx="0.5" />
        <rect x="15" y="1" width="5" height="5" rx="0.3" fill={isDarkMode ? "#221a1b" : "#ffffff"} />
        <rect x="16" y="2" width="3" height="3" rx="0.2" />

        {/* Bottom-Left Finder */}
        <rect x="0" y="14" width="7" height="7" rx="0.5" />
        <rect x="1" y="15" width="5" height="5" rx="0.3" fill={isDarkMode ? "#221a1b" : "#ffffff"} />
        <rect x="2" y="16" width="3" height="3" rx="0.2" />

        {/* Alignment & Timing patterns (horizontal/vertical lines/dots) */}
        <rect x="8" y="2" width="1" height="1" />
        <rect x="10" y="2" width="1" height="1" />
        <rect x="12" y="2" width="1" height="1" />
        <rect x="8" y="4" width="1" height="1" />
        <rect x="10" y="4" width="1" height="1" />
        <rect x="12" y="4" width="1" height="1" />
        <rect x="8" y="6" width="1" height="1" />
        <rect x="10" y="6" width="1" height="1" />
        <rect x="12" y="6" width="1" height="1" />

        <rect x="2" y="8" width="1" height="1" />
        <rect x="4" y="8" width="1" height="1" />
        <rect x="6" y="8" width="1" height="1" />
        <rect x="8" y="8" width="1" height="1" />
        <rect x="10" y="8" width="1" height="1" />
        <rect x="12" y="8" width="1" height="1" />
        <rect x="14" y="8" width="1" height="1" />
        <rect x="16" y="8" width="1" height="1" />
        <rect x="18" y="8" width="1" height="1" />

        {/* Random data nodes to simulate QR details */}
        <rect x="8" y="0" width="2" height="1" />
        <rect x="11" y="0" width="1" height="2" />
        <rect x="9" y="3" width="1" height="1" />
        <rect x="11" y="3" width="2" height="1" />
        <rect x="8" y="5" width="2" height="1" />

        <rect x="0" y="8" width="1" height="2" />
        <rect x="1" y="9" width="2" height="1" />
        <rect x="3" y="10" width="2" height="1" />
        <rect x="6" y="9" width="1" height="3" />
        <rect x="8" y="10" width="2" height="1" />
        <rect x="9" y="11" width="1" height="2" />
        <rect x="11" y="9" width="2" height="1" />
        <rect x="13" y="10" width="1" height="3" />
        <rect x="15" y="9" width="3" height="1" />
        <rect x="19" y="10" width="2" height="1" />
        <rect x="18" y="11" width="1" height="2" />

        <rect x="8" y="14" width="2" height="2" />
        <rect x="11" y="14" width="1" height="1" />
        <rect x="12" y="15" width="2" height="1" />
        <rect x="10" y="17" width="1" height="2" />
        <rect x="8" y="18" width="2" height="1" />
        <rect x="12" y="18" width="2" height="2" />
        <rect x="15" y="14" width="2" height="1" />
        <rect x="18" y="14" width="1" height="2" />
        <rect x="15" y="16" width="1" height="3" />
        <rect x="17" y="17" width="3" height="1" />
        <rect x="19" y="19" width="2" height="2" />
        <rect x="16" y="19" width="2" height="1" />
    </svg>
);

const StudentIDModal = ({ onClose, data, stdInfo }) => {
    const [isAnimationComplete, setIsAnimationComplete] = useState(false);
    const [showPhoto, setShowPhoto] = useState(true);
    const [activeTab, setActiveTab] = useState('idCard'); // 'library' | 'idCard'
    const [qrValues, setQrValues] = useState({ library: '', idCard: '' });
    const [isQrRequestFailed, setIsQrRequestFailed] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [timeLeft, setTimeLeft] = useState(30);
    const [idCardTimeLeft, setIdCardTimeLeft] = useState(180);
    const [lastRequestTime, setLastRequestTime] = useState(null);
    const [isLegacyVersion, setIsLegacyVersion] = useState(false);

    const triggerQrRequest = useCallback(() => {
        setQrValues({ library: 'pending', idCard: 'pending' });
        setQrDataUrl('');
        try {
            if (typeof window !== 'undefined' && typeof window.Android !== 'undefined' && typeof window.Android.requestIdCardQRValue === 'function') {
                window.Android.requestIdCardQRValue();
                setIsQrRequestFailed(false);
                setLastRequestTime(Date.now());
                setIdCardTimeLeft(180);
            } else {
                setIsQrRequestFailed(true);
            }
        } catch (error) {
            console.error("Failed to request ID card QR value:", error);
            setIsQrRequestFailed(true);
        }
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedPhotoVisibility = localStorage.getItem('idCardShowPhoto');
            if (savedPhotoVisibility !== null) {
                setShowPhoto(JSON.parse(savedPhotoVisibility));
            }

            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            setIsDarkMode(mediaQuery.matches);
            const handler = (e) => setIsDarkMode(e.matches);
            mediaQuery.addEventListener('change', handler);

            const userAgent = navigator.userAgent;
            const versionPart = userAgent.split('AndroidApp_v')[1];
            const appVersion = versionPart ? parseInt(versionPart, 10) : null;
            const isLegacy = !appVersion || appVersion <= 30;
            setIsLegacyVersion(isLegacy);

            window.receiveIdCardQRValue = (libraryQRValue, idCardQRValue) => {
                setQrValues({ library: libraryQRValue || '', idCard: idCardQRValue || '' });
            };

            if (!isLegacy) {
                triggerQrRequest();
            }

            return () => {
                mediaQuery.removeEventListener('change', handler);
                window.receiveIdCardQRValue = undefined;
            };
        }
    }, [triggerQrRequest]);

    useEffect(() => {
        setTimeLeft(30);
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'idCard' && lastRequestTime) {
            const elapsed = Math.floor((Date.now() - lastRequestTime) / 1000);
            setIdCardTimeLeft(Math.max(0, 180 - elapsed));
        }
    }, [activeTab, lastRequestTime]);

    const activeQrValue = activeTab === 'idCard' ? qrValues.idCard : qrValues.library;
    const isBlurred = (activeTab === 'idCard' && isQrRequestFailed) || (activeTab === 'library' && !qrValues.library) || activeQrValue === 'pending';

    useEffect(() => {
        if (isBlurred || !activeQrValue) {
            return;
        }

        const timer = setInterval(() => {
            if (activeTab === 'library') {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        triggerQrRequest();
                        return 30;
                    }
                    return prev - 1;
                });
            } else if (activeTab === 'idCard') {
                if (lastRequestTime) {
                    const elapsed = Math.floor((Date.now() - lastRequestTime) / 1000);
                    const remaining = Math.max(0, 180 - elapsed);
                    setIdCardTimeLeft(remaining);
                    if (remaining <= 0) {
                        triggerQrRequest();
                    }
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [isBlurred, activeQrValue, activeTab, lastRequestTime, triggerQrRequest]);

    const handleRefresh = () => {
        triggerQrRequest();
        setTimeLeft(30);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const togglePhotoVisibility = () => {
        const newShowPhoto = !showPhoto;
        setShowPhoto(newShowPhoto);
        localStorage.setItem('idCardShowPhoto', JSON.stringify(newShowPhoto));
    };

    useEffect(() => {
        if (!isAnimationComplete || !activeQrValue || activeQrValue === 'pending') {
            setQrDataUrl('');
            return;
        }

        // Dynamically import to ensure qrcode library is browser-only and safe from Next.js SSR
        import('qrcode').then((m) => {
            const QRCode = m.default || m;
            if (QRCode && typeof QRCode.toDataURL === 'function') {
                QRCode.toDataURL(activeQrValue, {
                    width: 250,
                    margin: 1,
                    color: {
                        dark: isDarkMode ? '#ffffff' : '#000000',
                        light: isDarkMode ? '#221a1b' : '#ffffff'
                    }
                })
                    .then(url => {
                        setQrDataUrl(url);
                    })
                    .catch(err => {
                        console.error("QR Code generation error:", err);
                    });
            } else {
                console.error("QRCode.toDataURL is not a function", m);
            }
        });
    }, [activeQrValue, isDarkMode, isAnimationComplete]);

    const overlayBg = isDarkMode ? 'rgba(34, 26, 27, 0.93)' : 'rgba(255, 255, 255, 0.93)';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0, 0, 0, 0.7)',
                zIndex: 1100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <motion.div
                layoutId="card"
                onLayoutAnimationComplete={() => setIsAnimationComplete(true)}
                onClick={(e) => e.stopPropagation()}
                className={`modal-card ${isAnimationComplete ? 'modal-card-shadow' : ''}`}
                transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 38,
                    mass: 0.8
                }}
                style={{
                    width: '90%',
                    maxWidth: '340px',
                    background: 'var(--background)',
                    borderRadius: '24px',
                    padding: '24px',
                    boxSizing: 'border-box',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    willChange: 'transform, opacity'
                }}
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isAnimationComplete ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        width: '100%',
                        pointerEvents: isAnimationComplete ? 'auto' : 'none'
                    }}
                >
                    <div className="watermark" />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', zIndex: 1, position: 'relative' }}>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', letterSpacing: '-0.5px' }}>모바일 학생증</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'var(--notice-hover)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    padding: 0
                                }}
                            >
                                <IonIcon name="close-outline" style={{ fontSize: '18px' }} />
                            </button>
                        </div>
                    </div>

                    {data && stdInfo && (
                        <div style={{ zIndex: 2, position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
                                <div style={{ position: 'relative', width: '90px', height: '120px', flexShrink: 0 }}>
                                    <motion.div
                                        onClick={() => {
                                            try {
                                                if (typeof window.Android !== 'undefined') {
                                                    window.Android.openPage('https://klas.kw.ac.kr/std/sys/optrn/MyNumberQrStdPage.do');
                                                } else {
                                                    window.open('https://klas.kw.ac.kr/std/sys/optrn/MyNumberQrStdPage.do', '_blank');
                                                }
                                            } catch (e) {
                                                window.open('https://klas.kw.ac.kr/std/sys/optrn/MyNumberQrStdPage.do', '_blank');
                                            }
                                        }}
                                        animate={{ rotateY: showPhoto ? 0 : 180 }}
                                        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                                        style={{
                                            width: '90px',
                                            height: '120px',
                                            transformStyle: 'preserve-3d',
                                            perspective: '1000px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div
                                            className="rr-block"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                position: 'absolute',
                                                backfaceVisibility: 'hidden',
                                                borderRadius: '12px',
                                                overflow: 'hidden',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                background: '#f0f0f0'
                                            }}
                                        >
                                            <img src={stdInfo.fileUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>

                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            position: 'absolute',
                                            backfaceVisibility: 'hidden',
                                            borderRadius: '12px',
                                            background: 'var(--background)',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            transform: 'rotateY(180deg)',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}>
                                            <IonIcon name="person" style={{ fontSize: '30px', opacity: 0.3 }} />
                                        </div>
                                    </motion.div>

                                    <div
                                        onClick={togglePhotoVisibility}
                                        style={{
                                            position: 'absolute',
                                            bottom: '-6px',
                                            right: '-6px',
                                            background: 'var(--background)',
                                            borderRadius: '50%',
                                            width: '24px',
                                            height: '24px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                                            zIndex: 10,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <IonIcon name={showPhoto ? "eye-outline" : "eye-off-outline"} style={{ fontSize: '12px', opacity: 0.7 }} />
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '2px' }}>
                                        <span className="rr-mask">{data.kname}</span>
                                    </div>
                                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '700', opacity: 0.6 }}>
                                        <span className="rr-mask">{data.hakbun}</span>
                                    </div>
                                    <div style={{ fontSize: '12px', lineHeight: '1.4', opacity: 0.8 }}>
                                        <div style={{ fontWeight: '600' }}><span className="rr-mask">{stdInfo.compNm}</span></div>
                                        <div><span className="rr-mask">{data.hakgwa}</span></div>
                                        <div style={{ opacity: 0.6, fontSize: '11px', marginTop: '2px' }}><span className="rr-mask">{data.hakjukStatu}</span></div>
                                    </div>
                                </div>
                            </div>

                            {isLegacyVersion ? (
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginTop: '10px',
                                    marginBottom: '10px'
                                }}>
                                    <button
                                        onClick={() => {
                                            try {
                                                if (typeof window.Android !== 'undefined') {
                                                    window.Android.openLibraryQR();
                                                }
                                            } catch (e) {
                                                console.error("Failed to open library QR:", e);
                                            }
                                        }}
                                        style={{
                                            background: 'var(--card-background)',
                                            border: '1px solid var(--card-border)',
                                            borderRadius: '16px',
                                            width: '100%',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                            color: 'var(--text-color)',
                                            transition: 'transform 0.1s ease, background-color 0.2s'
                                        }}
                                        className="qr-btn"
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                background: 'var(--notice-hover)',
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                            }}>
                                                <IonIcon name="qr-code-outline" style={{ fontSize: '18px' }} />
                                            </div>
                                            <span style={{ fontSize: '15px', fontWeight: '700' }}>중앙도서관 출입증 QR 열기</span>
                                        </div>
                                        <IonIcon name="chevron-forward-outline" style={{ opacity: 0.4 }} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="tab-capsule">
                                        <div
                                            className="tab-bg-pill"
                                            style={{
                                                transform: activeTab === 'idCard' ? 'translateX(0%)' : 'translateX(100%)'
                                            }}
                                        />
                                        <button
                                            className={`tab-item-btn ${activeTab === 'idCard' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('idCard')}
                                        >
                                            학생증
                                        </button>
                                        <button
                                            className={`tab-item-btn ${activeTab === 'library' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('library')}
                                        >
                                            도서관 출입증
                                        </button>
                                    </div>

                                    <div style={{
                                        width: '200px',
                                        height: '200px',
                                        margin: '0 auto',
                                        background: isDarkMode ? '#221a1b' : '#ffffff',
                                        borderRadius: '24px',
                                        padding: '16px',
                                        boxSizing: 'border-box',
                                        boxShadow: isDarkMode ? 'none' : '0 8px 24px rgba(0,0,0,0.06)',
                                        border: isDarkMode ? '1px solid #4a3335' : 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            filter: isBlurred ? 'blur(6px)' : 'none',
                                            opacity: isBlurred ? 0.45 : 1,
                                            transition: 'filter 0.3s, opacity 0.3s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            {qrDataUrl ? (
                                                <img
                                                    src={qrDataUrl}
                                                    className="rr-block"
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                    alt="QR Code"
                                                />
                                            ) : (
                                                <DummyQR isDarkMode={isDarkMode} />
                                            )}
                                        </div>

                                        {!isBlurred && activeQrValue && !qrDataUrl && (
                                            <div className="spinner" style={{ position: 'absolute' }} />
                                        )}

                                        {activeQrValue === 'pending' && !isQrRequestFailed && (
                                            <div style={{
                                                position: 'absolute',
                                                top: 0, left: 0, right: 0, bottom: 0,
                                                background: overlayBg,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '12px',
                                                zIndex: 3
                                            }}>
                                                <div className="spinner" style={{ borderLeftColor: isDarkMode ? '#ff8888' : '#c70000', borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', marginBottom: '10px' }} />
                                                <span style={{
                                                    color: isDarkMode ? '#cccccc' : '#666666',
                                                    fontSize: '12px',
                                                    fontWeight: '600'
                                                }}>
                                                    QR 코드를 불러오는 중...
                                                </span>
                                            </div>
                                        )}

                                        {isQrRequestFailed && (
                                            <div style={{
                                                position: 'absolute',
                                                top: 0, left: 0, right: 0, bottom: 0,
                                                background: overlayBg,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '12px',
                                                zIndex: 2
                                            }}>
                                                <div style={{
                                                    background: isDarkMode ? 'rgba(255, 122, 122, 0.15)' : 'rgba(199, 0, 57, 0.08)',
                                                    color: isDarkMode ? '#ff8888' : '#c70000',
                                                    padding: '6px 14px',
                                                    borderRadius: '20px',
                                                    fontSize: '12px',
                                                    fontWeight: '800',
                                                    marginBottom: '6px'
                                                }}>
                                                    오류 발생
                                                </div>
                                                <span style={{
                                                    color: isDarkMode ? '#cccccc' : '#666666',
                                                    fontSize: '11px',
                                                    fontWeight: '600'
                                                }}>
                                                    나중에 다시 시도해보세요
                                                </span>
                                            </div>
                                        )}

                                        {activeTab === 'library' && !qrValues.library && (
                                            <div style={{
                                                position: 'absolute',
                                                top: 0, left: 0, right: 0, bottom: 0,
                                                background: overlayBg,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '12px',
                                                zIndex: 2
                                            }}>
                                                {isQrRequestFailed ? (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                try {
                                                                    if (typeof window.Android !== 'undefined') {
                                                                        window.Android.openLibraryQR();
                                                                    }
                                                                } catch (e) {
                                                                    console.error("Failed to open library QR:", e);
                                                                }
                                                            }}
                                                            style={{
                                                                background: isDarkMode ? '#ff6b6b' : 'var(--button-background, #ffd2d2)',
                                                                color: isDarkMode ? '#1a0507' : 'var(--button-text, #c70000)',
                                                                padding: '8px 16px',
                                                                borderRadius: '20px',
                                                                fontSize: '13px',
                                                                fontWeight: '800',
                                                                border: isDarkMode ? 'none' : '1px solid rgba(199, 0, 0, 0.15)',
                                                                cursor: 'pointer',
                                                                width: 'auto',
                                                                display: 'inline-block',
                                                                textAlign: 'center',
                                                                boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
                                                                marginBottom: '8px'
                                                            }}
                                                            className="badge-btn"
                                                        >
                                                            QR코드 열기
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                try {
                                                                    if (typeof window.Android !== 'undefined') {
                                                                        window.Android.openLibraryQRSettingsModal();
                                                                    }
                                                                } catch (e) {
                                                                    console.error("Failed to open library QR settings modal:", e);
                                                                }
                                                            }}
                                                            style={{
                                                                background: isDarkMode ? '#ff6b6b' : 'var(--button-background, #ffd2d2)',
                                                                color: isDarkMode ? '#1a0507' : 'var(--button-text, #c70000)',
                                                                padding: '8px 16px',
                                                                borderRadius: '20px',
                                                                fontSize: '13px',
                                                                fontWeight: '800',
                                                                border: isDarkMode ? 'none' : '1px solid rgba(199, 0, 0, 0.15)',
                                                                cursor: 'pointer',
                                                                width: 'auto',
                                                                display: 'inline-block',
                                                                textAlign: 'center',
                                                                boxShadow: '0 3px 8px rgba(0,0,0,0.15)'
                                                            }}
                                                            className="badge-btn"
                                                        >
                                                            출입증 설정
                                                        </button>
                                                        <span style={{
                                                            color: isDarkMode ? '#cccccc' : '#666666',
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            marginTop: '10px',
                                                            textAlign: 'center',
                                                        }}>
                                                            모든 정보가 정확하게<br />입력되었는지 확인해주세요.
                                                        </span>

                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {!isBlurred && activeQrValue && activeTab === 'library' && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            marginTop: '14px',
                                            color: 'var(--text-secondary)',
                                            fontWeight: '700',
                                            opacity: 0.85
                                        }}>
                                            <button
                                                onClick={handleRefresh}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    padding: '4px 0',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'var(--text-secondary)',
                                                    borderRadius: '50%',
                                                    outline: 'none',
                                                    width: 'fit-content',
                                                    height: '28px',
                                                    fontSize: '13px'
                                                }}
                                                className={`refresh-btn`}
                                                aria-label="QR 코드 새로고침"
                                            >
                                                <IonIcon name="refresh-outline" style={{ fontSize: '16px', marginRight: '5px' }} />
                                                <span>{timeLeft}초 후 새로고침</span>
                                            </button>

                                            <span style={{ opacity: 0.3, fontSize: '10px', marginLeft: '3px' }}>|</span>

                                            <button
                                                onClick={() => {
                                                    try {
                                                        if (typeof window !== 'undefined' && typeof window.Android !== 'undefined') {
                                                            window.Android.openLibraryQRSettingsModal();
                                                        }
                                                    } catch (e) {
                                                        console.error("Failed to open library QR settings modal:", e);
                                                    }
                                                }}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    padding: '4px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: 'var(--text-secondary)',
                                                    outline: 'none',
                                                    width: 'fit-content',
                                                    height: '28px',
                                                    fontSize: '13px'
                                                }}
                                                className={`refresh-btn`}
                                                aria-label="출입증 설정"
                                            >
                                                <IonIcon name="settings-outline" style={{ fontSize: '16px', marginRight: '5px' }} />
                                                출입증 설정
                                            </button>
                                        </div>
                                    )}

                                    {!isBlurred && activeQrValue && activeTab === 'idCard' && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px',
                                            marginTop: '14px',
                                            color: 'var(--text-secondary)',
                                            opacity: 0.85,
                                            fontSize: '13px',
                                            height: '28px'
                                        }}>
                                            <IonIcon name="time-outline" style={{ fontSize: '16px' }} />
                                            <span>남은 시간&nbsp; {formatTime(idCardTimeLeft)}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </motion.div>
            </motion.div>

            <style jsx>{`
                .modal-card {
                    transition: box-shadow 0.4s ease-out;
                    box-shadow: 0px 0px 0px rgba(0,0,0,0);
                }
                .modal-card-shadow {
                    box-shadow: 0px 15px 45px rgba(0,0,0,0.3) !important;
                }

                .watermark {
                    position: absolute;
                    bottom: -30px;
                    right: -30px;
                    width: 180px;
                    height: 180px;
                    background-image: url('https://i.imgur.com/7H10dVS.png');
                    background-size: contain;
                    background-repeat: no-repeat;
                    background-position: bottom right;
                    opacity: 0.04;
                    pointer-events: none;
                    z-index: 0;
                }
                @media (prefers-color-scheme: dark) {
                    .watermark {
                        filter: grayscale(100%) brightness(1000%);
                        opacity: 0.015;
                    }
                }
                @keyframes hologramShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }

                .tab-capsule {
                    display: flex;
                    position: relative;
                    background: var(--card-background);
                    border-radius: 14px;
                    padding: 4px;
                    margin-bottom: 20px;
                    border: 1px solid var(--card-border);
                }
                .tab-bg-pill {
                    position: absolute;
                    top: 4px;
                    left: 4px;
                    width: calc(50% - 4px);
                    height: calc(100% - 8px);
                    background: var(--background);
                    border-radius: 10px;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
                    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .tab-item-btn {
                    flex: 1;
                    text-align: center;
                    padding: 8px 0;
                    font-size: 13px;
                    font-weight: 700;
                    border-radius: 10px;
                    background: transparent;
                    border: none;
                    color: var(--text-color);
                    opacity: 0.6;
                    z-index: 1;
                    cursor: pointer;
                    transition: opacity 0.2s, transform 0.1s active;
                    display: inline-block;
                    width: auto;
                }
                .tab-item-btn.active {
                    opacity: 1;
                }
                .tab-item-btn:active {
                    transform: scale(0.98);
                    background-color: transparent !important;
                }
                .badge-btn:active {
                    transform: scale(0.96);
                }
                .spinner {
                    border: 3px solid rgba(0, 0, 0, 0.1);
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border-left-color: var(--button-text, #c70000);
                    animation: spin 1s ease infinite;
                }
                .refresh-btn {
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s;
                }
                .refresh-btn:hover {
                    background-color: var(--notice-hover, rgba(0, 0, 0, 0.05));
                }
                @media (prefers-color-scheme: dark) {
                    .refresh-btn:hover {
                        background-color: rgba(255, 255, 255, 0.08);
                    }
                }
                .refresh-btn:active {
                    transform: scale(0.92);
                }
                .refresh-btn.spinning {
                    animation: spin 0.6s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .qr-btn {
                    transition: transform 0.1s ease, background-color 0.2s;
                }
                .qr-btn:active {
                    transform: scale(0.98);
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </motion.div>
    );
};

export default StudentIDModal;
