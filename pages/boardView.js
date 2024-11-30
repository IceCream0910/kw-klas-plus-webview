import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import IonIcon from '@reacticons/ionicons';
import Spacer from "./components/spacer";

export default function BoardView() {
  const router = useRouter();
  const { boardNo, masterNo } = router.query;
  const [data, setData] = useState(null);
  const [requestData, setRequestData] = useState({ path: null, token: null, subj: null, yearHakgi: null });

  useEffect(() => {
    window.receivedData = function (token, subj, yearHakgi, path) {
      if (!token || !subj || !yearHakgi || !path) return;
      setRequestData({ path, token, subj, yearHakgi });
    };
    Android.completePageLoad();
  }, []);

  useEffect(() => {
    if (!boardNo || !masterNo) return;

    const fetchData = () => {
      fetch("/api/board/boardView", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: requestData.path, token: requestData.token, subj: requestData.subj, yearHakgi: requestData.yearHakgi, boardNo, masterNo }),

      })
        .then((response) => response.json())
        .then((data) => {
          setData(data);
        })
        .catch((error) => {
          console.error(error);
        });
    };

    fetchData();
  }, [boardNo, masterNo]);

  if (!data) return <main>
    <Spacer y={20} />
    <div className="skeleton" style={{ height: '30px', width: '30%', marginBottom: '10px' }} />
    <div className="skeleton" style={{ height: '10px', width: '40%' }} />
    <Spacer y={20} />
    <div className="skeleton" style={{ height: '200px', width: '100%' }} />
    <Spacer y={20} />
    <div className="skeleton" style={{ height: '50px', width: '100%' }} />
    <Spacer y={15} />
    <div className="skeleton" style={{ height: '50px', width: '100%' }} />
  </main>;
  if (!data.board) return <main>게시글이 존재하지 않습니다.</main>;

  return (
    <main>
      <Spacer y={20} />
      <h2>{data.board.title}</h2>
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

      <div className="board-content" dangerouslySetInnerHTML={{ __html: data.board.content }} />
      <Spacer y={20} />

      {data.boardPre &&
        <button onClick={() => router.push(`/boardView?boardNo=${data.boardPre.boardNo}&masterNo=${data.boardPre.masterNo}`, null, { shallow: false })} style={{ padding: '10px 15px', borderRadius: '20px', border: '1px solid var(--card-background)', fontSize: '14px' }}><span style={{ opacity: .6 }}>이전 글</span><br />{data.boardPre.title}</button>
      }

      <Spacer y={15} />

      {data.boardNex &&
        <button onClick={() => router.push(`/boardView?boardNo=${data.boardNex.boardNo}&masterNo=${data.boardNex.masterNo}`, null, { shallow: false })} style={{ padding: '10px 15px', borderRadius: '20px', border: '1px solid var(--card-background)', fontSize: '14px' }}><span style={{ opacity: .6 }}>다음 글</span><br />{data.boardNex.title}</button>
      }

    </main>
  );
}
