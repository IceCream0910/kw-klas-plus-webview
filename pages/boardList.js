import { useState, useEffect } from "react";
import Spacer from "../components/common/spacer";
import BoardListItem from "../components/board/BoardListItem";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import EmptyState from "../components/common/EmptyState";
import Pagination from "../components/common/Pagination";
import { useBoardData, useBoardList } from "../lib/useBoardData";

export default function BoardList() {
  const [boardTitle, setBoardTitle] = useState("");
  const [page, setPage] = useState(0);
  const requestData = useBoardData();
  const { list, totalPages } = useBoardList(requestData, page);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setBoardTitle(urlParams.get('title'));
  }, []);

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handlePreviousPage = () => {
    if (page > 0) setPage(page - 1);
  };

  return (
    <main>
      <Spacer y={20} />
      <h2>{boardTitle || "게시판"}

        <button onClick={() => Android.openPage(`https://klas.kw.ac.kr/std/lis/sport/${requestData && requestData.path}/BoardListStdPage.do`)}
          style={{ float: 'right', border: '1px solid var(--card-background)', width: 'fit-content', fontSize: '14px', marginTop: '-7px', borderRadius: '20px', padding: '10px 15px' }}>
          KLAS에서 열기
        </button>
      </h2>
      <Spacer y={15} />

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {!list && <LoadingSkeleton type="list" />}
        {list && list.length === 0 && <EmptyState />}
        {list && list.map((item) => (
          <BoardListItem key={item.sortOrdr} item={item} />
        ))}
      </div>

      <Spacer y={20} />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPrevious={handlePreviousPage}
        onNext={handleNextPage}
      />
      <Spacer y={20} />
    </main>
  );
}
