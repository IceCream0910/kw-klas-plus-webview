import { useRouter } from "next/router";
import IonIcon from '@reacticons/ionicons';

const AttachmentItem = ({ file }) => {
    const router = useRouter();

    const formatFileSize = (size) => {
        if (size < 1024) return `${size} B`;
        if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`;
        if (size < 1073741824) return `${(size / 1048576).toFixed(2)} MB`;
        return `${(size / 1073741824).toFixed(2)} GB`;
    };

    const handleDownload = () => {
        router.push(`https://klas.kw.ac.kr/${file.download}`);
    };

    return (
        <button onClick={handleDownload}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'var(--card-background)',
                    width: '50px',
                    height: '40px',
                    borderRadius: '10px'
                }}>
                    <IonIcon name='attach-outline' />
                </span>
                <span style={{ width: '100%' }}>
                    {file.fileName}
                    <span style={{
                        background: 'var(--button-background)',
                        padding: '3px 5px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        position: 'relative',
                        left: '5px',
                        top: '-1px',
                        opacity: 0.8
                    }}>
                        {formatFileSize(file.fileSize)}
                    </span>
                </span>
            </div>
        </button>
    );
};

export default AttachmentItem;
