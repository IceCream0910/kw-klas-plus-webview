import { useRouter } from "next/router";
import { useEffect, useState } from 'react';
import { sanitizeBoardHtml } from '../lib/board/sanitizeBoardHtml';
import Spacer from "../components/common/spacer";
import LoadingSkeleton from "../components/common/LoadingSkeleton";
import BoardMetadata from "../components/board/BoardMetadata";
import AttachmentItem from "../components/board/AttachmentItem";
import BoardNavigation from "../components/board/BoardNavigation";
import { useBoardData, useBoardDetail } from "../lib/useBoardData";

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

  return (
    <main className="board-view-page">
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

      <BoardContent key={data.board.content} content={data.board.content} />

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

function BoardContent({ content }) {
  const [html, setHtml] = useState('');
  useEffect(() => { setHtml(sanitizeBoardHtml(content)); }, [content]);
  if (!html.trim()) return null;
  return <><div className="board-content" dangerouslySetInnerHTML={{ __html: html }} /><Spacer y={20} /></>;
}
