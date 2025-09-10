import { useState, useEffect } from "react";
import { KLAS } from "../../lib/core/klas";
import IonIcon from "@reacticons/ionicons";
import { motion } from "framer-motion";
import Spacer from "../../components/common/spacer";

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
            <h2 style={{ marginBottom: '20px', marginTop: '20px' }}>모바일 학생증</h2>
            <button onClick={() => Android.closeModal()} style={{ background: 'var(--card-background)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute', top: '20px', right: '20px' }}>
                <IonIcon name="close-outline" style={{ fontSize: '20px' }} />
            </button>
            <Spacer y={10} />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {(data && stdInfo) && (
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div style={{ position: 'relative', width: '35%' }}>
                                <button
                                    onClick={togglePhotoVisibility}
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        zIndex: 10,
                                        background: 'var(--notice-hover)',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '35px',
                                        height: '35px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        opacity: 0.8
                                    }}
                                >
                                    <IonIcon name={showPhoto ? "eye-off-outline" : "eye-outline"} style={{ fontSize: '20px' }} />
                                </button>

                                <motion.div
                                    animate={{
                                        rotateY: showPhoto ? 0 : 180,
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 30
                                    }}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        transformStyle: 'preserve-3d',
                                        perspective: '1000px'
                                    }}
                                >
                                    <motion.div
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            position: 'absolute',
                                            backfaceVisibility: 'hidden',
                                            opacity: showPhoto ? 1 : 0,
                                            transition: 'opacity 0.3s'
                                        }}
                                    >
                                        <img src={stdInfo.fileUrl} style={{ width: '100%', objectFit: 'cover', borderRadius: '20px' }} />
                                    </motion.div>

                                    <motion.div
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            background: 'var(--card-background)',
                                            borderRadius: '20px',
                                            transform: 'rotateY(180deg)',
                                            backfaceVisibility: 'hidden',
                                            position: 'absolute',
                                            opacity: showPhoto ? 0 : 1,
                                            transition: 'opacity 0.3s'
                                        }}
                                    >
                                        <IonIcon name="person" style={{ fontSize: '50px', opacity: 0.6 }} />
                                    </motion.div>
                                </motion.div>
                            </div>
                            <div>
                                <motion.h2 layoutId="name" style={{ marginBottom: '5px' }}><motion.div layoutId="number" style={{ opacity: .4, fontSize: '16px' }}>{data.hakbun}</motion.div>{data.kname}</motion.h2>
                                <Spacer y={5} />
                                <div style={{ opacity: .8, fontSize: '14px' }}>
                                    광운대학교 {stdInfo.compNm}
                                    <motion.div layoutId="hakgwa">{data.hakgwa}</motion.div>
                                    <Spacer y={10} />
                                    <motion.div layoutId="status">{data.hakjukStatu}</motion.div>
                                </div>

                                <Spacer y={20} />
                                <button onClick={() => Android.openLibraryQR()}
                                    style={{ background: 'var(--card-background)', borderRadius: '10px', width: '100%' }}>
                                    <IonIcon name="qr-code-outline" style={{ position: 'relative', top: '3px' }} />&nbsp;&nbsp;QR 코드
                                    <IonIcon name="chevron-forward-outline" style={{ position: 'relative', top: '2px', float: 'right' }} />
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>

            <style jsx global>{`
            body {
                background: transparent;
                padding: 0.3em 1.3em 2em 1.3em;
                margin:0;
                overflow: hidden;
                width: 90dvw;
            }
            `}
            </style>
        </main >
    );
}