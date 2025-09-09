import IonIcon from '@reacticons/ionicons';

const BoardMetadata = ({ author, registDate, readCount }) => (
    <>
        <span style={{ fontSize: '15px' }}>
            <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='people-outline' />
            <span style={{ marginLeft: '5px', opacity: 0.7 }}>{author}</span>
        </span><br />
        <span style={{ fontSize: '15px' }}>
            <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='time-outline' />
            <span style={{ marginLeft: '5px', opacity: 0.7 }}>
                {new Date(registDate).toLocaleString()}
            </span>
        </span><br />
        <span style={{ fontSize: '15px' }}>
            <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='analytics-outline' />
            <span style={{ marginLeft: '5px', opacity: 0.7 }}>{readCount}회 조회됨</span>
        </span>
    </>
);

export default BoardMetadata;
