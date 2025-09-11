import { motion } from 'framer-motion';
import IonIcon from '@reacticons/ionicons';
import Spacer from '../common/spacer';

const StudentIDModal = ({ isOpen, onClose, data, stdInfo }) => {
    if (!isOpen) return null;

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
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '80%',
                    maxWidth: '400px',
                    height: '65vh',
                    maxHeight: '600px',
                    background: 'var(--card-background)',
                    borderRadius: '15px',
                    boxShadow: '0px 10px 30px rgba(0,0,0,0.2)',
                    padding: '20px',
                    boxSizing: 'border-box',
                }}
            >
                <img
                    src="https://i.imgur.com/7H10dVS.png"
                    style={{
                        width: '30px',
                        objectFit: 'contain',
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        filter: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'grayscale(100%) brightness(1000%)' : 'none'
                    }}
                />
                {data && stdInfo && (
                    <>
                        <img src={stdInfo.fileUrl} style={{ width: '40%', objectFit: 'contain', borderRadius: '10px' }} />
                        <Spacer y={20} />
                        <motion.h2 layoutId="name" style={{ marginBottom: '5px' }}>
                            {data.kname}
                            <motion.div layoutId="number" style={{ opacity: 0.4, fontSize: '13px' }}>
                                {data.hakbun}
                            </motion.div>
                        </motion.h2>
                        <Spacer y={5} />
                        <div style={{ opacity: 0.8, fontSize: '14px' }}>
                            광운대학교 {stdInfo.compNm}
                            <motion.div layoutId="hakgwa">{data.hakgwa}</motion.div>
                            <Spacer y={10} />
                            <motion.div layoutId="status">{data.hakjukStatu}</motion.div>
                        </div>

                        <div style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '0',
                            width: '100%',
                            padding: '0 15px',
                            boxSizing: 'border-box'
                        }}>
                            <button
                                onClick={() => Android.openLibraryQR()}
                                style={{
                                    background: 'var(--background)',
                                    borderRadius: '10px',
                                    width: '100%'
                                }}
                            >
                                <IonIcon name="qr-code-outline" style={{ position: 'relative', top: '3px' }} />
                                &nbsp;&nbsp;QR 코드
                                <IonIcon name="chevron-forward-outline" style={{ position: 'relative', top: '2px', float: 'right' }} />
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
};

export default StudentIDModal;
