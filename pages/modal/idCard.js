import { useState, useEffect } from "react";
import { KLAS } from "../../lib/klas";
import IonIcon from "@reacticons/ionicons";
import { motion } from "framer-motion";
import Spacer from "../components/spacer";

export default function IdCard() {
    const [token, setToken] = useState("");
    const [data, setData] = useState(null);
    const [stdInfo, setStdInfo] = useState(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.receiveToken = function (receivedToken) {
                if (!receivedToken) return;
                setToken(receivedToken);
            };
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
            })
    }, [token]);

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
                            <img src={stdInfo.fileUrl} style={{ width: '35%', objectFit: 'cover', borderRadius: '20px' }} />
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