import { useOnlineLecture } from '../lib/lecture/useOnlineLecture';
import OnlineLectureHeader from '../components/lecture/OnlineLectureHeader';
import OnlineLectureCard from '../components/lecture/OnlineLectureCard';
import OnlineLectureLoadingSkeleton from '../components/lecture/OnlineLectureLoadingSkeleton';
import EmptyState from '../components/common/EmptyState';

export default function Page() {
  const {
    filteredList,
    excludeFinished,
    handleToggleChange
  } = useOnlineLecture();

  return (
    <main className="online-lecture-page">
      <OnlineLectureHeader
        excludeFinished={excludeFinished}
        onToggleChange={handleToggleChange}
      />

      <div className="online-lecture-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {!filteredList && <div className="grid-state"><OnlineLectureLoadingSkeleton /></div>}

        {filteredList && filteredList.length === 0 && (
          <div className="grid-state"><EmptyState/></div>
        )}

        {filteredList && filteredList.map((item, index) => (
          <OnlineLectureCard key={index} item={item} />
        ))}
      </div>
    </main>
  );
}
