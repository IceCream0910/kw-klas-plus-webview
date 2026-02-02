import { useState, useEffect } from "react";
import { KLAS } from "../../lib/core/klas";
import IonIcon from "@reacticons/ionicons";
import { motion } from "framer-motion";
import Spacer from "../../components/common/spacer";
import { SkeletonLayouts } from "../../components/common/Skeleton";

export default function IdCard() {
    const [token, setToken] = useState("");
    const [data, setData] = useState(null);
    const [stdInfo, setStdInfo] = useState(null);
    const [showPhoto, setShowPhoto] = useState(true);

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.receiveToken = function (receivedToken) {
                if (!receivedToken) return;
                setToken(receivedToken);
            };

            const savedPhotoVisibility = localStorage.getItem('idCardShowPhoto');
            if (savedPhotoVisibility !== null) {
                setShowPhoto(JSON.parse(savedPhotoVisibility));
            }
        }
    }, [])

    useEffect(() => {
        if (!token) return;

        KLAS("https://klas.kw.ac.kr/std/cps/inqire/AtnlcScreHakjukInfo.do", token)
            .then((data) => {
                setData(data);
            })
            .catch((error) => {
                console.error(error);
            });

        KLAS("https://klas.kw.ac.kr/mst/lis/evltn/LrnSttusStdOne.do", token, {})
            .then((data) => {
                setStdInfo(data);
            });
    }, [token]);

    const togglePhotoVisibility = () => {
        const newShowPhoto = !showPhoto;
        setShowPhoto(newShowPhoto);
        localStorage.setItem('idCardShowPhoto', JSON.stringify(newShowPhoto));
    };

    return (
        <main>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 5px 10px 5px' }}>
                <h2 style={{ margin: 0 }}>모바일 학생증</h2>
                <button
                    onClick={() => Android.closeModal()}
                    style={{
                        background: 'var(--card-background)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <IonIcon name="close-outline" style={{ fontSize: '20px' }} />
                </button>
            </div>

            <Spacer y={10} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4 }}
            >
                {!(data && stdInfo) ? (
                    <SkeletonLayouts.IdCard />
                ) : (
                    <div style={{
                        position: 'relative',
                        overflow: 'hidden',
                        padding: '10px'
                    }}>
                        <div style={{ display: 'flex', gap: '20px', alignItems: 'start' }}>
                            <div style={{ position: 'relative', width: '100px', flexShrink: 0 }}>
                                <motion.div onClick={() => Android.openPage('https://klas.kw.ac.kr/std/sys/optrn/MyNumberQrStdPage.do')}

                                    animate={{ rotateY: showPhoto ? 0 : 180 }}
                                    transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                                    style={{
                                        width: '100px',
                                        height: '130px',
                                        transformStyle: 'preserve-3d',
                                        perspective: '1000px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            position: 'absolute',
                                            backfaceVisibility: 'hidden',
                                            borderRadius: '16px',
                                            overflow: 'hidden',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                            background: '#f0f0f0'
                                        }}>
                                        <img src={stdInfo.fileUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>

                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        position: 'absolute',
                                        backfaceVisibility: 'hidden',
                                        borderRadius: '16px',
                                        background: 'var(--background)',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        transform: 'rotateY(180deg)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}>
                                        <IonIcon name="person" style={{ fontSize: '40px', opacity: 0.3 }} />
                                    </div>
                                </motion.div>

                                <div onClick={togglePhotoVisibility} style={{
                                    position: 'absolute',
                                    bottom: '-10px',
                                    right: '-10px',
                                    background: 'var(--background)',
                                    borderRadius: '50%',
                                    width: '28px',
                                    height: '28px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                    zIndex: 10,
                                    cursor: 'pointer'
                                }}>
                                    <IonIcon name={showPhoto ? "eye-outline" : "eye-off-outline"} style={{ fontSize: '14px', opacity: 0.7 }} />
                                </div>
                            </div>

                            <div style={{ flex: 1, paddingTop: '5px' }}>
                                <motion.div layoutId="name" style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>
                                    {data.kname}
                                </motion.div>
                                <motion.div layoutId="number" style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: '800', opacity: 0.6 }}>
                                    {data.hakbun}
                                </motion.div>
                                <div style={{ fontSize: '13px', lineHeight: '1.5', opacity: 0.8 }}>
                                    <div style={{ fontWeight: '600' }}>{stdInfo.compNm}</div>
                                    <div>{data.hakgwa}</div>
                                    <div>{data.hakjukStatu}</div>
                                </div>
                            </div>
                        </div>
                        <Spacer y={25} />

                        <button
                            onClick={() => Android.openLibraryQR()}
                            style={{
                                background: 'var(--background)',
                                borderRadius: '16px',
                                width: '100%',
                                border: 'none',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'transform 0.1s active'
                            }}
                            className="qr-btn"
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    background: 'var(--card-background)',
                                    width: '30px',
                                    height: '30px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                }}>
                                    <IonIcon name="qr-code-outline" style={{ fontSize: '16px' }} />
                                </div>
                                <span style={{ fontSize: '16px', fontWeight: '600' }}>QR 코드 보기</span>
                            </div>
                            <IonIcon name="chevron-forward-outline" style={{ opacity: 0.4 }} />
                        </button>
                    </div>
                )}
                <Spacer y={15} />
            </motion.div>

            <style jsx global>{`
            body {
                background: transparent;
                padding: 10px;
                margin:0;
                overflow: hidden;
                box-sizing: border-box;
                width: 100vw;
            }
            .qr-btn:active {
                transform: scale(0.98);
            }
            `}</style>
        </main >
    );
}