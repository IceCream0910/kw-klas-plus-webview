import { useRouter } from "next/router";
import Spacer from "./components/spacer";
import LoadingSkeleton from "./components/LoadingSkeleton";
import BoardMetadata from "./components/BoardMetadata";
import AttachmentItem from "./components/AttachmentItem";
import BoardNavigation from "./components/BoardNavigation";
import { useBoardData, useBoardDetail } from "./components/useBoardData";

export default function BoardViewWrapper() {
  const router = useRouter();
  const { boardNo, masterNo } = router.query;

  if (!boardNo || !masterNo) return null;

  return <BoardView key={`${boardNo}-${masterNo}`} />;
}

function BoardView() {
  const router = useRouter();
  const { boardNo, masterNo } = router.query;
  const requestData = useBoardData();
  const { data, attachment } = useBoardDetail(requestData, boardNo, masterNo);

  if (!data) {
    return (
      <main>
        <Spacer y={20} />
        <LoadingSkeleton type="detail" />
      </main>
    );
  }

  if (!data.board) {
    return (
      <main>
        <Spacer y={20} />
        {JSON.stringify(data)}
        <h2>게시글을 찾을 수 없습니다.</h2>
      </main>
    );
  }

  const hasContent = data.board.content &&
    data.board.content.replace(/<style([\s\S]*?)<\/style>/gi, ' ')
      .replace(/<script([\s\S]*?)<\/script>/gi, ' ')
      .replace(/(<(?:.|\n)*?>)/gm, ' ')
      .replace(/\s+/gm, ' ').length > 0;

  return (
    <main>
      <Spacer y={20} />
      <h2 style={{
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
      }}>{data.board.title}</h2>
      <Spacer y={15} />

      <BoardMetadata
        author={data.board.userNm}
        registDate={data.board.registDt}
        readCount={data.board.readCnt}
      />

      <Spacer y={15} />

      {hasContent && (
        <>
          <div className="board-content" dangerouslySetInnerHTML={{ __html: data.board.content }} />
          <Spacer y={20} />
        </>
      )}

      {attachment && attachment.length > 0 && attachment.map((file, index) => (
        <AttachmentItem key={index} file={file} />
      ))}

      <BoardNavigation
        prevPost={data.boardPre}
        nextPost={data.boardNex}
      />

      <Spacer y={30} />
    </main>
  );
}