import { useRanking } from '../lib/hooks/useRanking';
import RankingHeader from './components/RankingHeader';
import RankingCard from './components/RankingCard';
import RankingLoadingSkeleton from './components/RankingLoadingSkeleton';
import RankingEmptyState from './components/RankingEmptyState';

export default function Grade() {
  const { rank } = useRanking();

  return (
    <main>
      <RankingHeader />

      {rank ? (
        rank.length === 0 ? (
          <RankingEmptyState />
        ) : (
          rank.slice().reverse().map((data, index) => (
            <RankingCard key={index} data={data} />
          ))
        )
      ) : (
        <RankingLoadingSkeleton />
      )}
      <br /><br /><br />
    </main>
  );
}