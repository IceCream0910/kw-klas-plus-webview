import { useState, useEffect, useRef, use } from 'react';
import Head from 'next/head';
import ReactMarkdown from 'react-markdown';
import IonIcon from '@reacticons/ionicons';
import LoadingComponent from './components/loader';

export default function Home() {
    const [subjList, setSubjList] = useState(null);
    const [input, setInput] = useState('');
    const [token, setToken] = useState("");
    const [chat, setChat] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);
    const abortControllerRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (input.trim()) {
            const newQuestion = { type: 'question', content: input.trim() };
            setChat(prevChat => [...prevChat, newQuestion]);
            setInput('');
            setIsLoading(true);
            await sendMessage([...chat, newQuestion]);
        }
    };

    useEffect(() => {
        window.receiveToken = function (receivedToken) {
            if (!receivedToken) return;
            setToken(receivedToken);
        };
        window.receiveSubjList = function (receivedSubjList) {
            if (!receivedSubjList) return;
            setSubjList(JSON.parse(receivedSubjList)[0].subjList);
        };

        //Android.completePageLoad();
    }, []);


    const sendMessage = async (conversation) => {
        try {
            abortControllerRef.current = new AbortController();
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversation, subjList: JSON.stringify(subjList), token }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            // 새 답변 메시지를 추가합니다.
            setChat(prevChat => [...prevChat, { type: 'answer', content: '' }]);

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunkValue = decoder.decode(value);
                const lines = chunkValue.split('\n\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.type === 'content') {
                                setChat(prevChat => {
                                    const newChat = [...prevChat];
                                    const lastMessage = newChat[newChat.length - 1];
                                    lastMessage.content += data.message;
                                    return newChat;
                                });
                            }
                        } catch (error) {
                            console.error("Error parsing JSON:", error);
                        }
                    }
                }
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Fetch aborted');
            } else {
                console.error("Error fetching response:", error);
                setChat(prevChat => [...prevChat, { type: 'answer', content: "서버에 오류가 생겼어요. 잠시 후 다시 시도해주세요." }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleStopResponse = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chat]);

    return (
        <div>
            <Head>
                <title>KLAS GPT</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main>
                <div className='messages-container' ref={scrollRef}>
                    {chat.length === 0 && (
                        <>
                            <div className='profile-card'>
                                <h3>궁금한 것을 물어보세요!</h3>
                                <span>AI가 KLAS에서 정보를 불러와 답변해줍니다. Beta 기능이므로 작동이 불안정할 수 있습니다.</span>
                                <br />
                                <h4>이렇게 보내보세요</h4>
                                <button onClick={() => setInput('공지사항에서 수강신청자료집 찾아줘')} style={{ background: 'var(--background)', marginTop: '5px' }}>공지사항에서 수강신청 자료집 찾아줘</button>
                                <button onClick={() => setInput(`${subjList && subjList[0].name} 출석 현황 알려줘`)} style={{ background: 'var(--background)', marginTop: '5px' }}>{subjList && subjList[0].name} 출석 현황 알려줘</button>
                                <button onClick={() => setInput(`${subjList && subjList[0].name} 최근 공지사항 보여줘`)} style={{ background: 'var(--background)', marginTop: '5px' }}>{subjList && subjList[Math.floor(Math.random() * subjList.length)].name} 최근 공지사항 보여줘</button>
                                <button onClick={() => setInput(`${subjList && subjList[0].name} 미제출 과제 있어?`)} style={{ background: 'var(--background)', marginTop: '5px' }}>{subjList && subjList[0].name} 미제출 과제 있어?</button>
                                <button onClick={() => setInput('오늘의 학식 메뉴')} style={{ background: 'var(--background)', marginTop: '5px' }}>오늘 학식 메뉴 알려줘</button>
                                <button onClick={() => setInput('이번 달 학사일정')} style={{ background: 'var(--background)', marginTop: '5px' }}>이번 달 학사일정 알려줘</button>
                                <br />
                                <span style={{ fontSize: '12px', opacity: .5, marginTop: '5px' }}>* KLAS에 있는 학사 정보를 제 3자(OpenAI)에게 전송하는 것에 동의하는 것으로 간주합니다. <a href="/privacy" target='_blank' style={{ color: 'inherit' }}>개인정보 처리방침</a></span>
                            </div>
                        </>
                    )}
                    {chat.map((item, index) => (
                        <div key={index} className={`message`}>
                            {item.type === 'question' && <IonIcon name="person-circle" style={{ fontSize: '30px' }} />}
                            <div style={{ maxWidth: item.type === 'question' ? '80%' : '100%' }}>
                                <ReactMarkdown>{item.content}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <LoadingComponent />
                    )}
                </div>
            </main>

            <form onSubmit={handleSubmit} className='chat-input-container'>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="메시지를 입력하세요"
                    disabled={isLoading}
                    className='chat-input'
                />
                {isLoading ? (
                    <button type="button" onClick={handleStopResponse}>
                        <IonIcon name="stop" />
                    </button>
                ) : (
                    <button type="submit">
                        <IonIcon name="send" />
                    </button>
                )}
                <span style={{ fontSize: '12px', opacity: .5 }}>AI가 생성한 답변은 정확하지 않을 수 있습니다.</span>
            </form>
        </div>
    );
}