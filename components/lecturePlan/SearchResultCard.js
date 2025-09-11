import Spacer from '../common/spacer';
import IonIcon from '@reacticons/ionicons';
import { getLectureStatus, generateLecturePlanId } from '../../lib/lecturePlan/searchLecturePlanUtils';

const SearchResultCard = ({ item, onLecturePlanClick }) => {
    const status = getLectureStatus(item);
    const lectureId = generateLecturePlanId(item);

    const handleClick = () => {
        if (status.isAccessible) {
            onLecturePlanClick(lectureId);
        }
    };

    return (
        <div
            className={status.isAccessible ? "card" : "card non-anim"}
            style={{
                padding: "10px 15px",
                opacity: status.isAccessible ? 1 : 0.5,
                marginBottom: '15px'
            }}
            onClick={handleClick}
        >
            <span style={{ fontSize: '16px' }}>
                <b>
                    {item.gwamokKname}
                    {status.isClosed && "(폐강)"}
                    {status.isNotUploaded && "(미입력)"}
                </b>
            </span>&nbsp;
            <span style={{ opacity: .8, fontSize: '16px' }}>
                ({item.openMajorCode}-{item.openGrade}-{item.openGwamokNo}-{item.bunbanNo})
            </span>
            <Spacer y={1} />
            <span>
                <IonIcon style={{
                    fontSize: '14px',
                    position: 'relative',
                    top: '2px',
                    opacity: .5
                }} name='person-outline' />
                <span style={{
                    fontSize: '14px',
                    marginLeft: '5px',
                    opacity: .8
                }}>
                    {item.memberName}
                </span>
            </span><br />
            <span style={{ fontSize: '15px' }}>
                <IonIcon style={{
                    fontSize: '13px',
                    position: 'relative',
                    top: '2px',
                    opacity: .5
                }} name='time-outline' />
                <span style={{
                    fontSize: '13px',
                    marginLeft: '5px',
                    opacity: .5
                }}>
                    {item.codeName1} | {item.hakjumNum}학점/{item.sisuNum}시간
                </span>
            </span>
            <Spacer y={5} />
        </div>
    );
};

export default SearchResultCard;
