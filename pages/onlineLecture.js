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
    <main>
      <OnlineLectureHeader
        excludeFinished={excludeFinished}
        onToggleChange={handleToggleChange}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {!filteredList && <OnlineLectureLoadingSkeleton />}

        {filteredList && filteredList.length === 0 && (
          <EmptyState/>
        )}

        {filteredList && filteredList.map((item, index) => (
          <OnlineLectureCard key={index} item={item} />
        ))}
      </div>
    </main>
  );
}