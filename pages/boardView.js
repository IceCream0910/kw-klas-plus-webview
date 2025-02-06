import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import IonIcon from '@reacticons/ionicons';
import Spacer from "./components/spacer";
import { KLAS } from "../lib/klas";

export default function BoardViewWrapper() {
  const router = useRouter();
  const { boardNo, masterNo } = router.query;

  if (!boardNo || !masterNo) return null;

  return <BoardView key={`${boardNo}-${masterNo}`} />;
}

function BoardView() {
  const router = useRouter();
  const { boardNo, masterNo } = router.query;
  const [data, setData] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [requestData, setRequestData] = useState({ path: null, token: null, subj: null, yearHakgi: null });
  const [readyToFetch, setReadyToFetch] = useState(false);

  useEffect(() => {
    window.receivedData = function (token, subj, yearHakgi, path) {
      if (!token || !subj || !yearHakgi || !path) return;
      setRequestData({ path, token, subj, yearHakgi });
    };

  }, []);

  useEffect(() => {
    if (boardNo && masterNo && requestData.path && requestData.token && requestData.subj && requestData.yearHakgi) {
      setReadyToFetch(true);
    }
  }, [boardNo, masterNo, requestData]);

  useEffect(() => {
    if (!readyToFetch) return;
    const fetchData = () => {
      KLAS(`https://klas.kw.ac.kr/std/lis/sport/${requestData.path}/BoardStdView.do`, requestData.token, {
        "cmd": "select",
        "selectYearhakgi": requestData.yearHakgi,
        "selectSubj": requestData.subj,
        "selectChangeYn": "Y",
        boardNo,
        masterNo,
        "storageId": "CLS_BOARD"
      })
        .then(result => setData(result))
        .catch(error => console.error(error));
    };

    fetchData();
  }, [readyToFetch]);

  useEffect(() => {
    if (!data) return;

    const fetchAttachment = async (atchFileId) => {
      try {
        KLAS("https://klas.kw.ac.kr/common/file/UploadFileList.do", requestData.token, {
          "attachId": atchFileId,
          "storageId": "CLS_BOARD"
        })
          .then(result => setAttachment(result))
          .catch(error => console.error(error));
      } catch (error) {
        console.error(error);
      }
    }

    if (data && data.board.atchFileId) {
      fetchAttachment(data.board.atchFileId);
    }
  }, [data]);

  if (!data) return (
    <main>
      <Spacer y={20} />
      <div className="skeleton" style={{ height: '30px', width: '30%', marginBottom: '10px' }} />
      <div className="skeleton" style={{ height: '10px', width: '40%' }} />
      <Spacer y={20} />
      <div className="skeleton" style={{ height: '200px', width: '100%' }} />
      <Spacer y={20} />
      <div className="skeleton" style={{ height: '50px', width: '100%' }} />
      <Spacer y={15} />
      <div className="skeleton" style={{ height: '50px', width: '100%' }} />
    </main>
  );

  if (!data.board)
    return (
      <main>
        <Spacer y={20} />
        {JSON.stringify(data)}
        <h2>게시글을 찾을 수 없습니다.</h2>
      </main>
    );

  return (
    <main>
      <Spacer y={20} />
      <h2 style={{
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
      }}>{data.board.title}</h2>
      <Spacer y={15} />
      <span style={{ fontSize: '15px' }}>
        <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='people-outline' />
        <span style={{ marginLeft: '5px', opacity: .7 }}>{data.board.userNm}</span>
      </span><br />
      <span style={{ fontSize: '15px' }}>
        <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='time-outline' />
        <span style={{ marginLeft: '5px', opacity: .7 }}>{new Date(data.board.registDt).toLocaleString()}</span>
      </span><br />
      <span style={{ fontSize: '15px' }}>
        <IonIcon style={{ position: 'relative', top: '2px', color: '#ff7661' }} name='analytics-outline' />
        <span style={{ marginLeft: '5px', opacity: .7 }}>{data.board.readCnt}회 조회됨</span>
      </span><br />
      <Spacer y={15} />

      {data.board.content && data.board.content.replace(/<style([\s\S]*?)<\/style>/gi, ' ')
        .replace(/<script([\s\S]*?)<\/script>/gi, ' ')
        .replace(/(<(?:.|\n)*?>)/gm, ' ')
        .replace(/\s+/gm, ' ').length > 0 && (
          <>
            <div className="board-content" dangerouslySetInnerHTML={{ __html: data.board.content }} />
            <Spacer y={20} />
          </>
        )}

      {attachment && attachment.length > 0 && attachment.map((file, index) => (
        <button key={index} onClick={() => router.push(`https://klas.kw.ac.kr/${file.download}`)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--card-background)', width: '50px', height: '40px', borderRadius: '10px' }}>
              <IonIcon name='attach-outline' />
            </span>
            <span style={{ width: '100%' }}>
              {file.fileName}
              <span style={{ background: 'var(--button-background)', padding: '3px 5px', borderRadius: '10px', fontSize: '12px', position: 'relative', left: '5px', top: '-1px', opacity: .8 }}>
                {file.fileSize < 1024 ? `${file.fileSize} B` : file.fileSize < 1048576 ? `${(file.fileSize / 1024).toFixed(2)} KB` : file.fileSize < 1073741824 ? `${(file.fileSize / 1048576).toFixed(2)} MB` : `${(file.fileSize / 1073741824).toFixed(2)} GB`}
              </span>
            </span>
          </div>
        </button>
      ))}
      <Spacer y={40} />
      {data.boardPre && (
        <button
          onClick={() => {
            router.push(`/boardView?boardNo=${data.boardPre.boardNo}&masterNo=${data.boardPre.masterNo}`);
          }}
          style={{
            padding: '10px 15px',
            borderRadius: '20px',
            border: '1px solid var(--card-background)',
            fontSize: '14px',
          }}
        >
          <span style={{ opacity: 0.6 }}>이전 글</span><br />
          {data.boardPre.title}
        </button>
      )}

      <Spacer y={15} />

      {data.boardNex && (
        <button
          onClick={() => {
            router.push(`/boardView?boardNo=${data.boardNex.boardNo}&masterNo=${data.boardNex.masterNo}`);
          }}
          style={{
            padding: '10px 15px',
            borderRadius: '20px',
            border: '1px solid var(--card-background)',
            fontSize: '14px',
          }}
        >
          <span style={{ opacity: 0.6 }}>다음 글</span><br />
          {data.boardNex.title}
        </button>
      )}
      <Spacer y={30} />
    </main>
  );
}